import axios, { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import * as Types from '../types/api.types';

/**
 * CYBER-EMERALD API SERVICE
 * Connects to the backend cluster for real-time telemetry.
 */

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    timeout: 10000,
});

// Robust fetcher with explicit error handling and type casting
const fetcher = async <T>(url: string): Promise<T> => {
    try {
        const response = await api.get<T>(url);
        return response.data;
    } catch (error) {
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
};

// 1. Security Metrics
export const useSecurityMetrics = () =>
    useQuery<Types.SecurityMetrics, Error>({
        queryKey: ['security-metrics'],
        queryFn: () => fetcher<Types.SecurityMetrics>('/security-metrics'),
        refetchInterval: 5000,
    });

// 2. Network Traffic
export const useNetworkTraffic = () =>
    useQuery<Types.NetworkTraffic, Error>({
        queryKey: ['network-traffic'],
        queryFn: () => fetcher<Types.NetworkTraffic>('/network-traffic'),
        refetchInterval: 5000,
    });

// 3. Threat Intelligence
export const useThreatIntelligence = () =>
    useQuery<Types.ThreatIntelligence, Error>({
        queryKey: ['threat-intelligence'],
        queryFn: () => fetcher<Types.ThreatIntelligence>('/threat-intelligence'),
        refetchInterval: 5000,
    });

// 4. Compliance Status
export const useComplianceStatus = () =>
    useQuery<Types.ComplianceStatus, Error>({
        queryKey: ['compliance-status'],
        queryFn: () => fetcher<Types.ComplianceStatus>('/compliance-status'),
        refetchInterval: 5000,
    });

// 5. Incident Response
export const useIncidentResponse = () =>
    useQuery<Types.IncidentResponse, Error>({
        queryKey: ['incident-response'],
        queryFn: () => fetcher<Types.IncidentResponse>('/incident-response'),
        refetchInterval: 5000,
    });

// 6. Vulnerability Management
export const useVulnerabilityManagement = () =>
    useQuery<Types.VulnerabilityManagement, Error>({
        queryKey: ['vulnerability-management'],
        queryFn: () => fetcher<Types.VulnerabilityManagement>('/vulnerability-management'),
        refetchInterval: 5000,
    });

// 7. System Health
export const useSystemHealth = () =>
    useQuery<Types.SystemHealth, Error>({
        queryKey: ['system-health'],
        queryFn: () => fetcher<Types.SystemHealth>('/system-health'),
        refetchInterval: 5000,
    });
