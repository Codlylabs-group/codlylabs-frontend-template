/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand / Primary ─────────────────────────────
        brand: {
          50:  '#eef2ff',   // indigo-50  – lightest tint (backgrounds)
          100: '#e0e7ff',   // indigo-100 – hover tint
          200: '#c7d2fe',   // indigo-200 – rings / focus
          300: '#a5b4fc',   // indigo-300 – decorative
          400: '#818cf8',   // indigo-400 – secondary accent
          500: '#6366f1',   // indigo-500 – primary brand
          600: '#4f46e5',   // indigo-600 – CTA / buttons
          700: '#4338ca',   // indigo-700 – hover buttons
          800: '#3730a3',   // indigo-800 – pressed state
          900: '#312e81',   // indigo-900 – deepest
          DEFAULT: '#6366f1',
        },

        // ── Neutral (unify gray/slate) ──────────────────
        neutral: {
          50:  '#f9fafb',   // backgrounds
          100: '#f3f4f6',   // alt backgrounds, borders light
          200: '#e5e7eb',   // borders, dividers
          300: '#d1d5db',   // disabled borders
          400: '#9ca3af',   // placeholder text
          500: '#6b7280',   // tertiary text
          600: '#4b5563',   // secondary text
          700: '#374151',   // body text
          800: '#1f2937',   // headings
          900: '#111827',   // primary text
          950: '#0f172a',   // darkest
          DEFAULT: '#6b7280',
        },

        // ── Semantic: Success ───────────────────────────
        success: {
          50:  '#ecfdf5',   // background
          100: '#d1fae5',   // light fill
          200: '#a7f3d0',   // border
          500: '#10b981',   // icon / badge
          600: '#059669',   // text
          700: '#047857',   // hover
          DEFAULT: '#10b981',
        },

        // ── Semantic: Error / Danger ────────────────────
        danger: {
          50:  '#fef2f2',   // background
          100: '#fee2e2',   // light fill
          200: '#fecaca',   // border
          500: '#ef4444',   // icon / badge
          600: '#dc2626',   // text
          700: '#b91c1c',   // hover
          DEFAULT: '#ef4444',
        },

        // ── Semantic: Warning ───────────────────────────
        warning: {
          50:  '#fffbeb',   // background
          100: '#fef3c7',   // light fill
          200: '#fde68a',   // border
          500: '#f59e0b',   // icon / badge
          600: '#d97706',   // text
          700: '#b45309',   // hover
          DEFAULT: '#f59e0b',
        },

        // ── Semantic: Info ──────────────────────────────
        info: {
          50:  '#eff6ff',   // background
          100: '#dbeafe',   // light fill
          200: '#bfdbfe',   // border
          500: '#3b82f6',   // icon / badge
          600: '#2563eb',   // text
          700: '#1d4ed8',   // hover
          DEFAULT: '#3b82f6',
        },

        // ── Editor / Code theme ─────────────────────────
        editor: {
          bg:      '#193549',
          'bg-dark': '#15232d',
          border:  '#0d161d',
          text:    '#e0e0e0',
          muted:   '#657b83',
          comment: '#93a1a1',
          keyword: '#ff9d00',
          string:  '#3ad900',
          number:  '#ff628c',
          function:'#ffc600',
          tag:     '#3585bb',
          success: '#27c93f',
        },

        // ── Surface aliases (semantic backgrounds) ──────
        surface: {
          primary:   '#ffffff',
          secondary: '#f9fafb',
          elevated:  '#ffffff',
          overlay:   'rgba(0, 0, 0, 0.5)',
        },
      },

      // ── Typography scale ──────────────────────────────
      fontSize: {
        'display':  ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'headline': ['1.5rem',  { lineHeight: '2rem',   fontWeight: '600' }],
        'title':    ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'body':     ['1rem',    { lineHeight: '1.5rem',  fontWeight: '400' }],
        'body-sm':  ['0.875rem',{ lineHeight: '1.25rem', fontWeight: '400' }],
        'caption':  ['0.75rem', { lineHeight: '1rem',    fontWeight: '400' }],
        'overline': ['0.625rem',{ lineHeight: '0.75rem', fontWeight: '600', letterSpacing: '0.05em' }],
      },

      // ── Spacing tokens ────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
      },

      // ── Border radius tokens ──────────────────────────
      borderRadius: {
        'xs':  '0.25rem',   // 4px  – tags, small badges
        'sm':  '0.375rem',  // 6px  – inputs, small cards
        'md':  '0.5rem',    // 8px  – cards, dropdowns
        'lg':  '0.75rem',   // 12px – modals, large cards
        'xl':  '1rem',      // 16px – hero cards
        '2xl': '1.5rem',    // 24px – pill buttons
        '3xl': '2rem',      // 32px – large pills
      },

      // ── Shadow tokens (elevation) ─────────────────────
      boxShadow: {
        'xs':       '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm':       '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md':       '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg':       '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'xl':       '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'elevated': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'card':     '0 2px 8px rgba(0, 0, 0, 0.08)',
        'dropdown': '0 4px 16px rgba(0, 0, 0, 0.12)',
      },

      // ── Animation / Motion tokens ─────────────────────
      transitionDuration: {
        'fast':    '150ms',
        'normal':  '250ms',
        'slow':    '400ms',
      },

      // ── Z-index scale ─────────────────────────────────
      zIndex: {
        'dropdown':  '50',
        'sticky':    '100',
        'overlay':   '200',
        'modal':     '300',
        'popover':   '400',
        'toast':     '500',
      },
    },
  },
  plugins: [],
}
