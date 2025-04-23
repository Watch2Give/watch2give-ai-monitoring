from fastapi import FastAPI, HTTPException

from pydantic import BaseModel

from agents.give_router import RouterAgent
from agents.reward_agent import RewardAgent
from agents.vault_decider import VaultDeciderAgent
from agents.photo_validator import test as validate_photo

from utils.logger import setup_logger

from datetime import datetime

# Initialize FastAPI app
app = FastAPI()

logger = setup_logger("API", "../logs/api", "api.log")

# -------------------------
# Pydantic Request Schemas
# -------------------------

class GiveRouterRequest(BaseModel):
    tokens: int
    vendor_id: str

class VaultRequest(BaseModel):
    tokens: int
    vendor_id: str

class RewardRequest(BaseModel):
    viewer_id: str
    verified_gives: int

class PhotoRequest(BaseModel):
    photo_path: str

# -------------------------
# API Endpoints
# -------------------------

@app.post("/agent/give-router")
def run_give_router(data: GiveRouterRequest):
    logger.info(f"[GiveRouter] Running GiveRouterAgent...")
    try:
        logger.info(f"[RouterAgent] - Received data: {data.model_dump_json()}")
        agent = RouterAgent()
        result = agent.run(data.model_dump())
        logger.info(f"[RouterAgent] - GiveRouter result: {result}")
        return result
    except Exception as e:
        logger.error(f"[RouterAgent] - GiveRouter Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/agent/vault-decider")
def run_vault_decider(data: VaultRequest):
    logger.info(f"[VaultDecider] Running VaultDeciderAgent...")
    try:
        logger.info(f"[VaultDecider] - Received data: {data.model_dump_json()}")
        agent = VaultDeciderAgent()
        result = agent.run(data.model_dump())
        logger.info(f"[VaultDecider] - VaultDecider result: {result}")
        return result
    except Exception as e:
        logger.error(f"[VaultDecider] - VaultDecider Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/agent/reward")
def run_reward(data: RewardRequest):
    logger.info(f"[RewardAgent] Running RewardAgent...")
    try:
        logger.info(f"[RewardAgent] - Received data: {data.model_dump_json()}")
        agent = RewardAgent()
        result = agent.run(data.model_dump())
        logger.info(f"[RewardAgent] - Reward result: {result}")
        return result
    except Exception as e:
        logger.error(f"[RewardAgent] - RewardAgent Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/agent/photo-validator")
def run_photo_validator(data: PhotoRequest):
    logger.info(f"[PhotoValidator] Running PhotoValidatorAgent...")
    try:
        logger.info(f"[PhotoValidator] - Received data: {data.model_dump_json()}")
        val_result, score = validate_photo(data.photo_path)
        logger.info(f"[PhotoValidator] - Validation result: {val_result}, Score: {score}")
        return {
            "validation_result": val_result,
            "score": score
        }

    except Exception as e:
        logger.error(f"[PhotoValidator] - PhotoValidator Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
