/**
 * Preview Loading State Component
 *
 * Shows an AI-powered loading state with:
 * - Animated thinking messages
 * - Validation check progress
 * - Auto-fix notifications
 * - Modern, sleek design
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "../i18n";
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Paper,
  Stack,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle,
  XCircle,
  Settings,
  Sparkles,
  AlertTriangle,
  Code,
  Shield,
  FileCode,
  Zap,
} from "lucide-react";

// Types
interface ValidationCheck {
  id: string;
  name: string;
  status: "pending" | "running" | "passed" | "failed" | "fixed" | "skipped";
  error?: string;
  fix?: string;
}

interface PreviewLoadingStateProps {
  phase: "initializing" | "validating" | "fixing" | "complete" | "error";
  currentMessage: string;
  checks: ValidationCheck[];
  totalErrors: number;
  totalFixed: number;
  onComplete?: () => void;
}

// Icon mapping for check types
const checkIcons: Record<string, React.ElementType> = {
  duplicate_router: Code,
  imports: FileCode,
  dependencies: FileCode,
  typescript: Code,
  api_config: Zap,
};

// Status colors
const statusConfig = {
  pending: { color: "#9e9e9e", bgColor: "rgba(158, 158, 158, 0.1)" },
  running: { color: "#2196f3", bgColor: "rgba(33, 150, 243, 0.1)" },
  passed: { color: "#4caf50", bgColor: "rgba(76, 175, 80, 0.1)" },
  failed: { color: "#f44336", bgColor: "rgba(244, 67, 54, 0.1)" },
  fixed: { color: "#ff9800", bgColor: "rgba(255, 152, 0, 0.1)" },
  skipped: { color: "#9e9e9e", bgColor: "rgba(158, 158, 158, 0.1)" },
};

// Animated dots for thinking state
const ThinkingDots = () => (
  <Box component="span" sx={{ display: "inline-flex", gap: 0.5, ml: 1 }}>
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        style={{
          width: 6,
          height: 6,
          backgroundColor: "currentColor",
          borderRadius: "50%",
          display: "inline-block",
        }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: i * 0.2,
        }}
      />
    ))}
  </Box>
);

// Single validation check item
const ValidationCheckItem = ({ check }: { check: ValidationCheck }) => {
  const config = statusConfig[check.status];
  const Icon = checkIcons[check.id] || FileCode;

  const StatusIcon = () => {
    switch (check.status) {
      case "running":
        return <CircularProgress size={20} sx={{ color: config.color }} />;
      case "passed":
        return <CheckCircle size={20} color={config.color} />;
      case "failed":
        return <XCircle size={20} color={config.color} />;
      case "fixed":
        return <Settings size={20} color={config.color} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 1.5,
          borderRadius: 2,
          bgcolor: config.bgColor,
          mb: 1,
        }}
      >
        <Box
          sx={{
            p: 1,
            borderRadius: 1.5,
            bgcolor: config.bgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={16} color={config.color} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" fontWeight={500}>
              {check.name}
            </Typography>
            {check.status === "running" && <ThinkingDots />}
          </Box>

          {check.error && (
            <Typography
              variant="caption"
              sx={{ color: "#f44336", display: "block", mt: 0.5 }}
            >
              {check.error}
            </Typography>
          )}

          {check.fix && (
            <Typography
              variant="caption"
              sx={{ color: "#ff9800", display: "block", mt: 0.5 }}
            >
              ✨ {check.fix}
            </Typography>
          )}
        </Box>

        <Box sx={{ flexShrink: 0 }}>
          <StatusIcon />
        </Box>
      </Paper>
    </motion.div>
  );
};

// Main component
export default function PreviewLoadingState({
  phase,
  currentMessage,
  checks,
  totalErrors,
  totalFixed,
}: PreviewLoadingStateProps) {
  const { t } = useI18n();
  const [progress, setProgress] = useState(0);

  // Calculate progress based on checks
  useEffect(() => {
    const completed = checks.filter(
      (c) => !["pending", "running"].includes(c.status)
    ).length;
    const total = checks.length || 1;
    setProgress((completed / total) * 100);
  }, [checks]);

  // Phase-specific content
  const phaseContent = {
    initializing: {
      title: t('preview.phase.initializing.title'),
      subtitle: t('preview.phase.initializing.subtitle'),
      icon: Sparkles,
      gradient: "linear-gradient(135deg, #9c27b0 0%, #2196f3 100%)",
    },
    validating: {
      title: t('preview.phase.validating.title'),
      subtitle: t('preview.phase.validating.subtitle'),
      icon: Shield,
      gradient: "linear-gradient(135deg, #2196f3 0%, #00bcd4 100%)",
    },
    fixing: {
      title: t('preview.phase.fixing.title'),
      subtitle: t('preview.phase.fixing.subtitle'),
      icon: Settings,
      gradient: "linear-gradient(135deg, #ff9800 0%, #ff5722 100%)",
    },
    complete: {
      title: totalErrors > 0 ? t('preview.phase.complete.title') : t('preview.phase.complete.titleSuccess'),
      subtitle:
        totalErrors > 0
          ? t('preview.phase.complete.subtitleErrors').replace('{count}', String(totalErrors))
          : t('preview.phase.complete.subtitleSuccess'),
      icon: totalErrors > 0 ? AlertTriangle : CheckCircle,
      gradient:
        totalErrors > 0
          ? "linear-gradient(135deg, #ff9800 0%, #f44336 100%)"
          : "linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)",
    },
    error: {
      title: t('preview.phase.error.title'),
      subtitle: t('preview.phase.error.subtitle'),
      icon: XCircle,
      gradient: "linear-gradient(135deg, #f44336 0%, #e91e63 100%)",
    },
  };

  const currentPhase = phaseContent[phase];
  const PhaseIcon = currentPhase.icon;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        p: 4,
        background: "linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%)",
      }}
    >
      {/* Main Icon with gradient glow */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ position: "relative", marginBottom: 32 }}
      >
        {/* Glow effect */}
        <Box
          sx={{
            position: "absolute",
            inset: -20,
            borderRadius: "50%",
            background: currentPhase.gradient,
            filter: "blur(40px)",
            opacity: 0.3,
          }}
        />

        {/* Icon container */}
        <Box
          sx={{
            position: "relative",
            width: 96,
            height: 96,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: currentPhase.gradient,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          }}
        >
          <PhaseIcon size={48} color="white" />

          {/* Spinning ring for active states */}
          {["initializing", "validating", "fixing"].includes(phase) && (
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 16,
                border: "2px solid rgba(255,255,255,0.3)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          )}
        </Box>
      </motion.div>

      {/* Title and subtitle */}
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", marginBottom: 24 }}
      >
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {currentPhase.title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {currentPhase.subtitle}
        </Typography>
      </motion.div>

      {/* Current action message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMessage}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
        >
          <Chip
            icon={
              phase !== "complete" && phase !== "error" ? (
                <CircularProgress size={16} sx={{ color: "text.secondary" }} />
              ) : undefined
            }
            label={currentMessage}
            variant="outlined"
            sx={{
              mb: 3,
              px: 1,
              bgcolor: "rgba(0,0,0,0.04)",
              borderColor: "transparent",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      {checks.length > 0 && (
        <Box sx={{ width: "100%", maxWidth: 400, mb: 3 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "rgba(0,0,0,0.08)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                background: currentPhase.gradient,
              },
            }}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {checks.filter((c) => !["pending", "running"].includes(c.status)).length}{" "}
              / {checks.length} {t('preview.checks.count')}
            </Typography>
            {totalFixed > 0 && (
              <Typography variant="caption" sx={{ color: "#ff9800" }}>
                {totalFixed} {t('preview.checks.fixed')}
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {/* Validation checks list */}
      {checks.length > 0 && (
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <AnimatePresence>
            {checks.map((check) => (
              <ValidationCheckItem key={check.id} check={check} />
            ))}
          </AnimatePresence>
        </Box>
      )}

      {/* Summary badges */}
      {phase === "complete" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
            {checks.filter((c) => c.status === "passed").length > 0 && (
              <Chip
                icon={<CheckCircle size={14} />}
                label={`${checks.filter((c) => c.status === "passed").length} ${t('preview.summary.ok')}`}
                size="small"
                sx={{
                  bgcolor: "rgba(76, 175, 80, 0.1)",
                  color: "#4caf50",
                  borderColor: "rgba(76, 175, 80, 0.3)",
                }}
                variant="outlined"
              />
            )}
            {totalFixed > 0 && (
              <Chip
                icon={<Settings size={14} />}
                label={`${totalFixed} ${t('preview.summary.fixed')}`}
                size="small"
                sx={{
                  bgcolor: "rgba(255, 152, 0, 0.1)",
                  color: "#ff9800",
                  borderColor: "rgba(255, 152, 0, 0.3)",
                }}
                variant="outlined"
              />
            )}
            {totalErrors > 0 && (
              <Chip
                icon={<AlertTriangle size={14} />}
                label={`${totalErrors} ${t('preview.summary.warnings')}`}
                size="small"
                sx={{
                  bgcolor: "rgba(244, 67, 54, 0.1)",
                  color: "#f44336",
                  borderColor: "rgba(244, 67, 54, 0.3)",
                }}
                variant="outlined"
              />
            )}
          </Stack>
        </motion.div>
      )}
    </Box>
  );
}
