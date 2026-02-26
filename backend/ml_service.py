from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler
import numpy as np
import joblib
import os
import validation_service

# Persistent model storage could be added here (e.g., joblib.dump)

class AdvancedOutlierDetector:
    def __init__(self):
        self.scaler = StandardScaler()
        # Initialize models
        # Contamination: expected proportion of outliers
        self.iso_forest = IsolationForest(contamination=0.1, random_state=42)
        # LOF for novelty detection requires novelty=True
        self.lof = LocalOutlierFactor(n_neighbors=20, novelty=True, contamination=0.1)
        self.oc_svm = OneClassSVM(nu=0.1, kernel="rbf", gamma=0.1)
        
        self.is_fitted = False
        
        # Initialize with synthetic data for MVP "cold start"
        self._initial_fit()

    def _initial_fit(self):
        # 1. Broad Baseline: Generate synthetic data for general regions
        n_per_region = 1000
        
        # Region 1: India (focus on TN)
        val_in = np.random.uniform(0, 150, (n_per_region, 1))
        lat_in = np.random.uniform(8, 38, (n_per_region, 1))
        long_in = np.random.uniform(68, 98, (n_per_region, 1))
        X_base_in = np.hstack([val_in, lat_in, long_in])
        
        # Region 2: USA (broad coverage)
        val_us = np.random.uniform(0, 150, (n_per_region, 1))
        lat_us = np.random.uniform(25, 50, (n_per_region, 1))
        long_us = np.random.uniform(-125, -65, (n_per_region, 1))
        X_base_us = np.hstack([val_us, lat_us, long_us])
        
        X_train_list = [X_base_in, X_base_us]

        # 2. Real Data Augmentation: Load scraped AQICN data
        try:
            import json
            if os.path.exists("training_data.json"):
                with open("training_data.json", "r") as f:
                    real_data = json.load(f)
                
                print(f"Loading {len(real_data)} real data points from AQICN...")
                
                # For each real point, generate a cluster to reinforce this as "normal"
                for point in real_data:
                    p_val = point.get("value", 0)
                    p_lat = point.get("lat", 0)
                    p_long = point.get("long", 0)
                    
                    if p_val > 0:
                        # Create cluster of 500 points around this real observation
                        # Value variance: +/- 10%, Location variance: +/- 0.5 deg
                        n_cluster = 500
                        c_vals = np.random.normal(p_val, p_val * 0.1, (n_cluster, 1))
                        c_lats = np.random.normal(p_lat, 0.5, (n_cluster, 1))
                        c_longs = np.random.normal(p_long, 0.5, (n_cluster, 1))
                        
                        X_cluster = np.hstack([c_vals, c_lats, c_longs])
                        X_train_list.append(X_cluster)
        except Exception as e:
            print(f"Error loading real training data: {e}")

        # Combine all data
        X_train = np.vstack(X_train_list)
        self.fit(X_train)

    def fit(self, X):
        """
        Retrain the models on new data X.
        X should be shape (n_samples, n_features) -> [value, lat, long]
        """
        if len(X) < 10:
            print("Not enough data to retrain, skipping.")
            return

        # Scale data
        self.scaler.fit(X)
        X_scaled = self.scaler.transform(X)

        # Fit models
        self.iso_forest.fit(X_scaled)
        self.lof.fit(X_scaled)
        self.oc_svm.fit(X_scaled)
        
        self.is_fitted = True
        print("Models retrained successfully.")

    def check_outlier(self, value, lat, long):
        """
        Returns True if outlier, False if valid (inlier).
        (Note: Function name logic swapped from previous simple service for clarity in ensemble)
        Actually, let's keep consistent: returns True if outlier.
        """
        if not self.is_fitted:
            self._initial_fit()
            
        features = np.array([[value, lat, long]])
        features_scaled = self.scaler.transform(features)

        # Scikit-learn convention: -1 for outlier, 1 for inlier
        # We convert to: -1 -> 1 (is outlier), 1 -> 0 (not outlier) for voting
        
        pred_iso = 1 if self.iso_forest.predict(features_scaled)[0] == -1 else 0
        pred_lof = 1 if self.lof.predict(features_scaled)[0] == -1 else 0
        pred_svm = 1 if self.oc_svm.predict(features_scaled)[0] == -1 else 0
        
        votes = pred_iso + pred_lof + pred_svm
        
        # Majority vote: if 2 or more models say outlier, it's an outlier
        is_outlier = votes >= 2
        
        return is_outlier

