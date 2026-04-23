import { describe, it, expect } from 'vitest'
import theme, { tokens } from './theme'

describe('MUI Theme', () => {
  it('has brand primary color matching design tokens', () => {
    expect(theme.palette.primary.main).toBe('#4f46e5')
  })

  it('has correct primary dark color', () => {
    expect(theme.palette.primary.dark).toBe('#4338ca')
  })

  it('has correct primary light color', () => {
    expect(theme.palette.primary.light).toBe('#a5b4fc')
  })

  it('has correct text colors', () => {
    expect(theme.palette.text.primary).toBe('#111827')
    expect(theme.palette.text.secondary).toBe('#4b5563')
  })

  it('has correct background colors', () => {
    expect(theme.palette.background.default).toBe('#f9fafb')
    expect(theme.palette.background.paper).toBe('#ffffff')
  })

  it('uses Inter font family', () => {
    expect(theme.typography.fontFamily).toContain('Inter')
  })

  it('has correct typography sizes', () => {
    expect(theme.typography.h1?.fontSize).toBe('2.25rem')
    expect(theme.typography.h2?.fontSize).toBe('1.5rem')
    expect(theme.typography.body1?.fontSize).toBe('1rem')
    expect(theme.typography.button?.fontWeight).toBe(500)
  })

  it('disables button elevation by default', () => {
    const buttonDefaults = theme.components?.MuiButton?.defaultProps
    expect(buttonDefaults?.disableElevation).toBe(true)
  })

  it('exports token values', () => {
    expect(tokens.brand[500]).toBe('#6366f1')
    expect(tokens.brand[600]).toBe('#4f46e5')
    expect(tokens.neutral[900]).toBe('#111827')
  })

  it('has semantic error colors', () => {
    expect(theme.palette.error.main).toBe('#ef4444')
    expect(theme.palette.error.dark).toBe('#dc2626')
  })

  it('has semantic success colors', () => {
    expect(theme.palette.success.main).toBe('#10b981')
    expect(theme.palette.success.dark).toBe('#059669')
  })

  it('has semantic warning colors', () => {
    expect(theme.palette.warning.main).toBe('#f59e0b')
    expect(theme.palette.warning.dark).toBe('#d97706')
  })

  it('has semantic info colors', () => {
    expect(theme.palette.info.main).toBe('#3b82f6')
    expect(theme.palette.info.dark).toBe('#2563eb')
  })

  it('has correct shape borderRadius', () => {
    expect(theme.shape.borderRadius).toBe(8)
  })

  it('has correct secondary colors', () => {
    expect(theme.palette.secondary.main).toBe('#4b5563')
    expect(theme.palette.secondary.dark).toBe('#1f2937')
  })

  it('exports all color tokens', () => {
    expect(tokens.brand).toBeDefined()
    expect(tokens.neutral).toBeDefined()
    expect(tokens.semantic).toBeDefined()
  })

  it('has focus visible outline styles for accessibility', () => {
    const buttonBase = theme.components?.MuiButtonBase?.styleOverrides?.root as any
    expect(buttonBase?.['&:focus-visible']).toBeDefined()
  })

  it('has MUI TextField styleOverrides', () => {
    const textFieldOverrides = theme.components?.MuiTextField?.styleOverrides
    expect(textFieldOverrides?.root).toBeDefined()
  })

  it('has MUI Dialog styleOverrides', () => {
    const dialogOverrides = theme.components?.MuiDialog?.styleOverrides
    expect(dialogOverrides?.paper).toBeDefined()
  })

  it('has divider color', () => {
    expect(theme.palette.divider).toBe('#e5e7eb')
  })

  it('has correct action colors', () => {
    expect(theme.palette.action.disabled).toBe('#9ca3af')
  })

  it('has neutral color palette exported', () => {
    expect(tokens.neutral[50]).toBe('#f9fafb')
    expect(tokens.neutral[100]).toBe('#f3f4f6')
    expect(tokens.neutral[950]).toBe('#0f172a')
  })

  it('has semantic color light variants', () => {
    expect(tokens.semantic.success.light).toBe('#ecfdf5')
    expect(tokens.semantic.error.light).toBe('#fef2f2')
    expect(tokens.semantic.warning.light).toBe('#fffbeb')
    expect(tokens.semantic.info.light).toBe('#eff6ff')
  })
})
