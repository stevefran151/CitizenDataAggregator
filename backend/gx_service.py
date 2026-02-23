import great_expectations as ge
import pandas as pd

class GXValidator:
    def __init__(self):
        # Standards replicated from validation_service for GX expectations
        self.standards = {
            "air": {
                "aqi": (0, 500),
                "pm2_5": (0, 500),
                "pm10": (0, 600),
                "co": (0, 50),
            },
            "water": {
                "ph": (0, 14),
                "dissolved_oxygen": (0, 20),
                "turbidity": (0, 1000)
            },
            "soil": {
                "ph": (0, 14),
                "moisture": (0, 100)
            },
            "noise": {
                "db": (0, 140)
            }
        }

    def validate_observation_details(self, type_cat, details):
        """
        Validates observation details using Great Expectations.
        Returns (is_valid, report)
        """
        if not details:
            return True, {"status": "No details to validate"}

        type_cat = type_cat.lower()
        std = self.standards.get(type_cat)
        if not std:
            return True, {"status": f"No GX standards for category: {type_cat}"}

        # Convert details to a pandas DataFrame for GX
        df = pd.DataFrame([details])
        
        # Ensure numeric types for columns we expect
        for col in std.keys():
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')

        # Create a GX Dataset from the DataFrame
        ge_df = ge.from_pandas(df)

        report = {}
        all_passed = True

        for column, (min_v, max_v) in std.items():
            if column in df.columns:
                # Expectation: Column values must be between min and max
                result = ge_df.expect_column_values_to_be_between(
                    column, 
                    min_value=min_v, 
                    max_value=max_v
                )
                
                passed = result.success
                report[column] = {
                    "range": f"{min_v}-{max_v}",
                    "valid": passed,
                    "engine": "Great Expectations"
                }
                
                if not passed:
                    all_passed = False

        return all_passed, report

gx_validator = GXValidator()