# Singleton instance
detector = AdvancedOutlierDetector()

import validation_service

def validate_observation(value: float, lat: float=0.0, long: float=0.0, type_cat: str="air", details: dict=None, is_expert: bool=False):
    """
    Returns (is_valid, validation_report, needs_review)
    """
    report = {
        "satellite_value": None,
        "standards": {},
        "ml_status": "Passed",
        "trust_level": "Expert" if is_expert else "Standard"
    }

    # 1. Range Check (Simplified Manual Validation)
    if details:
        is_range_valid, msg, std_report = validation_service.validator.validate_ranges(type_cat, details)
        report["standards"] = std_report
        # Experts still shouldn't post physically impossible values
        if not is_range_valid:
            return False, report, False


    # 2. Live External Check
    is_live_valid, live_msg, ref_val = validation_service.validator.check_live_data(type_cat, lat, long, details or {"value": value})
    report["satellite_value"] = ref_val
    if not is_live_valid:
        # If live check fails (e.g. 5x diff from satellite), experts are flagged for review instead of auto-rejection
        if is_expert:
            is_justified, reason, event_type = validation_service.validator.news_validator.verify_trend_from_news(type_cat, lat, long, value)
            if is_justified:
                report["ml_status"] = f"Satellite Conflict justified by News: {event_type}"
                report["news_justification"] = reason
            else:
                report["ml_status"] = "Live check conflict (Expert) - No News Support"
            return True, report, True
        else:
            return False, report, False

    # 3. ML Check
    is_outlier = detector.check_outlier(value, lat, long)
    
    # 4. Hybrid Trust Logic
    needs_review = False
    is_valid = not is_outlier

    if is_expert:
        # We trust experts more: even if ML says outlier, we check news for trends
        if is_outlier:
            is_justified, reason, event_type = validation_service.validator.news_validator.verify_trend_from_news(type_cat, lat, long, value)
            
            if is_justified:
                is_valid = True
                needs_review = True # Still flag for review but with news justification
                report["ml_status"] = f"Verified Trend: {event_type}"
                report["news_justification"] = reason
            else:
                is_valid = True
                needs_review = True
                report["ml_status"] = "Potential New Trend (Expert Outlier - No News Match)"
        
        # If no satellite data, expert data is considered "Valid" but flagged for meta-verification
        if ref_val is None:
            needs_review = True
            report["hitl_reason"] = "Expert Discovery: Verifying new region patterns"
    else:
        # Standard user logic: anomalies are rejected or flagged heavily
        if is_outlier:
            report["ml_status"] = "Outlier Detected (Standard User)"
            is_valid = False
            # We still might want to review it if it's "close" but for MVP we reject
        
        if ref_val is None:
            needs_review = True
            report["hitl_reason"] = "Unverified Source: No external baseline for this region"

    return is_valid, report, needs_review

def retrain_models(observations):
    """
    observations: List of dicts or objects with value, lat, long
    """
    data = []
    for obs in observations:
        # Only train on valid data to learn "normality"
        # Or train on all and specify contamination? 
        # Usually for outlier detection (OneClass), we want mostly normal data.
        # But IsolationForest works with mixed data.
        # For this MVP, let's assume we train on 'valid' labeled data.
        data.append([obs.value, obs.lat, obs.long])
    
    if data:
        detector.fit(np.array(data))
