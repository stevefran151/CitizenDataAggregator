import numpy as np
from ml_service import detector

# Force initialization (will load training_data.json)
detector._initial_fit()

# Delhi coordinates from scraper
delhi_lat = 28.7
delhi_long = 77.1

# Test values
# 576 was the scraped value. 
# 50 is a typical low value.
# 1000 is an extreme value.
test_values = [50, 150, 500, 576, 600, 1000]

print(f"--- DELHI TEST RESULTS (Lat {delhi_lat}, Long {delhi_long}) ---")
for val in test_values:
    is_outlier = detector.check_outlier(val, delhi_lat, delhi_long)
    print(f"VAL:{val} -> OUTLIER:{is_outlier}")

print(f"--- DONE ---")
