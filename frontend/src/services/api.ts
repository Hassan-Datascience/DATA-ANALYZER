import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import * as Types from '../types/api.types';

/**
 * CYBER-EMERALD API SERVICE
 * Connects to the backend cluster for real-time telemetry.
 */

const api = axios.create({
    baseURL: (import.meta as any).env.VITE_API_URL || '/api',
    timeout: 30000, // extended for large file analysis
});

// Robust fetcher with explicit error handling and type casting
// Robust fetcher with exponential backoff retry
const fetcher = async <T>(url: string, retries = 3): Promise<T> => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await api.get<T>(url);
            return response.data;
        } catch (error) {
            if (i === retries - 1) {
                if (axios.isAxiosError(error)) {
                    const axiosError = error as AxiosError;
                    throw new Error(
                        ((axiosError.response?.data as any)?.message) ||
                        axiosError.message ||
                        'System cluster communication failure'
                    );
                }
                throw error;
            }
            // Exponential backoff
            await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
        }
    }
    throw new Error('Connection failed after multiple attempts');
};

// 1. Security Metrics
export const useSecurityMetrics = () =>
    useQuery<Types.SecurityMetrics, Error>({
        queryKey: ['security-metrics'],
        queryFn: () => fetcher<Types.SecurityMetrics>('/telemetry/security-metrics'),
        refetchInterval: 5000,
    });

// 2. Network Traffic
export const useNetworkTraffic = () =>
    useQuery<Types.NetworkTraffic, Error>({
        queryKey: ['network-traffic'],
        queryFn: () => fetcher<Types.NetworkTraffic>('/telemetry/network-traffic'),
        refetchInterval: 5000,
    });

// 3. Threat Intelligence
export const useThreatIntelligence = () =>
    useQuery<Types.ThreatIntelligence, Error>({
        queryKey: ['threat-intelligence'],
        queryFn: () => fetcher<Types.ThreatIntelligence>('/telemetry/threat-intelligence'),
        refetchInterval: 5000,
    });

// 4. Compliance Status
export const useComplianceStatus = () =>
    useQuery<Types.ComplianceStatus, Error>({
        queryKey: ['compliance-status'],
        queryFn: () => fetcher<Types.ComplianceStatus>('/telemetry/compliance-status'),
        refetchInterval: 5000,
    });

// 5. Incident Response
export const useIncidentResponse = () =>
    useQuery<Types.IncidentResponse, Error>({
        queryKey: ['incident-response'],
        queryFn: () => fetcher<Types.IncidentResponse>('/telemetry/incident-response'),
        refetchInterval: 5000,
    });

// 6. Vulnerability Management
export const useVulnerabilityManagement = () =>
    useQuery<Types.VulnerabilityManagement, Error>({
        queryKey: ['vulnerability-management'],
        queryFn: () => fetcher<Types.VulnerabilityManagement>('/telemetry/vulnerability-management'),
        refetchInterval: 5000,
    });

// 7. System Health
export const useSystemHealth = () =>
    useQuery<Types.SystemHealth, Error>({
        queryKey: ['system-health'],
        queryFn: () => fetcher<Types.SystemHealth>('/telemetry/system-health'),
        refetchInterval: 5000,
    });

// 8. DATASET & AUDIT ENDPOINTS

/**
 * Upload a dataset to the backend.
 */
export const uploadDataset = async (file: File, name: string): Promise<Types.UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);

    try {
        const response = await api.post<Types.UploadResponse>('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        throw new Error('Dataset ingestion failure');
    }
};

/**
 * Trigger an audit for a dataset.
 */
export const triggerAudit = async (datasetId: string): Promise<Types.AuditRequestResponse> => {
    const response = await api.post<Types.AuditRequestResponse>(`/audit/${datasetId}`);
    return response.data;
};

/**
 * Get dataset processing status.
 */
export const useDatasetStatus = (datasetId: string | null) =>
    useQuery<Types.DatasetStatusResponse, Error>({
        queryKey: ['dataset-status', datasetId],
        queryFn: () => fetcher<Types.DatasetStatusResponse>(`/status/${datasetId}`),
        enabled: !!datasetId,
        refetchInterval: (query) => {
            const data = query.state.data as Types.DatasetStatusResponse | undefined;
            return (data?.status === 'processing' || data?.status === 'uploaded' ? 2000 : false);
        },
    });

/**
 * Get full audit report.
 */
export const useAuditReport = (datasetId: string | null) =>
    useQuery<Types.AuditReport, Error>({
        queryKey: ['audit-report', datasetId],
        queryFn: () => fetcher<Types.AuditReport>(`/report/${datasetId}`),
        enabled: !!datasetId,
    });

/**
 * Get profile visualization data.
 */
export const useProfileVisualization = (datasetId: string | null) =>
    useQuery<Types.ProfileVisualization, Error>({
        queryKey: ['profile-visualization', datasetId],
        queryFn: () => api.post<Types.ProfileVisualization>(`/visualization/profile/${datasetId}`).then(r => r.data),
        enabled: !!datasetId,
    });
/**
 * Get all datasets/reports.
 */
export const useDatasets = (limit = 20) =>
    useQuery<Types.DatasetStatusResponse[], Error>({
        queryKey: ['datasets', limit],
        queryFn: () => fetcher<Types.DatasetStatusResponse[]>(`/reports?limit=${limit}`),
    });
