from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime

# Use SQLite by default for ease of setup if Postgres env not present, though Postgres was requested.
# Ideally would be: postgresql://user:password@localhost/dbname
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test_v2.db")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Observation(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True) # air, water, bio
    value = Column(Float)
    lat = Column(Float)
    long = Column(Float)
    location_name = Column(String, nullable=True) # human readable location name
    is_valid = Column(Boolean, default=True)
    timestamp = Column(DateTime, default=datetime.now)
    source = Column(String, default="manual") # manual or pdf_extraction
    details = Column(JSON, nullable=True) # Check validity with World Geo
    
    # Validation fields
    outlier_score = Column(Float, nullable=True)
    validation_report = Column(JSON, nullable=True) # Stores reference values from external sources
    needs_review = Column(Boolean, default=False)
    validation_status = Column(String, default="auto") # auto, pending, human_verified, rejected
    is_expert = Column(Boolean, default=False)

    @property
    def quality_info(self):
        from quality_classifier import QualityClassifier
        return QualityClassifier.classify(self.type, self.value)

    @property
    def quality_label(self):
        return self.quality_info.get("quality_label")

    @property
    def color_code(self):
        return self.quality_info.get("color_code")

    @property
    def health_msg(self):
        return self.quality_info.get("health_msg")

class AcousticRecording(Base):
    __tablename__ = "acoustic_recordings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    audio_url = Column(String)
    location_name = Column(String, nullable=True)
    lat = Column(Float)
    long = Column(Float)
    timestamp = Column(DateTime, default=datetime.now)
    duration_seconds = Column(Float)
    
    # Labeling data
    annotations = Column(JSON, default=list) # [{user: "", label: "", confidence: 0.9, timestamp: ""}]
    status = Column(String, default="pending") # pending, consensus_reached, expert_verified

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String)
    email = Column(String)
    category = Column(String) # bug, feature_request, general_query
    message = Column(Text)
    timestamp = Column(DateTime, default=datetime.now)
    status = Column(String, default="unread") # unread, read, addressed

def init_db():
    Base.metadata.create_all(bind=engine)
