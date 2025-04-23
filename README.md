# AI Monitoring System – Watch2Give

This AI-powered module forms the backend intelligence layer of the **Watch2Give** platform. It enables real-time proof validation, anomaly detection, and visual monitoring of vendor activities using decentralized agent architecture.

---

## Project Structure

### `ai-agents/`
This folder contains the core logic and orchestration of monitoring agents:
- `agents/`: AI agents handling proof validation and analysis
- `api/`: FastAPI endpoints for internal communication and external triggers
- `images/`, `logs/`, `utils/`: Visual input, system logs, and reusable utilities
- `main.py`: Entry point that spins up the AI agent service
- `.env`: Environment configuration for API keys, tokens, etc.

### `monitor-dashboard/`
Streamlit-based visual interface for real-time monitoring:
- `app.py`: Main UI file, displays uploaded proof and alerts
- Connects with output from `data/result.json`

### `data/`
Shared storage for monitoring output:
- `result.json`: Logs and decision data from agents
- Used for both storage and dashboard rendering

---

## Getting Started

### 1. Set up virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Start the FastAPI agent service
```bash
cd ai-agents
uvicorn api.server:app --reload
```

### 4. Launch Streamlit dashboard
In another terminal:
```bash
cd monitor-dashboard
streamlit run app.py
```

---

## 📂 Output Example

The AI agents write decision logs to:
```
data/result.json
```

The dashboard reads this file and renders the actions visually.

---

## Technologies Used
- **FastAPI** for real-time API endpoints
- **Streamlit** for the monitoring dashboard
- **Custom AI Agents** for detecting anomalies and verifying proof
- **JSON** for logging & coordination

---

## Future Plans
- Connect to on-chain smart contract status for cross-verification
- Add image classification to validate donation proof
- Alert-based notification system
