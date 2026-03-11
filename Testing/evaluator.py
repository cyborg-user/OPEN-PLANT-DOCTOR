import pandas as pd
import joblib
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
class ModelEvaluator:
    def __init__(self, dataset_path, model_path):
        self.dataset_path = dataset_path
        self.model_path = model_path
        self.feature_columns = [
            "conflict_events_7d",
            "earthquake_count_30d",
            "wildfire_hotspots_7d",
            "avg_weather_severity_7d",
            "gold_volatility_7d",
            "flight_activity_change_7d"
        ]
    def load_data(self):
        df = pd.read_csv(self.dataset_path)
        X = df[self.feature_columns]
        y = df["risk_score"]
        return train_test_split(X, y, test_size=0.2, random_state=42)
    
    def evaluate(self):
        X_train, X_test, y_train, y_test = self.load_data()
        model = joblib.load(self.model_path)
        predictions = model.predict(X_test)
        # mae = mean_absolute_error(y_test, predictions)
        # rmse = mean_squared_error(y_test, predictions, squared=False)
        r2 = r2_score(y_test, predictions)
        results = {
            # "MAE": round(mae, 3),
            # "RMSE": round(rmse, 3),
            "R2_SCORE": round(r2, 3)
        }
        return results
if __name__ == "__main__":
    # dataset = "training_data.csv"
    # model = "risk_model.pkl"
    evaluator = ModelEvaluator(dataset, model)
    metrics = evaluator.evaluate()
    print("\n--- Model Evaluation Report ---\n")
    for metric, value in metrics.items():
        print(f"{metric}: {value}")