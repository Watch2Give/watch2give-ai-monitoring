from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from langchain_core.messages import AnyMessage, SystemMessage, ToolMessage, HumanMessage
from langchain_groq import ChatGroq

from groq import Groq

import base64
from typing import TypedDict, Annotated
import operator
import re

from dotenv import load_dotenv

from datetime import datetime

from utils.logger import setup_logger

logger = setup_logger("PhotoValidatorAgent", "photo_validator", "photo.log")

# Just for logging purposes
logger.info("")
logger.info("=" * 60)
logger.info(f"NEW RUN STARTED - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
logger.info("=" * 60)
logger.info("")

load_dotenv()

@tool
def validate_donation_photo(photo_path: str) -> str:
    """
    Uses the Groq vision model to extract a description of the donation/giving photo.
    This tool does NOT determine if it's valid or not — it just returns the description.
    """
    try:
        with open(photo_path, "rb") as img_file:
            encoded = base64.b64encode(img_file.read()).decode("utf-8")
        data_uri = f"data:image/jpeg;base64,{encoded}"
    except FileNotFoundError:
        logger.error(f"Photo not found: {photo_path}")
        return "Image file error"

    client = Groq()

    completion = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Describe what's happening in this image."},
                    {"type": "image_url", "image_url": {"url": data_uri}}
                ]
            }
        ],
        temperature=0.4,
        max_tokens=512
    )

    return completion.choices[0].message.content

class AgentState(TypedDict):
    messages: Annotated[list[AnyMessage], operator.add]
    score: float
    validation_result: bool

class PhotoValidatorAgent:
    def __init__(self, model, tools, system_prompt: str = "", threshold: float = 0.75):
        self.system = system_prompt or "You are a donation validator. Assign a score and decide if the photo is valid."
        self.tools = {t.name: t for t in tools}
        self.model = model.bind_tools(tools)
        self.threshold = threshold

        graph = StateGraph(AgentState)
        graph.add_node("llm", self.call_model)
        graph.add_node("action", self.take_action)
        graph.add_conditional_edges("llm", self.exists_action, {True: "action", False: END})
        graph.add_edge("action", "llm")
        graph.set_entry_point("llm")

        self.graph = graph.compile()

    def exists_action(self, state: AgentState) -> bool:
        if state.get("model_failed"):
            logger.warning("[PhotoValidatorAgent] - Model failed, stopping flow.")
            return False
        last_message = state["messages"][-1]
        logger.info(f"[PhotoValidatorAgent] - Checking for tool calls in message")
        return len(last_message.tool_calls) > 0

    def call_model(self, state: AgentState) -> AgentState:
        messages = state["messages"]
        if self.system:
            messages = [SystemMessage(content=self.system)] + messages
        logger.info(f"[PhotoValidatorAgent] - Calling model with messages")
        try:
            response = self.model.invoke(messages)
            score = self.extract_score(response.content)
            validation = score >= self.threshold
            return {
                "messages": messages + [response],
                "score": score,
                "validation_result": validation
            }
        except Exception as e:
            logger.error(f"[PhotoValidatorAgent] - {e}")
            return {
                **state,
                "validation_result": False,
                "score": 0.0,
                "model_failed": True
            }

    def take_action(self, state: AgentState):
        tool_call = state["messages"][-1].tool_calls
        results = []

        for t in tool_call:
            logger.debug(f"[PhotoValidatorAgent] - Calling tool: {t['name']}")
            if t["name"] not in self.tools:
                logger.warning("Tool not found")
                result = "Tool not found."
            else:
                args = t.get("args", {})
                photo_path = args.get("photo_path", "")
                result = self.tools[t["name"]].invoke(photo_path)

            # Short-circuit: if result is error, do not return to loop
            if result == "Image file error":
                logger.warning("Stopping early due to image error.")
                return {
                    "messages": state["messages"] + [ToolMessage(
                        tool_call_id=t["id"],
                        name=t["name"],
                        content=str(result)
                    )],
                    "score": 0.0,
                    "validation_result": False
                }
            
            results.append(
                ToolMessage(
                    tool_call_id=t["id"],
                    name=t["name"],
                    content=str(result)
                )
            )
        return {
            "messages": state["messages"] + results
        }

    def extract_score(self, text: str) -> float:
        match = re.search(r"(score[:\s]*)(\d+(\.\d+)?)", text.lower())
        if match:
            return float(match.group(2))
        logger.warning("No score found in model output.")
        return 0.0


def test(photo_path: str) -> dict:

    logger.info("")
    logger.info("[2/4] Running PhotoValidatorAgent...")
    model = ChatGroq(model_name="llama-3.3-70b-versatile")

    photo_agent = PhotoValidatorAgent(
        model,
        tools=[validate_donation_photo],
        system_prompt="""
        You are a donation validation agent. You'll be given a description of an image.
        Based on the description, determine whether the image clearly shows a successful donation,
        such as a child receiving a snack or a donation being handed over.
        Assign a score (0 to 1) based on how likely the image is valid, where 1 is highly valid.
        Reply with Score: <value> and explain why.
        """
    )

    photo_path = photo_path

    result = photo_agent.graph.invoke({
        "messages": [
            HumanMessage(content=f"Please validate this donation photo: {photo_path}")
        ],
        "score": 0.0,
        "validation_result": False
    })
    
    val_result = result['validation_result']
    score = result['score']
    logger.info(f"[PhotoValidatorAgent] - Score: {score}")
    logger.info(f"[PhotoValidatorAgent] - Result: {val_result}")
    logger.info("[PhotoValidatorAgent] Execution completed.")
    logger.info("")
    return val_result, score


# Example usage
if __name__ == "__main__":
    result, score = test("../images/sharing.jpg")
    print("Final Result:", result)
    print("Score:", score)