import streamlit as st
import pandas as pd
import plotly.express as px
import numpy as np
import json
import os
import re
from datetime import datetime

# === Load AI Agent Logs ===
with open('master_flow.txt', 'r') as f:
    raw_logs = f.readlines()

def time_ago(timestamp_str: str) -> str:
    timestamp = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")
    now = datetime.now()
    diff = now - timestamp
    minutes = int(diff.total_seconds() // 60)

    if minutes < 60:
        return f"{minutes} minutes ago"
    elif minutes < 1440:
        return f"{minutes // 60} hours ago"
    else:
        return f"On {timestamp.strftime('%Y-%m-%d')}"

def parse_log_line(line):
    if not line.strip() or line.startswith("[Master Flow]"):
        return None

    timestamp_str = line[:23]
    try:
        timestamp = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S,%f").strftime("%Y-%m-%d %H:%M:%S")
        timestamp = time_ago(timestamp)
    except ValueError:
        return None

    log_type = "WARNING" if "[WARNING]" in line else "INFO"

    agent = None
    for a in ["RouterAgent", "PhotoValidatorAgent", "VaultDecider", "RewardAgent"]:
        if a in line:
            agent = a

    details = line[line.rfind("]")+1:].strip().replace('-', '')
    if "HTTP Request:" in details:
        return None

    return {
        "timestamp": timestamp,
        "type": log_type,
        "agent": agent,
        "details": details
    }

structured_logs = [parse_log_line(line) for line in raw_logs if parse_log_line(line)]
df_agents = pd.DataFrame(structured_logs)[::-1][:100]

# === Token Flow Heatmap (Simulated) ===
cities = ["New York", "Lagos", "Mumbai", "São Paulo", "Jakarta", "Berlin", "Tokyo"]
hours = [f"{h}:00" for h in range(6, 24)]
heatmap_data = pd.DataFrame(
    np.random.randint(100, 5000, size=(len(hours), len(cities))),
    columns=cities, index=hours
)

# === Vault Yield Data ===
result_path = os.path.join(os.path.dirname(__file__), "../data/result.json")
with open(result_path, 'r') as file:
    result = json.load(file)

vault = {
    "Vendor ID": [entry["vendor_id"] for entry in result],
    "APY (%)": [entry["vendor_apy"] for entry in result],
    "Total Staked Tokens": [entry["tokens"] for entry in result],
    "Chain": None
}
df_vaults = pd.DataFrame(vault)

# === Vendor Activity ===
vendor_activity = {
    "Vendor ID": [entry["vendor_id"] for entry in result],
    "Action": [entry["action"] for entry in result],
    "AdTokens": [entry["tokens"] for entry in result],
    "Proof Status": ['✅ Verified' if entry["validation_result"] else '🚫 Failed' for entry in result],
    "Proof Score": [entry["score"] for entry in result],
    "Reward Sent": [f"🎁 {entry['reward_type']} to {entry['viewer_id']}" if entry['reward_type'] else "❌ None" for entry in result]
}
df_vendor_logs = pd.DataFrame(vendor_activity)

# === Streamlit Layout ===
st.set_page_config(page_title="Watch2Give Dashboard", layout="wide")
st.title("🎛️ Watch2Give Admin Dashboard")

tab1, tab2, tab3, tab4 = st.tabs([
    "📊 Token Flow Heatmap", 
    "🤖 AI Agent Logs", 
    "📈 Vault Yields", 
    "🧾 Vendor Logs"
])

with tab1:
    st.subheader("AdToken Movement Heatmap")
    st.caption("Tokens generated per city by hour (simulated)")
    fig = px.imshow(
        heatmap_data,
        labels=dict(x="City", y="Time", color="AdTokens"),
        color_continuous_scale="blues",
        aspect="auto"
    )
    fig.update_layout(title="Hourly Token Flow Heatmap")
    st.plotly_chart(fig, use_container_width=True)

with tab2:
    st.subheader("Recent AI Agent Activity")
    st.dataframe(df_agents, hide_index=True)

with tab3:
    st.subheader("Vault APY Status")
    st.dataframe(df_vaults, hide_index=True)
    st.bar_chart(df_vaults, x="Vendor ID", y="Total Staked Tokens")

with tab4:
    st.subheader("Vendor Actions & Reward Logs")
    st.dataframe(df_vendor_logs, hide_index=True)

# === Sidebar ===
with st.sidebar:
    st.header("🔁 Controls")
    if st.button("Refresh Dashboard"):
        st.rerun()
    st.metric("Total Tokens Circulating", "58,942", "+12% today")
