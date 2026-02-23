import numpy as np
from ml_service import detector

# Force initialization
detector._initial_fit()

# Tamil Nadu approximate center
tn_lat = 11.1271
tn_long = 78.6569

# Test various values
test_values = [20, 50, 80, 150, 300]
print(f"--- TN TEST RESULTS ---")
for val in test_values:
    is_outlier = detector.check_outlier(val, tn_lat, tn_long)
    print(f"VAL:{val} -> OUTLIER:{is_outlier}")

print(f"--- DONE ---")
