/**
 * CYBER-EMERALD API TYPES
 * Standardized interfaces for zero-error telemetry integration.
 */

// 1. /security-metrics
export interface SecurityMetrics {
    integrity_score: number;
    flow_status: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
    latency_ms: number;
}

// 2. /network-traffic
export interface NetworkTraffic {
    active_nodes: number;
    request_rate: string;
    pulse_data: number[];
}

// 3. /threat-intelligence
export interface ThreatIntelligence {
    drift_value: number;
    drift_trend: number[];
    threat_level: number;
}

// 4. /compliance-status
export interface ComplianceStatus {
    active_protocols: Protocol[];
}

export interface Protocol {
    id: string;
    name: string;
    node: string;
    status: 'RESOLVE' | 'PRUNE' | 'VERIFIED' | 'PENDING' | 'PASS' | 'ALERT';
    description: string;
}

// 5. /incident-response
export interface IncidentResponse {
    raw_streams: StreamEvent[];
}

export interface StreamEvent {
    id: string;
    context_hash: string;
    timestamp: string;
    state: 'VERIFIED' | 'PENDING' | 'FAILED';
}

// 6. /vulnerability-management
export interface VulnerabilityManagement {
    vulnerabilities: Vulnerability[];
}

export interface Vulnerability {
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    count: number;
}

// 7. /system-health
export interface SystemHealth {
    cpu_load: number;
    memory_usage: number;
    uptime: string;
    buffer_level: number;
    status_code: number;
}
