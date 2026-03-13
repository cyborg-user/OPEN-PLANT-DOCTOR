import pandas as pd
import numpy as np
rows = 8000
weather_data = {
    "avg_temperature": np.random.uniform(-10, 45, rows),
    "humidity": np.random.uniform(20, 100, rows),
    "wind_speed": np.random.uniform(0, 25, rows),
    "precipitation": np.random.uniform(0, 50, rows),
    "storm_events_7d": np.random.poisson(1, rows)
}
weather_df = pd.DataFrame(weather_data)
weather_risk = (
    weather_df["humidity"] * 0.2 +
    weather_df["wind_speed"] * 1.5 +
    weather_df["precipitation"] * 0.5 +
    weather_df["storm_events_7d"] * 5
)
weather_df["weather_risk_score"] = np.clip(weather_risk, 0, 100)
weather_df.to_csv("weather_dataset.csv", index=False)
print("weather_dataset.csv created")
disaster_data = {
    "earthquake_count_30d": np.random.poisson(2, rows),
    "wildfire_hotspots_7d": np.random.poisson(3, rows),
    "flood_events_30d": np.random.poisson(1, rows),
    "volcanic_activity": np.random.poisson(0.5, rows)
}
disaster_df = pd.DataFrame(disaster_data)
disaster_risk = (
    disaster_df["earthquake_count_30d"] * 8 +
    disaster_df["wildfire_hotspots_7d"] * 5 +
    disaster_df["flood_events_30d"] * 6 +
    disaster_df["volcanic_activity"] * 10
)
disaster_df["disaster_risk_score"] = np.clip(disaster_risk, 0, 100)
disaster_df.to_csv("disaster_dataset.csv", index=False)
print("disaster_dataset.csv created")
stock_data = {
    "gold_volatility": np.random.uniform(0, 1, rows),
    "oil_volatility": np.random.uniform(0, 1, rows),
    "market_index_change": np.random.uniform(-5, 5, rows),
    "trade_volume_change": np.random.uniform(-1, 1, rows)
}
stock_df = pd.DataFrame(stock_data)
stock_risk = (
    stock_df["gold_volatility"] * 20 +
    stock_df["oil_volatility"] * 20 +
    np.abs(stock_df["market_index_change"]) * 5 +
    np.abs(stock_df["trade_volume_change"]) * 10
)
stock_df["economic_risk_score"] = np.clip(stock_risk, 0, 100)
stock_df.to_csv("stock_dataset.csv", index=False)
print("stock_dataset.csv created")