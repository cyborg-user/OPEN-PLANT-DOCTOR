import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
# WEATHER MODEL
weather_df = pd.read_csv("weather_dataset.csv")
weather_features = [
    "avg_temperature",
    "humidity",
    "wind_speed",
    "precipitation",
    "storm_events_7d"
]
X_weather = weather_df[weather_features]
y_weather = weather_df["weather_risk_score"]
weather_model = RandomForestRegressor(n_estimators=100, random_state=42)
weather_model.fit(X_weather, y_weather)
joblib.dump(weather_model, "weather_model.pkl")
print("Weather model trained")
# DISASTER MODEL
disaster_df = pd.read_csv("disaster_dataset.csv")
disaster_features = [
    "earthquake_count_30d",
    "wildfire_hotspots_7d",
    "flood_events_30d",
    "volcanic_activity"
]
X_disaster = disaster_df[disaster_features]
y_disaster = disaster_df["disaster_risk_score"]
disaster_model = RandomForestRegressor(n_estimators=100, random_state=42)
disaster_model.fit(X_disaster, y_disaster)
joblib.dump(disaster_model, "disaster_model.pkl")
print("Disaster model trained")
# ECONOMY MODEL
stock_df = pd.read_csv("stock_dataset.csv")
economy_features = [
    "gold_volatility",
    "oil_volatility",
    "market_index_change",
    "trade_volume_change"
]
X_economy = stock_df[economy_features]
y_economy = stock_df["economic_risk_score"]
economy_model = RandomForestRegressor(n_estimators=100, random_state=42)
economy_model.fit(X_economy, y_economy)
joblib.dump(economy_model, "economy_model.pkl")
print("Economy model trained")
print("\nAll domain models trained successfully.")