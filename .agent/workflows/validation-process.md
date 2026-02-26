---
description: Mechovate Multi-Stage Environmental Data Validation Pipeline
---

# Environmental Data Validation Workflow

This document outlines the end-to-end process of how Mechovate ensures the integrity of citizen-contributed environmental data.

## 1. Client-Side Sanity (Frontend)
- **Coordinate Geometry**: Validates that Latitude is between -90/90 and Longitude is between -180/180.
- **Parametric Check**: Ensures numeric fields are parsed correctly before transmission.
- **Identity Injection**: Attaches the `userRole` (Citizen vs Expert) from the local session to the payload.

## 2. Scientific Range Validation (Backend - Heavy Logic)
- **WHO/EPA Standards**: Cross-references individual metrics against biological and physical limits.
  - *Example*: PM2.5 values > 500 or pH levels > 14 are flagged as physically impossible (Hard Failure).
- **Metric-Context Mapping**: Ensures the submitted value matches the category (e.g., Decibels for Noise, NTU for Water).

## 3. Satellite Telemetry Cross-Reference (Live GIS)
- **Live Sync**: Queries the **Open-Meteo Air Quality API** (or similar GRS/satellite models) for the exact lat/long.
- **Delta Analysis**: Compares the user's value with the satellite model.
  - **Threshold**: Discrepancies > 100 units trigger an automatic "Outlier" flag.
  - **Expert Bypass**: If the reporter is an Expert, a conflict doesn't auto-reject; it triggers a high-priority "Discovery Review."

## 4. Multi-model ML Anomaly Detection (Statistical)
- **Ensemble Voting**: The system runs three concurrent unsupervised learning models:
  1. **Isolation Forest**: Detects global outliers in the dataset.
  2. **Local Outlier Factor (LOF)**: Detects local density deviations (clusters).
  3. **One-Class SVM**: Defines the boundary of "normal" environmental conditions.
- **Majority Vote**: If 2 out of 3 models flag the point as a statistical anomaly, the record is marked for triage.

## 5. Trust-Based Triage (Identity Logic)
- **Citizen Path**: Anomalies are auto-rejected or marked "Needs Review" depending on satellite confidence.
- **Expert Path**: Expert data is marked **"Valid"** by default to prevent data loss but flagged as **"Pending Review"** if ML detects a novelty. This allows experts to "Discover" new environmental trends that the ML hasn't seen before.

## 6. Human-In-The-Loop (HITL) Protocol
- **The Queue**: Observations with "Needs Review" status are funneled into the **Quality Control** dashboard.
- **Expert Audit**: Other environmental experts review the discrepancy between the user data, ML score, and Satellite model to provide the final "Ground Truth" confirmation.
