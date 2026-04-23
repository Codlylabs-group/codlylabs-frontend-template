/**
 * Alerts Service - ROI Panic Button
 * Phase 3 - Game Changer #2
 *
 * Service for alert management API calls
 */

import { api } from './api';

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertType = 'kpi_deviation' | 'budget_overrun' | 'timeline_delay' | 'quality_drop' | 'risk_materialized';

export interface AlertRule {
  rule_id: string;
  poc_id: string;
  alert_type: AlertType;
  kpi_name?: string;
  threshold_percent: number;
  severity: AlertSeverity;
  enabled: boolean;
  notification_channels: string[];
  created_at: string;
}

export interface Alert {
  alert_id: string;
  poc_id: string;
  rule_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  metric_name: string;
  expected_value: number;
  actual_value: number;
  deviation_percent: number;
  created_at: string;
  acknowledged: boolean;
  acknowledged_at?: string;
  acknowledged_by?: string;
}

export interface CreateAlertRuleRequest {
  poc_id: string;
  alert_type: AlertType;
  kpi_name?: string;
  threshold_percent?: number;
  severity?: AlertSeverity;
  notification_channels?: string[];
}

export interface UpdateAlertRuleRequest {
  threshold_percent?: number;
  severity?: AlertSeverity;
  enabled?: boolean;
  notification_channels?: string[];
}

export interface GetAlertsParams {
  pocId?: string;
  acknowledged?: boolean;
  severity?: AlertSeverity;
  limit?: number;
}

export interface AlertStats {
  total_alerts: number;
  unacknowledged: number;
  by_severity: {
    critical: number;
    warning: number;
    info: number;
  };
  active_rules: number;
}

class AlertsService {
  /**
   * Create alert rule for a POC
   */
  async createAlertRule(request: CreateAlertRuleRequest): Promise<AlertRule> {
    const response = await api.post<AlertRule>('/alerts/rules', request);
    return response.data;
  }

  /**
   * Get all alert rules for a POC
   */
  async getAlertRules(pocId: string): Promise<AlertRule[]> {
    const response = await api.get<AlertRule[]>(`/alerts/rules/${pocId}`);
    return response.data;
  }

  /**
   * Update alert rule
   */
  async updateAlertRule(ruleId: string, request: UpdateAlertRuleRequest): Promise<AlertRule> {
    const response = await api.patch<AlertRule>(`/alerts/rules/${ruleId}`, request);
    return response.data;
  }

  /**
   * Delete alert rule
   */
  async deleteAlertRule(ruleId: string): Promise<void> {
    await api.delete(`/alerts/rules/${ruleId}`);
  }

  /**
   * Get alerts with filters
   */
  async getAlerts(params: GetAlertsParams = {}): Promise<Alert[]> {
    const response = await api.get<Alert[]>('/alerts/', {
      params: {
        poc_id: params.pocId,
        acknowledged: params.acknowledged,
        severity: params.severity,
        limit: params.limit || 50
      }
    });
    return response.data;
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string, notes?: string): Promise<void> {
    await api.post('/alerts/acknowledge', {
      alert_id: alertId,
      notes
    });
  }

  /**
   * Get alert statistics
   */
  async getStats(): Promise<AlertStats> {
    const response = await api.get<AlertStats>('/alerts/stats');
    return response.data;
  }

  /**
   * Evaluate POC metrics (trigger manual evaluation)
   */
  async evaluatePOCMetrics(pocId: string, metrics: any): Promise<Alert[]> {
    const response = await api.post<Alert[]>('/alerts/evaluate', {
      poc_id: pocId,
      metrics
    });
    return response.data;
  }

  /**
   * Configure notification channel
   */
  async configureNotificationChannel(
    pocId: string,
    channelType: 'email' | 'slack' | 'webhook',
    config: any
  ): Promise<void> {
    await api.post('/alerts/notifications/configure', {
      poc_id: pocId,
      channel_type: channelType,
      config
    });
  }

  /**
   * Get notification history
   */
  async getNotificationHistory(pocId?: string, limit: number = 50): Promise<any[]> {
    const response = await api.get('/alerts/notifications/history', {
      params: { poc_id: pocId, limit }
    });
    return response.data.notifications;
  }
}

export const alertsService = new AlertsService();
export default alertsService;
