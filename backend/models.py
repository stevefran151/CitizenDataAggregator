from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, JSON
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
    is_valid = Column(Boolean, default=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    source = Column(String, default="manual") # manual or pdf_extraction
    details = Column(JSON, nullable=True) # Check validity with World Geo
    
    # Validation fields
    outlier_score = Column(Float, nullable=True)
    validation_report = Column(JSON, nullable=True) # Stores reference values from external sources

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

def init_db():
    Base.metadata.create_all(bind=engine)
