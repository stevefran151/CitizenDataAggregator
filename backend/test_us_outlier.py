import numpy as np
from ml_service import detector

# Force initialization
detector._initial_fit()

# US approximate center (Kansas)
us_lat = 39.8
us_long = -98.5

# Test various values
test_values = [20, 50, 100, 150, 300]
print(f"--- US TEST RESULTS ---")
for val in test_values:
    is_outlier = detector.check_outlier(val, us_lat, us_long)
    print(f"VAL:{val} -> OUTLIER:{is_outlier}")

print(f"--- DONE ---")
