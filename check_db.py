import os
if os.path.exists('test.db'):
    os.remove('test.db')
    print("Deleted test.db")

import models
print(f"Using models from: {models.__file__}")
from models import engine, Observation, init_db
from sqlalchemy import inspect

init_db()
print(f"Model columns: {Observation.__table__.columns.keys()}")
inspector = inspect(engine)
columns = inspector.get_columns('observations')
for column in columns:
    print(column['name'], column['type'])
