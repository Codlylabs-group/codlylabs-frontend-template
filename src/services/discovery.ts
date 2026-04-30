/**
 * Discovery Agent Service
 * Handles all API calls for the new Discovery Agent (Module 1)
 */

import { api } from './api';
import type {
  StartDiscoveryRequest,
  ContinueDiscoveryRequest,
  ConfirmSynthesisRequest,
  DiscoveryResponse,
} from '../types/discovery';

const DISCOVERY_BASE = '/api/v1/discovery';

export const discoveryService = {
  /**
   * Start a new discovery session
   */
  async start(request: StartDiscoveryRequest): Promise<DiscoveryResponse> {
    const response = await api.post<DiscoveryResponse>(
      `${DISCOVERY_BASE}/start`,
      request
    );
    return response.data;
  },

  /**
   * Continue an existing discovery session
   */
  async continue(request: ContinueDiscoveryRequest): Promise<DiscoveryResponse> {
    const response = await api.post<DiscoveryResponse>(
      `${DISCOVERY_BASE}/continue`,
      request
    );
    return response.data;
  },

  /**
   * Confirm or correct the synthesis
   */
  async confirm(request: ConfirmSynthesisRequest): Promise<DiscoveryResponse> {
    const response = await api.post<DiscoveryResponse>(
      `${DISCOVERY_BASE}/confirm`,
      request
    );
    return response.data;
  },

  /**
   * Get session details
   */
  async getSession(sessionId: string): Promise<any> {
    const response = await api.get(`${DISCOVERY_BASE}/session/${sessionId}`);
    return response.data;
  },

  async associateUserWithSession(sessionId: string): Promise<{ success: boolean; user_name: string | null }> {
    const response = await api.post(`${DISCOVERY_BASE}/session/associate-user`, {
      session_id: sessionId,
    });
    return response.data;
  },

  /**
   * List all discovery sessions
   */
  async listSessions(limit: number = 10): Promise<any[]> {
    const response = await api.get(`${DISCOVERY_BASE}/sessions`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Seed a complete discovery session (development only)
   * Used by autofill buttons to create mock sessions in the backend
   */
  async seedSession(payload: {
    session_id: string;
    status?: string;
    conversation_history?: any[];
    discovery_summary?: any;
    objectives_achieved?: Record<string, boolean>;
    confidence_score?: number;
  }): Promise<{ success: boolean; session_id: string; message: string }> {
    const response = await api.post(`${DISCOVERY_BASE}/dev-seed`, payload);
    return response.data;
  },
};
