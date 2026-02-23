import numpy as np
from ml_service import detector

# Force initialization
detector._initial_fit()

# Tamil Nadu approximate center
tn_lat = 11.1271
tn_long = 78.6569

# Test various values
test_values = [20, 50, 80, 150, 300]
print(f"Testing Tamil Nadu coordinates: Lat {tn_lat}, Long {tn_long}")

for val in test_values:
    is_outlier = detector.check_outlier(val, tn_lat, tn_long)
    print(f"Value: {val} -> Is Outlier? {is_outlier}")

# Compare with 'valid' location from synthetic data (e.g. US)
us_lat = 35.0
us_long = -100.0
print(f"\nTesting Synthetic 'Valid' coordinates: Lat {us_lat}, Long {us_long}")
for val in test_values:
    is_outlier = detector.check_outlier(val, us_lat, us_long)
    print(f"Value: {val} -> Is Outlier? {is_outlier}")
