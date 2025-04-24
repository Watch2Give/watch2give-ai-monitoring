import streamlit as st
import pandas as pd
import plotly.express as px
import numpy as np
import requests

from datetime import datetime
import json

from pathlib import Path

from streamlit_autorefresh import st_autorefresh

# Auto-refresh every 5 seconds
st_autorefresh(interval=5000, key="log_refresh")

#==========================AI Agent==================================

BASE_DIR = Path(__file__).resolve().parent.parent
LOG_DIR = BASE_DIR / "ai-agents" / "logs"
structured_logs = []

st.sidebar.title("📁 Log Viewer")

# 🔄 ADDED: let user pick log file from logs/
log_folders = sorted([d for d in LOG_DIR.iterdir() if d.is_dir()])
selected_folder = st.sidebar.selectbox(
    "Select Agent Log Folder",
    options=log_folders,
    format_func=lambda x: x.name
)

log_files = sorted(list(selected_folder.glob("*.log")))
selected_log = st.sidebar.selectbox(
    "Select Log File",
    options=log_files,
    format_func=lambda x: x.name
)

# 🔄 ADDED: Read selected log file
if selected_log.exists():
    with open(selected_log, 'r', encoding="utf-8") as f:
        log_lines = f.readlines()
else:
    st.error("Log file not found.")
    log_lines = []



def time_ago(timestamp_str: str) -> str:
    timestamp = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")
    now = datetime.now()
    diff = now - timestamp
    minutes = int(diff.total_seconds() // 60)

    if minutes < 60:
        return f"{minutes} minutes ago"
    elif minutes < 1440:
        hours = minutes // 60
        return f"{hours} hours ago"
    else:
        days = minutes // 1440
        if days == 1:
            return f"Yesterday"
        else:
            # Get the actual date in YYYY-MM-DD format
            return f"{timestamp.strftime('%Y-%m-%d')}"


def parse_log_line(line):
    if not line.strip() or line.startswith("[Master Flow]"):
        return None

    timestamp_str = line[:23]
    try:
        timestamp = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S,%f").strftime("%H:%M:%S %Y-%m-%d")
        # timestamp = time_ago(timestamp)
    except ValueError:
        return None

    log_type = "INFO"
    if "[WARNING]" in line:
        log_type = "⚠️ WARNING"
    elif "[ERROR]" in line:
        log_type = "❌ ERROR"

    agent = None
    if "RouterAgent" in line:
        agent = "RouterAgent"
    elif "PhotoValidatorAgent" in line:
        agent = "PhotoValidatorAgent"
    elif "VaultDecider" in line:
        agent = "VaultDecider"
    elif "RewardAgent" in line:
        agent = "RewardAgent"

    details = line[line.rfind("]") + 1:].strip().replace("-", "")
    if "HTTP Request:" in details or details == "" or "NEW RUN STARTED" in details or "====" in details or "Received data" in details:
        return None

    return {
        "timestamp": timestamp,
        "type": log_type,
        "agent": agent,
        "details": details
    }


        
structured_logs = []
for line in log_lines:
    parsed = parse_log_line(line)
    if parsed:
        structured_logs.append(parsed)


# To convert to DataFrame:
df_agents = pd.DataFrame(structured_logs)[::-1][:100]


#==========================Token flow data==================================

response = requests.get("http://localhost:8000/get_all_token_flow")
data = response.json()
# Convert to DataFrame
heatmap_data = pd.DataFrame(data["data"])
# Set city as index if desired
heatmap_data.set_index("city", inplace=True)
heatmap_data = heatmap_data.T


#==========================Vault yield status==================================

# Mock Vault APY Data (Randomized for demo)


with open('../data/result.json', 'r') as file:
    result = json.load(file)  # Automatically parses JSON


if isinstance(result, dict):
    result = [result] 

vault = {
    "Vendor ID": [entry["vendor_id"] for entry in result],
    "APY (%)": [entry["vendor_apy"] for entry in result],
    "Staked Tokens": [entry["tokens"] for entry in result],
    "Chain": None
}

df_vaults = pd.DataFrame(vault)

#==========================Vendor Activity Logs==================================
# Mock Vendor Activity Logs


# Convert simulation result to vendor activity
vendor_activity = {
    "Vendor ID": [entry["vendor_id"] for entry in result],
    "Action": [entry["action"] for entry in result],
    "AdTokens": [entry["tokens"] for entry in result],
    "Proof Status": ['✅ Verified' if entry["validation_result"] else '🚫 Failed' for entry in result],
    "Proof Score": [entry["score"] for entry in result],
    "Reward Sent": [f"🎁 {entry['reward_type']} to {entry['viewer_id']}" if entry['reward_type'] else None for entry in result]
}


df_vendor_logs = pd.DataFrame(vendor_activity)


st.title("Watch2Give Admin Dashboard")

tab1, tab2, tab3, tab4 = st.tabs([
    "Token Flow Heatmap", 
    "AI Agents", 
    "Vault Yields", 
    "Vendor Logs"
])

with tab1:
    st.subheader("AdToken Movement Heatmap")
    st.caption("Tokens generated per city by hour (simulated)")
    
    # Interactive Plotly heatmap (better than static)
    fig = px.imshow(
        heatmap_data,
        labels=dict(x="City", y="Time", color="AdTokens"),
        color_continuous_scale="blues",
        aspect="auto"
    )
    fig.update_layout(title="Hourly Token Flow Heatmap")
    st.plotly_chart(fig, use_container_width=True)

    

with tab2:
    st.subheader("Active AI Agents")

    st.dataframe(df_agents, hide_index=True, use_container_width=True)
    

with tab3:
    st.subheader("Vault APY Status")
    # Show bar charts of staking yields per vendor

    st.dataframe(df_vaults, hide_index=True)

    # Create a copy for the chart with renamed column
    df_chart = df_vaults.rename(columns={"Staked Tokens": "Total Staked Tokens"})

    # APY Bar Chart
    st.bar_chart(df_chart, x="Vendor ID", y="Total Staked Tokens")


with tab4:
    st.subheader("🛒 Vendor Actions")
   
    
    st.dataframe(df_vendor_logs, hide_index=True)


# --- Sidebar Controls ---
with st.sidebar:
    st.header("Controls")
    if st.button("🔄 Refresh Data"):
        st.rerun()
    st.metric("Total Tokens Circulating", f"{heatmap_data.sum().sum()}")
