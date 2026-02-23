import sys
import os

# Add parent directory to path to import backend models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import SessionLocal, Observation
# We need to install the dependencies in the environment running this spider

class SaveToPostgresPipeline:
    def open_spider(self, spider):
        self.db = SessionLocal()

    def process_item(self, item, spider):
        # Create Observation
        # Check if already exists? For now just append as new reading
        obs = Observation(
            type=item["type"],
            value=item["value"],
            lat=item["lat"],
            long=item["long"],
            is_valid=True, # Trusted source
            source=item["source"],
            outlier_score=0.0
        )
        self.db.add(obs)
        self.db.commit()
        return item

    def close_spider(self, spider):
        self.db.close()
