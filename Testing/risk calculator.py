class RiskAggregator:

    def __init__(self):
        # weights can be tuned later
        self.disaster_weight = 0.4
        self.economy_weight = 0.3
        self.weather_weight = 0.3


    def calculate_final_score(self, disaster_score, economy_score, weather_score):

        final_score = (
            disaster_score * self.disaster_weight +
            economy_score * self.economy_weight +
            weather_score * self.weather_weight
        )

        return round(final_score, 2)


    def classify_risk(self, score):

        if score < 35:
            return "LOW"
        elif score < 65:
            return "MEDIUM"
        else:
            return "HIGH"


    def aggregate(self, disaster_result, economy_result, weather_result):

        disaster_score = disaster_result["score"]
        economy_score = economy_result["score"]
        weather_score = weather_result["score"]

        final_score = self.calculate_final_score(
            disaster_score,
            economy_score,
            weather_score
        )

        risk_level = self.classify_risk(final_score)

        return {
            "final_risk_score": final_score,
            "risk_level": risk_level,
            "model_breakdown": {
                "disaster_score": disaster_score,
                "economy_score": economy_score,
                "weather_score": weather_score
            }
        }


# prototype test
if __name__ == "__main__":

    disaster = {"score": 62}
    economy = {"score": 55}
    weather = {"score": 48}

    aggregator = RiskAggregator()

    result = aggregator.aggregate(disaster, economy, weather)

    print("\n--- Final Risk Analysis ---")
    print(result)