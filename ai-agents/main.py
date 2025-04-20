# Master LangGraph Orchestration: GiveRouter → PhotoValidator → VaultDecider → RewardAgent

from langgraph.graph import StateGraph, END
from typing import TypedDict, Optional

from agents.give_router import RouterAgent
from agents.photo_validator import test
from agents.vault_decider import VaultDeciderAgent
from agents.reward_agent import RewardAgent

from utils.logger import setup_logger  

import json
import os
from datetime import datetime

# --- Setup logger ---
logger = setup_logger("MainFlow", "main", "main.log")

# --- Shared State Across Agents ---
class GlobalState(TypedDict):
    tokens: int
    vendor_id: str
    vendor_apy: float
    status: Optional[str]
    score: float
    validation_result: bool
    action: Optional[str]
    selected_vault: Optional[str]
    viewer_id: str
    verified_gives: int
    reward_type: Optional[str]
    reward_status: Optional[str]
    photo_path: Optional[str]

# --- Wrapper for GiveRouterAgent ---
def give_router_node(state: GlobalState) -> GlobalState:
    logger.info("[1/4] Running GiveRouterAgent...")
    agent = RouterAgent()
    result = agent.run({
        "tokens": state["tokens"],
        "vendor_id": state["vendor_id"]
    })
    state["status"] = result.get("status", "not_transferred")
    state["action"] = state["status"]
    logger.info(f"[GiveRouter] Result: status={state['status']}")
    return state

# --- Wrapper for PhotoValidatorAgent ---
def photo_validator_node(state: GlobalState) -> GlobalState:
    logger.info("[2/4] Running PhotoValidatorAgent...")
    val_result, score = test(state.get("photo_path"))
    state["validation_result"] = val_result
    state["score"] = score
    logger.info(f"[PhotoValidator] Result: valid={val_result}, score={score}")
    return state

# --- Wrapper for VaultDeciderAgent ---
def vault_decider_node(state: GlobalState) -> GlobalState:
    logger.info("[3/4] Running VaultDeciderAgent...")
    agent = VaultDeciderAgent()
    result = agent.run({
        "tokens": state["tokens"],
        "vendor_id": state["vendor_id"]
    })
    state.update(result)
    logger.info(f"[VaultDecider] Result: action={state.get('action')}, selected_vault={state.get('selected_vault')}, apy={state.get('vendor_apy')}")
    return state

# --- Wrapper for RewardAgent ---
def reward_agent_node(state: GlobalState) -> GlobalState:
    logger.info("[4/4] Running RewardAgent...")
    agent = RewardAgent()
    result = agent.run({
        "viewer_id": state["viewer_id"],
        "verified_gives": state["verified_gives"]
    })
    state.update(result)
    logger.info(f"[RewardAgent] Result: reward={state.get('reward_type')}, status={state.get('reward_status')}")
    return state

# --- Master Graph ---
workflow = StateGraph(GlobalState)
workflow.add_node("give_router", give_router_node)
workflow.add_node("photo_validator", photo_validator_node)
workflow.add_node("vault_decider", vault_decider_node)
workflow.add_node("reward_agent", reward_agent_node)

workflow.set_entry_point("give_router")
workflow.add_edge("give_router", "photo_validator")
workflow.add_edge("photo_validator", "vault_decider")
workflow.add_edge("vault_decider", "reward_agent")
workflow.add_edge("reward_agent", END)

compiled = workflow.compile()

# --- End-to-End Test ---
if __name__ == "__main__":
    logger.info("")
    logger.info("=" * 80)
    logger.info(f"NEW RUN STARTED - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("=" * 80)
    logger.info("")

    initial_state = {
        "tokens": 20,
        "vendor_id": "vendor_456",
        "viewer_id": "user_123",
        "verified_gives": 22,
        "photo_path": "./images/sharing.jpg"
    }

    print("\n[Master Flow] Running end-to-end simulation...")
    logger.info("[Master Flow] Starting workflow execution...")

    result = compiled.invoke(initial_state)

    logger.info("[Master Flow] Execution complete.")
    print("\n+++++++++++++++++ Master Flow Simulation Ended +++++++++++++++++")

    logger.info("Saving result to ../data/result.json...")

    # Path to shared result.json
    data_path = os.path.join(os.path.dirname(__file__), "../data/result.json")

    try:
        if os.path.exists(data_path):
            with open(data_path, "r") as f:
                try:
                    existing = json.load(f)
                except json.decoder.JSONDecodeError:
                    existing = []
            if isinstance(existing, list):
                existing.append(result)
            else:
                existing = [existing, result]
        else:
            existing = [result]

        with open(data_path, "w") as f:
            json.dump(existing, f, indent=4)

        logger.info("Result successfully saved to shared /data/result.json")
        print("\n✅ Result saved to shared /data/result.json\n")
        logger.info("")
    except Exception as e:
        logger.error(f"Failed to save result.json: {e}")
        print("\n❌ Error saving result to shared /data/result.json\n")
        logger.info("")
