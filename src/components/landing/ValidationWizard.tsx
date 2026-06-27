import { useState } from 'react'
import {
  Mail,
  Briefcase,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Clock,
} from 'lucide-react'
import { useI18n } from '../../i18n'
import { plgService } from '../../services/plg'

/**
 * ValidationWizard
 * -----------------
 * Lead-capture form for the "AI Validation" funnel. Single screen: industry,
 * work email and the problem to solve. On submit it kicks off background PoC
 * generation and shows a confirmation screen (access link arrives by email).
 */

type Industry =
  | ''
  | 'fintech'
  | 'healthcare'
  | 'retail'
  | 'manufacturing'
  | 'insurance'
  | 'legal'
  | 'logistics'
  | 'realestate'
  | 'energy'
  | 'hr'
  | 'agriculture'
  | 'other'

interface FormState {
  industry: Industry
  email: string
  problem: string
}

const INITIAL_FORM: FormState = {
  industry: '',
  email: '',
  problem: '',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ValidationWizard() {
  const { language } = useI18n()
  const es = language !== 'en'

  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const t = (esText: string, enText: string) => (es ? esText : enText)

  const industries: { value: Industry; label: string }[] = [
    { value: 'fintech', label: t('Banca / Fintech', 'Banking / Fintech') },
    { value: 'healthcare', label: t('Salud', 'Healthcare') },
    { value: 'retail', label: t('Retail / E-commerce', 'Retail / E-commerce') },
    { value: 'manufacturing', label: t('Manufactura', 'Manufacturing') },
    { value: 'insurance', label: t('Seguros', 'Insurance') },
    { value: 'legal', label: t('Legal', 'Legal') },
    { value: 'logistics', label: t('Logística', 'Logistics') },
    { value: 'realestate', label: t('Real Estate', 'Real Estate') },
    { value: 'energy', label: t('Energía', 'Energy') },
    { value: 'hr', label: t('Recursos Humanos', 'Human Resources') },
    { value: 'agriculture', label: t('Agro', 'Agriculture') },
    { value: 'other', label: t('Otra', 'Other') },
  ]

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.industry) next.industry = t('Elegí una industria.', 'Pick an industry.')
    if (!form.email.trim()) next.email = t('El email es obligatorio.', 'Email is required.')
    else if (!EMAIL_RE.test(form.email.trim())) next.email = t('Ingresá un email válido.', 'Enter a valid email.')
    if (!form.problem.trim()) next.problem = t('Contanos qué problema querés resolver.', 'Tell us the problem you want to solve.')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    setSubmitError(null)

    try {
      await plgService.submitValidationRequest({
        industry: form.industry || undefined,
        email: form.email.trim(),
        problem: form.problem.trim(),
        language: es ? 'es' : 'en',
      })
      setSubmitted(true)
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      const status = err?.response?.status
      if (status === 429) {
        setSubmitError(
          typeof detail === 'string'
            ? detail
            : t(
                'Alcanzaste el límite de validaciones gratuitas por hoy. Probá de nuevo más tarde.',
                'You reached the free validation limit for today. Try again later.'
              )
        )
      } else {
        setSubmitError(
          typeof detail === 'string'
            ? detail
            : t(
                'No pudimos enviar tu pedido. Revisá tu conexión e intentá de nuevo.',
                'We could not send your request. Check your connection and try again.'
              )
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ---- Confirmation screen ------------------------------------------------
  if (submitted) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-emerald-100 bg-white p-10 text-center shadow-xl shadow-emerald-100/40">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-9 w-9 text-emerald-600" />
        </div>
        <h3 className="mb-3 text-2xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
          {t('¡Recibimos tu pedido!', 'We got your request!')}
        </h3>
        <p className="mb-2 text-lg text-gray-700">
          {t(
            'En menos de 24 horas vas a recibir el acceso a tu PoC funcional + tu Validation Package en:',
            'In under 24 hours you will receive access to your working PoC + your Validation Package at:'
          )}
        </p>
        <p className="mb-5 inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-base font-semibold text-indigo-700">
          <Mail className="h-4 w-4" />
          {form.email}
        </p>
        <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-left">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-900">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            {t('Tu Validation Package incluye:', 'Your Validation Package includes:')}
          </p>
          <ul className="space-y-1.5 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              {t('PoC funcional lista para probar en vivo.', 'Working PoC ready to try live.')}
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              {t('Análisis de viabilidad y casos de uso de IA.', 'Feasibility analysis and AI use cases.')}
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              {t('Estimación de impacto y próximos pasos.', 'Impact estimate and next steps.')}
            </li>
          </ul>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          {t('Revisá tu casilla (y spam) en las próximas 24 hs.', 'Check your inbox (and spam) within the next 24 hours.')}
        </div>
      </div>
    )
  }

  // ---- Form ---------------------------------------------------------------
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-indigo-100/40 sm:p-8">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
          {t('Validá tu idea de IA gratis', 'Validate your AI idea for free')}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {t(
            'Contanos tu industria, tu email y qué querés resolver. En menos de 24 hs te mandamos una PoC funcional.',
            'Tell us your industry, your email and what you want to solve. In under 24h we send you a working PoC.'
          )}
        </p>
      </div>

      <div className="space-y-5">
        <Field label={t('Industria', 'Industry')} icon={Briefcase} required error={errors.industry}>
          <select
            value={form.industry}
            onChange={(e) => update('industry', e.target.value)}
            className={inputCls(!!errors.industry)}
          >
            <option value="">{t('Seleccioná una industria…', 'Select an industry…')}</option>
            {industries.map((ind) => (
              <option key={ind.value} value={ind.value}>
                {ind.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label={t('Email de trabajo', 'Work email')}
          icon={Mail}
          required
          error={errors.email}
          hint={t('Acá te enviamos el link de acceso a tu AI Validation Package.', "We'll send your AI Validation Package access link here.")}
        >
          <input
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder={t('vos@empresa.com', 'you@company.com')}
            className={inputCls(!!errors.email)}
          />
        </Field>

        <Field
          label={t('¿Qué problema querés resolver con IA?', 'What problem do you want to solve with AI?')}
          icon={Lightbulb}
          required
          error={errors.problem}
        >
          <textarea
            rows={4}
            value={form.problem}
            onChange={(e) => update('problem', e.target.value)}
            placeholder={t(
              'Ej: Necesitamos un asistente para acelerar el análisis crediticio de PyMEs.',
              'e.g. We need an assistant to speed up SME credit analysis.'
            )}
            className={inputCls(!!errors.problem)}
          />
        </Field>
      </div>

      {/* Submit error */}
      {submitError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <ShieldCheck className="h-4 w-4" />
          {t('Tus datos están seguros.', 'Your data is safe.')}
        </span>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('Enviando…', 'Sending…')}
            </>
          ) : (
            <>
              {t('Validar mi idea gratis', 'Validate my idea for free')}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ---- Small helpers --------------------------------------------------------

function inputCls(hasError: boolean) {
  return `w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:ring-2 ${
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-gray-200 focus:border-indigo-400 focus:ring-indigo-100'
  }`
}

interface FieldProps {
  label: string
  icon: React.ComponentType<{ className?: string }>
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}

function Field({ label, icon: Icon, required, error, hint, children }: FieldProps) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-800">
        <Icon className="h-4 w-4 text-indigo-500" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-gray-400">{hint}</p>
      ) : null}
    </div>
  )
}
