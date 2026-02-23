import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from gx_service import gx_validator
    
    print("Testing GX Validator...")
    
    # Test Air Quality (Valid)
    valid_air = {"aqi": 45, "pm2_5": 12}
    is_valid, report = gx_validator.validate_observation_details("air", valid_air)
    print(f"Valid Air: {is_valid}, Report: {report}")
    
    # Test Air Quality (Invalid)
    invalid_air = {"aqi": 600}
    is_valid, report = gx_validator.validate_observation_details("air", invalid_air)
    print(f"Invalid Air: {is_valid}, Report: {report}")
    
    # Test Water Quality (Valid)
    valid_water = {"ph": 7.2, "dissolved_oxygen": 8.5}
    is_valid, report = gx_validator.validate_observation_details("water", valid_water)
    print(f"Valid Water: {is_valid}, Report: {report}")

except ImportError as e:
    print(f"Import Error: {e}")
except Exception as e:
    print(f"Error: {e}")
