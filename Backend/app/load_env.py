# load_env.py
import os
from dotenv import load_dotenv

# .env file load kar
load_dotenv()

# Print kar verify ke liye
print("MONGO_URI loaded:", os.getenv('MONGO_URI'))
print("Environment variables loaded successfully!")