import asyncio
import sys
import time
import os

# Set up paths
sys.path.append(os.getcwd())

async def test_health():
    print("--- Testing Imports ---")
    try:
        from app.database.mongo import is_db_connected
        print("mongo import: SUCCESS")
        from app.routers import datasets, visualization, telemetry
        print("routers import: SUCCESS")
    except Exception as e:
        print(f"IMPORT FAILED: {e}")
        import traceback
        traceback.print_exc()
        return

    print("\n--- Testing Health Logic ---")
    try:
        # Simulate health_check handler
        db_status = False # Simplified for check
        print(f"DB Status (simulated): {db_status}")
        
        # Test asyncio loop access
        try:
            loop = asyncio.get_event_loop()
            loop_time = loop.time()
            print(f"asyncio.get_event_loop().time(): {loop_time}")
        except Exception as ae:
            print(f"asyncio loop error: {ae}")

        timestamp = time.time()
        print(f"time.time(): {timestamp}")
        
    except Exception as e:
        print(f"HEALTH LOGIC FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_health())
