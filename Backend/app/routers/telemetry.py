from fastapi import APIRouter
import random
import time
from datetime import datetime

router = APIRouter(tags=["telemetry"])

@router.get("/security-metrics")
async def get_security_metrics():
    return {
        "integrity_score": round(random.uniform(95.0, 99.9), 1),
        "flow_status": random.choice(["OPTIMAL", "DEGRADED"]),
        "latency_ms": random.randint(10, 25)
    }

@router.get("/network-traffic")
async def get_network_traffic():
    return {
        "active_nodes": random.randint(12000, 15000),
        "request_rate": f"{round(random.uniform(1.0, 1.5), 1)}k req/s",
        "pulse_data": [random.randint(10, 100) for _ in range(20)]
    }

@router.get("/threat-intelligence")
async def get_threat_intelligence():
    return {
        "drift_value": round(random.uniform(0.0, 0.1), 3),
        "drift_trend": [random.uniform(0, 1) for _ in range(15)],
        "threat_level": random.randint(0, 20)
    }

@router.get("/compliance-status")
async def get_compliance_status():
    return {
        "active_protocols": [
            {"id": "#A9-FF", "name": "Data Encryption Mismatch", "node": "GLOBAL_VAULT", "status": "RESOLVE", "description": "Mismatch in packet headers detected during validation."},
            {"id": "#B2-X1", "name": "Synchronization Delay", "node": "EDGE_SERVER_04", "status": "VERIFIED", "description": "Synchronization within acceptable enterprise parameters."},
            {"id": "#C4-L0", "name": "Authentication Failed", "node": "DATA_LAKE_02", "status": "ALERT", "description": "Multiple failed authentication attempts from an external node."},
            {"id": "#D5-K1", "name": "Connection Timeout", "node": "CLOUD_GATEWAY", "status": "RESOLVE", "description": "Persistent timeout errors on gateway uplink."},
            {"id": "#E6-J2", "name": "Certificate Expired", "node": "AUTH_SERVER", "status": "ALERT", "description": "Security certificate for AUTH_SERVER has expired."}
        ]
    }

@router.get("/incident-response")
async def get_incident_response():
    return {
        "raw_streams": [
            {"id": f"#{random.randint(1000,9999)}-X", "context_hash": "usr_db.v4.sync." + str(random.randint(100,999)), "timestamp": datetime.now().isoformat(), "state": "VERIFIED"},
            {"id": f"#{random.randint(1000,9999)}-X", "context_hash": "api_gateway.log." + str(random.randint(100,999)), "timestamp": datetime.now().isoformat(), "state": "PENDING"}
        ]
    }

@router.get("/vulnerability-management")
async def get_vulnerability_management():
    return {
        "vulnerabilities": [
            {"severity": "CRITICAL", "title": "SQL Injection", "count": 1},
            {"severity": "HIGH", "title": "Insecure JWT", "count": 2}
        ]
    }

@router.get("/system-health")
async def get_system_health():
    return {
        "cpu_load": random.randint(15, 30),
        "memory_usage": random.randint(40, 60),
        "uptime": "99.9%",
        "buffer_level": random.randint(90, 100),
        "status_code": 200
    }
