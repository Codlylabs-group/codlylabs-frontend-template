/**
 * MUI Theme — Unified with Tailwind design tokens.
 *
 * All values here mirror the CSS custom properties in index.css
 * and the Tailwind config in tailwind.config.js so every layer
 * (Tailwind utility classes, MUI sx prop, inline styles) renders
 * the same visual language.
 *
 * STYLE GUIDE:
 *   - Tailwind classes  → layout, spacing, responsive, simple colors
 *   - MUI components    → Dialog, Table, Alert, TextField, Select
 *   - MUI sx prop       → only when Tailwind cannot express it
 *   - Inline style={{}} → only for truly dynamic values (calc, vars)
 */

import { createTheme } from '@mui/material/styles'

// ── Palette tokens (same values as tailwind.config.js) ──────────
const brand = {
  50:  '#eef2ff',
  100: '#e0e7ff',
  200: '#c7d2fe',
  300: '#a5b4fc',
  400: '#818cf8',
  500: '#6366f1',
  600: '#4f46e5',
  700: '#4338ca',
  800: '#3730a3',
  900: '#312e81',
} as const

const neutral = {
  50:  '#f9fafb',
  100: '#f3f4f6',
  200: '#e5e7eb',
  300: '#d1d5db',
  400: '#9ca3af',
  500: '#6b7280',
  600: '#4b5563',
  700: '#374151',
  800: '#1f2937',
  900: '#111827',
  950: '#0f172a',
} as const

const semantic = {
  success: { light: '#ecfdf5', main: '#10b981', dark: '#059669' },
  error:   { light: '#fef2f2', main: '#ef4444', dark: '#dc2626' },
  warning: { light: '#fffbeb', main: '#f59e0b', dark: '#d97706' },
  info:    { light: '#eff6ff', main: '#3b82f6', dark: '#2563eb' },
} as const

// ── Theme ───────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: {
      light:        brand[300],
      main:         brand[600],
      dark:         brand[700],
      contrastText: '#ffffff',
    },
    secondary: {
      light:        neutral[300],
      main:         neutral[600],
      dark:         neutral[800],
      contrastText: '#ffffff',
    },
    success: semantic.success,
    error:   semantic.error,
    warning: semantic.warning,
    info:    semantic.info,
    grey: neutral,
    text: {
      primary:   neutral[900],
      secondary: neutral[600],
      disabled:  neutral[400],
    },
    background: {
      default: neutral[50],
      paper:   '#ffffff',
    },
    divider: neutral[200],
    action: {
      hover:         `${brand[600]}0A`,     // 4% opacity
      selected:      `${brand[600]}14`,     // 8% opacity
      disabledBackground: neutral[100],
      disabled:      neutral[400],
      focus:         `${brand[600]}1F`,     // 12% opacity
    },
  },

  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1:       { fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.11, color: neutral[950] },
    h2:       { fontSize: '1.5rem',  fontWeight: 600, lineHeight: 1.33, color: neutral[900] },
    h3:       { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4,  color: neutral[800] },
    body1:    { fontSize: '1rem',    fontWeight: 400, lineHeight: 1.5,  color: neutral[700] },
    body2:    { fontSize: '0.875rem',fontWeight: 400, lineHeight: 1.43, color: neutral[600] },
    caption:  { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.33, color: neutral[500] },
    button:   { fontWeight: 500, textTransform: 'none' as const },
  },

  shape: {
    borderRadius: 8,   // md (matches Tailwind rounded-md)
  },

  shadows: [
    'none',
    '0 1px 2px 0 rgba(0,0,0,0.05)',                                         // xs
    '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',         // sm
    '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',      // md
    '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',    // lg
    '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',   // xl
    '0 8px 32px rgba(0,0,0,0.12)',                                           // elevated
    // Fill remaining 18 slots with progressively stronger shadows (MUI needs 25)
    ...Array(18).fill('0 8px 32px rgba(0,0,0,0.12)'),
  ] as any,

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          textTransform: 'none' as const,
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          backgroundColor: brand[600],
          '&:hover': { backgroundColor: brand[700] },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.5rem',
            '& fieldset': { borderColor: neutral[200] },
            '&:hover fieldset': { borderColor: neutral[300] },
            '&.Mui-focused fieldset': { borderColor: brand[500] },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '0.75rem',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardSuccess: { backgroundColor: semantic.success.light, color: semantic.success.dark },
        standardError:   { backgroundColor: semantic.error.light,   color: semantic.error.dark },
        standardWarning: { backgroundColor: semantic.warning.light, color: semantic.warning.dark },
        standardInfo:    { backgroundColor: semantic.info.light,    color: semantic.info.dark },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: '0.375rem', fontWeight: 500 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: neutral[50],
            color: neutral[700],
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: neutral[100],
          padding: '12px 16px',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: neutral[800],
          fontSize: '0.75rem',
          borderRadius: '0.375rem',
          padding: '6px 12px',
        },
      },
    },
    // Accessibility: ensure all focus states are visible
    MuiButtonBase: {
      defaultProps: {
        disableRipple: false,
      },
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `2px solid ${brand[500]}`,
            outlineOffset: '2px',
          },
        },
      },
    },
  },
})

export default theme

// Re-export tokens for use in non-MUI contexts (e.g., Recharts colors)
export const tokens = { brand, neutral, semantic } as const
