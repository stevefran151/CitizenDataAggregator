import os
import sys
sys.path.append(os.path.join(os.getcwd(), 'backend'))

import models
import ml_service
from models import SessionLocal

models.init_db()
db = SessionLocal()

try:
    print("Running validation directly...")
    is_valid, validation_report, needs_review = ml_service.validate_observation(
        45.0, 13.0827, 80.2707, type_cat="air", details={"aqi": 45}
    )
    print(f"Is Valid: {is_valid}")
    print(f"Report: {validation_report}")
    print(f"Needs Review: {needs_review}")

    obs = models.Observation(
        type="air",
        value=45.0,
        lat=13.0827,
        long=80.2707,
        is_valid=is_valid,
        details={"aqi": 45},
        validation_report=validation_report,
        outlier_score=0.0,
        needs_review=needs_review,
        validation_status="pending" if needs_review else "auto"
    )
    print("Adding to DB...")
    db.add(obs)
    print("Committing...")
    db.commit()
    print("Success!")
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
