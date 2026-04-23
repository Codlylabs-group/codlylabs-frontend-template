/**
 * Alert Dashboard Component
 * Phase 3 - ROI Panic Button
 *
 * Displays alerts, allows configuration of alert rules, and shows notification history.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Alert as MuiAlert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  Settings,
  Refresh
} from '@mui/icons-material';
import { alertsService, type Alert, type AlertRule, type AlertSeverity } from '../services/alerts';

interface AlertDashboardProps {
  pocId?: string;
}

const AlertDashboard: React.FC<AlertDashboardProps> = ({ pocId }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [createRuleDialogOpen, setCreateRuleDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [pocId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [alertsData, statsData] = await Promise.all([
        alertsService.getAlerts({ pocId, acknowledged: false }),
        alertsService.getStats()
      ]);

      setAlerts(alertsData);
      setStats(statsData);

      if (pocId) {
        const rulesData = await alertsService.getAlertRules(pocId);
        setRules(rulesData);
      }
    } catch (error) {
      console.error('Error loading alert data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await alertsService.acknowledgeAlert(alertId);
      loadData(); // Reload data
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return <Error color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'info':
        return <Info color="info" />;
    }
  };

  const getSeverityColor = (severity: AlertSeverity): "error" | "warning" | "info" => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
    }
  };

  return (
    <Box>
      {/* Header Stats */}
      {stats && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Total Alerts
                </Typography>
                <Typography variant="h4">{stats.total_alerts}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Unacknowledged
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.unacknowledged}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Critical
                </Typography>
                <Typography variant="h4" color="error">
                  {stats.by_severity?.critical || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Active Rules
                </Typography>
                <Typography variant="h4">{stats.active_rules}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={currentTab} onChange={(_event: React.SyntheticEvent, newValue: number) => setCurrentTab(newValue)}>
          <Tab
            label={
              <Badge badgeContent={alerts.length} color="error">
                Active Alerts
              </Badge>
            }
          />
          {pocId && <Tab label="Alert Rules" />}
          <Tab label="Notification History" />
        </Tabs>
      </Paper>

      {/* Tab Content: Active Alerts */}
      {currentTab === 0 && (
        <Box>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h6">Active Alerts</Typography>
            <Button startIcon={<Refresh />} onClick={loadData} disabled={loading}>
              Refresh
            </Button>
          </Box>

          {alerts.length === 0 ? (
            <MuiAlert severity="success" icon={<CheckCircle />}>
              No active alerts. All metrics are within expected ranges.
            </MuiAlert>
          ) : (
            <Grid container spacing={2}>
              {alerts.map((alert) => (
                <Grid item xs={12} key={alert.alert_id}>
                  <Card variant="outlined" sx={{ borderLeft: `4px solid ${getSeverityColor(alert.severity)}` }}>
                    <CardContent>
                      <Box display="flex" alignItems="start" justifyContent="space-between">
                        <Box display="flex" alignItems="start" gap={2} flex={1}>
                          {getSeverityIcon(alert.severity)}
                          <Box flex={1}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Typography variant="h6">{alert.title}</Typography>
                              <Chip
                                label={alert.severity.toUpperCase()}
                                color={getSeverityColor(alert.severity)}
                                size="small"
                              />
                            </Box>

                            <Typography variant="body2" color="text.secondary" paragraph>
                              {alert.message}
                            </Typography>

                            <Grid container spacing={2}>
                              <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="text.secondary">
                                  Metric
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {alert.metric_name}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="text.secondary">
                                  Expected
                                </Typography>
                                <Typography variant="body2">{alert.expected_value.toFixed(2)}</Typography>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="text.secondary">
                                  Actual
                                </Typography>
                                <Typography variant="body2" color="error">
                                  {alert.actual_value.toFixed(2)}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Typography variant="caption" color="text.secondary">
                                  Deviation
                                </Typography>
                                <Typography variant="body2" color="error">
                                  {alert.deviation_percent.toFixed(1)}%
                                </Typography>
                              </Grid>
                            </Grid>

                            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                              {new Date(alert.created_at).toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>

                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<CheckCircle />}
                          onClick={() => handleAcknowledgeAlert(alert.alert_id)}
                        >
                          Acknowledge
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Tab Content: Alert Rules (only for specific POC) */}
      {currentTab === 1 && pocId && (
        <Box>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h6">Alert Rules</Typography>
            <Button
              variant="contained"
              startIcon={<Settings />}
              onClick={() => setCreateRuleDialogOpen(true)}
            >
              Create Rule
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>KPI/Metric</TableCell>
                  <TableCell>Threshold</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Channels</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.rule_id}>
                    <TableCell>{rule.alert_type}</TableCell>
                    <TableCell>{rule.kpi_name || 'N/A'}</TableCell>
                    <TableCell>{rule.threshold_percent}%</TableCell>
                    <TableCell>
                      <Chip label={rule.severity} color={getSeverityColor(rule.severity)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={rule.enabled ? 'Active' : 'Disabled'} size="small" />
                    </TableCell>
                    <TableCell>{rule.notification_channels.join(', ')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Tab Content: Notification History */}
      {currentTab === (pocId ? 2 : 1) && (
        <Box>
          <Typography variant="h6" mb={2}>
            Notification History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Notification history will be displayed here.
          </Typography>
        </Box>
      )}

      {/* Create Rule Dialog (placeholder) */}
      <Dialog open={createRuleDialogOpen} onClose={() => setCreateRuleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Alert Rule</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Alert rule configuration form will be implemented here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateRuleDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AlertDashboard;
