/**
 * Structured Frontend Logger
 *
 * Replaces raw console.log with a structured, environment-aware
 * logging utility. In production, only warnings and errors are emitted.
 * In development, all levels are visible.
 *
 * Usage:
 *   import { logger } from '@/utils/logger'
 *   logger.info('User started onboarding', { userId: '123' })
 *   logger.error('API call failed', { endpoint: '/api/v1/pocs', status: 500 })
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const isDev = import.meta.env?.DEV ?? !import.meta.env?.PROD
const MIN_LEVEL: LogLevel = isDev ? 'debug' : 'warn'

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL]
}

function formatEntry(entry: LogEntry): string {
  const ctx = entry.context ? ` ${JSON.stringify(entry.context)}` : ''
  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${ctx}`
}

function createEntry(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  }
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>) {
    if (!shouldLog('debug')) return
    const entry = createEntry('debug', message, context)
    console.debug(formatEntry(entry))
  },

  info(message: string, context?: Record<string, unknown>) {
    if (!shouldLog('info')) return
    const entry = createEntry('info', message, context)
    console.info(formatEntry(entry))
  },

  warn(message: string, context?: Record<string, unknown>) {
    if (!shouldLog('warn')) return
    const entry = createEntry('warn', message, context)
    console.warn(formatEntry(entry))
  },

  error(message: string, context?: Record<string, unknown>) {
    if (!shouldLog('error')) return
    const entry = createEntry('error', message, context)
    console.error(formatEntry(entry))
  },
}

export default logger
