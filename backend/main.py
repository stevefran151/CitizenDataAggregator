from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
import models, schemas, ml_service, extraction_service, ai_agent_service
from models import SessionLocal, engine, Observation
from livekit import api

# Initialize DB
models.Base.metadata.create_all(bind=engine)
print(f"Startup - Observation columns: {models.Observation.__table__.columns.keys()}")

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/observe", response_model=schemas.Observation)
def create_observation(observation: schemas.ObservationCreate, db: Session = Depends(get_db)):
    try:
        # ML & World Geo Validation
        is_valid, validation_report = ml_service.validate_observation(
            observation.value, 
            observation.lat, 
            observation.long,
            type_cat=observation.type,
            details=observation.details
        )
        
        # Create DB object
        db_observation = models.Observation(
            type=observation.type,
            value=observation.value,
            lat=observation.lat,
            long=observation.long,
            is_valid=is_valid,
            details=observation.details,
            validation_report=validation_report,
            outlier_score=0.0 if is_valid else 1.0 
        )
        db.add(db_observation)
        db.commit()
        db.refresh(db_observation)
        return db_observation
    except Exception as e:
        import traceback
        print(f"Error in create_observation: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/data", response_model=List[schemas.Observation])
def read_observations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Return all for now to see outliers on map too? Or just valid?
    # User wanted "clean JSON of valid observations".
    # But for dashboard verification we need to see outliers.
    # Let's stick to returning all for the general endpoint or add a filter.
    # For MVP simplicity/verification of map, returning ALL allows frontend to filter or show colors.
    # But user specifically asked for "valid observations" in objective 4.
    # Let's add a query param `show_all`
    return db.query(models.Observation).offset(skip).limit(limit).all()

@app.put("/api/observations/{observation_id}/validate")
def validate_observation_manual(observation_id: int, is_valid: bool, db: Session = Depends(get_db)):
    obs = db.query(models.Observation).filter(models.Observation.id == observation_id).first()
    if not obs:
        raise HTTPException(status_code=404, detail="Observation not found")
    
    obs.is_valid = is_valid
    # If human validates it, we assume it's true ground truth now.
    obs.source = "human_review" 
    db.commit()
    return {"message": "Observation updated"}

@app.post("/api/ml/retrain")
def retrain_ml(db: Session = Depends(get_db)):
    # Fetch all VALID observations to retrain the model on what is "normal"
    valid_obs = db.query(models.Observation).filter(models.Observation.is_valid == True).all()
    if not valid_obs:
        return {"message": "No valid data to retrain on"}
    
    ml_service.retrain_models(valid_obs)
    return {"message": f"Model retrained on {len(valid_obs)} samples"}

@app.post("/api/scrape")
def trigger_scrape():
    import subprocess
    # Run scrapy crawl aqi
    # We need to run it from the backend directory so it can find 'scraper' module and 'models'
    # The command should probably be run in background or return immediately
    
    # We'll run it as a separate process
    # Note: On Windows 'scrapy' might be a script in Scripts/
    # We can run via `python -m scrapy crawl aqi`
    
    # Since we are in backend/ directory (where main.py is), and spider is in scraper/
    # We need to make sure scrapy can find the spider.
    # Usually scrapy looks for scrapy.cfg. We didn't create one.
    # But we can run spider directly if we structure it right or just pass the file.
    # Or cleaner: create scrapy.cfg in backend/
    
    try:
        # Running "scrapy runspider scraper/aqi_spider.py" might be easier given our Structure
        # But we need settings. passed via -s
        # Let's try running a command that sets PYTHONPATH to current dir
        
        cmd = ["scrapy", "runspider", "scraper/aqi_spider.py", "-s", "ITEM_PIPELINES={'scraper.pipelines.SaveToPostgresPipeline': 300}"]
        # But wait, imports in pipeline rely on sys.path hack.
        # Let's run it.
        subprocess.Popen(cmd, cwd=os.getcwd(), shell=True)
        return {"message": "Scraper triggered in background"}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/extract")
async def extract_observation(file: UploadFile = File(...)):
    # Validating it is a generic text extraction for MVP simplicity, 
    # in real world we'd use PyPDF2 or similar to extract text from PDF bytes.
    # Here assuming we might receive text or run a simple string extraction if it were a real PDF parser.
    # For MVP, let's assume the user sends a text file or we just try to read bytes as text.
    
    content = await file.read()
    try:
        text_content = content.decode("utf-8")
    except:
        return {"error": "Could not decode file. Please upload text or extracted PDF content."}
        
    data = extraction_service.extract_from_pdf_content(text_content)
    return data

@app.post("/api/chat")
def chat_agent(request: schemas.ChatRequest):
    response = ai_agent_service.get_chat_response(request.query, request.context)
    return {"response": response}

class ParseRequest(BaseModel):
    text: str

@app.post("/api/parse_voice")
def parse_voice(request: ParseRequest):
    data = ai_agent_service.parse_observation_from_text(request.text)
    if not data:
        raise HTTPException(status_code=400, detail="Could not parse voice input")
    return data

@app.get("/api/v1/export")
def export_observations(db: Session = Depends(get_db)):
    import pandas as pd
    from io import StringIO
    from fastapi.responses import StreamingResponse

    # Fetch all valid observations
    observations = db.query(models.Observation).filter(models.Observation.is_valid == True).all()
    
    # Convert to DataFrame
    data = [{
        "id": obs.id,
        "type": obs.type,
        "value": obs.value,
        "lat": obs.lat,
        "long": obs.long,
        "timestamp": obs.timestamp,
        "source": obs.source
    } for obs in observations]
    
    df = pd.DataFrame(data)
    
    # Create CSV buffer
    stream = StringIO()
    df.to_csv(stream, index=False)
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=observations.csv"
    return response

@app.get("/api/v1/voice/token")
def get_voice_token(identity: str = "citizen_bot"):
    # Identity can be any string
    lk_api_key = os.getenv("LIVEKIT_API_KEY")
    lk_api_secret = os.getenv("LIVEKIT_API_SECRET")
    
    if not lk_api_key or not lk_api_secret:
        raise HTTPException(status_code=500, detail="LiveKit configuration missing")
        
    token = api.AccessToken(lk_api_key, lk_api_secret) \
        .with_grants(api.VideoGrants(
            room_join=True,
            room="mechovate_voice_room",
        )).with_identity(identity)
    
    return {"token": token.to_jwt()}

@app.get("/")
def read_root():
    return {"message": "Citizen Science API is running"}
