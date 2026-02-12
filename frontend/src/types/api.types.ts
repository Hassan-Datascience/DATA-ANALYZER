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
    threat_list: Array<{
        vector: string;
        origin: string;
        timestamp: string;
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    }>;
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

// 8. /upload & /status
export interface Dataset {
    dataset_id: string;
    name: string;
    filename: string;
    status: 'uploaded' | 'processing' | 'completed' | 'failed';
    rows: number | null;
    columns: number | null;
    file_size_bytes?: number;
    uploaded_at: string;
    processed_at?: string | null;
}

export interface UploadResponse extends Dataset { }

export interface DatasetStatusResponse extends Dataset {
    error_message?: string | null;
}

// 9. /audit/{id}
export interface AuditRequestResponse {
    message: string;
    dataset_id: string;
    status: string;
}

// 10. /report/{id}
export interface ColumnProfile {
    column_name: string;
    metrics: Record<string, any>;
    issues: string[];
}

export interface AuditReport {
    dataset_id: string;
    reliability_score: number;
    anomaly_rate?: number;  // NEW: Percentage of rows with anomalies
    status: string;
    issue_summary: {
        missing: string;
        anomalies: string;
        inconsistencies: string;
        duplicates: string;
        dimensions?: Record<string, number>;
    };
    anomaly_count: number;
    duplicate_count: number;
    recommendations: string[];
    created_at: string;
    error_message?: string | null;
    is_sampled: boolean;
    sample_size: number;
    columns: ColumnProfile[];
}

// 11. /visualization/profile/{id}
export interface ProfileVisualization {
    dataset_summary: {
        dataset_id: string;
        name: string;
        rows: number;
        columns: number;
    };
    quality_scores: {
        overall: {
            score: number;
            status: string;
        };
        dimensions?: Record<string, number>;
    };
    column_profiles: Array<{
        column: string;
        metrics: Record<string, any>;
        issues: string[];
    }>;
}
