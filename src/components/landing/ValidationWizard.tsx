import { useState } from 'react'
import {
  Building2,
  Mail,
  User,
  Briefcase,
  Target,
  Database,
  Workflow,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
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
 * Multi-step lead-capture form for the "AI Validation" funnel.
 * Captures company data + a discovery-style request + a (required) email.
 * On submit it shows a confirmation screen telling the user they will receive
 * access to their PoC by email in under 24h.
 *
 * NOTE: front-only. The actual submission to the backend (create discovery
 * session -> enqueue generation -> send email with preview link) is NOT wired
 * yet. The TODO below marks exactly where that integration goes.
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
  companyName: string
  industry: Industry
  fullName: string
  role: string
  email: string
  problem: string
  currentProcess: string
  goals: string
  data: string
}

const INITIAL_FORM: FormState = {
  companyName: '',
  industry: '',
  fullName: '',
  role: '',
  email: '',
  problem: '',
  currentProcess: '',
  goals: '',
  data: '',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ValidationWizard() {
  const { language } = useI18n()
  const es = language !== 'en'

  const [step, setStep] = useState(0)
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

  const steps = [
    { label: t('Tu empresa', 'Your company'), icon: Building2 },
    { label: t('Tu idea', 'Your idea'), icon: Lightbulb },
    { label: t('Objetivos y datos', 'Goals & data'), icon: Target },
    { label: t('Revisión', 'Review'), icon: CheckCircle2 },
  ]

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validateStep = (current: number): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (current === 0) {
      if (!form.companyName.trim()) next.companyName = t('Ingresá el nombre de tu empresa.', 'Enter your company name.')
      if (!form.industry) next.industry = t('Elegí una industria.', 'Pick an industry.')
      if (!form.fullName.trim()) next.fullName = t('Ingresá tu nombre.', 'Enter your name.')
      if (!form.email.trim()) next.email = t('El email es obligatorio.', 'Email is required.')
      else if (!EMAIL_RE.test(form.email.trim())) next.email = t('Ingresá un email válido.', 'Enter a valid email.')
    }
    if (current === 1) {
      if (!form.problem.trim()) next.problem = t('Contanos qué problema querés resolver.', 'Tell us the problem you want to solve.')
    }
    if (current === 2) {
      if (!form.goals.trim()) next.goals = t('Contanos qué querés lograr.', 'Tell us what you want to achieve.')
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleNext = () => {
    if (!validateStep(step)) return
    setStep((s) => Math.min(s + 1, steps.length - 1))
  }

  const handleBack = () => setStep((s) => Math.max(s - 1, 0))

  const handleSubmit = async () => {
    // Re-validate every gated step before submitting.
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      // Jump to the first step that has an error.
      if (!validateStep(0)) setStep(0)
      else if (!validateStep(1)) setStep(1)
      else setStep(2)
      return
    }
    setSubmitting(true)
    setSubmitError(null)

    try {
      await plgService.submitValidationRequest({
        company_name: form.companyName.trim(),
        industry: form.industry || undefined,
        full_name: form.fullName.trim(),
        role: form.role.trim() || undefined,
        email: form.email.trim(),
        problem: form.problem.trim(),
        current_process: form.currentProcess.trim() || undefined,
        goals: form.goals.trim(),
        data: form.data.trim() || undefined,
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
          {t('En menos de 24 horas vas a recibir el acceso a tu PoC en:', 'In under 24 hours you will receive access to your PoC at:')}
        </p>
        <p className="mb-6 inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-base font-semibold text-indigo-700">
          <Mail className="h-4 w-4" />
          {form.email}
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          {t('Revisá tu casilla (y spam) en las próximas 24 hs.', 'Check your inbox (and spam) within the next 24 hours.')}
        </div>
      </div>
    )
  }

  // ---- Wizard -------------------------------------------------------------
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-indigo-100/40 sm:p-8">
      {/* Stepper */}
      <div className="mb-8 flex items-center justify-between">
        {steps.map((s, i) => {
          const Icon = s.icon
          const active = i === step
          const done = i < step
          return (
            <div key={s.label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                    done
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : active
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                      : 'border-gray-200 bg-white text-gray-300'
                  }`}
                >
                  {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span
                  className={`mt-2 hidden text-xs font-semibold sm:block ${
                    active || done ? 'text-indigo-600' : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`mx-2 h-0.5 flex-1 rounded ${done ? 'bg-indigo-600' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step 0 — Company */}
      {step === 0 && (
        <div className="space-y-5">
          <Field
            label={t('Nombre de la empresa', 'Company name')}
            icon={Building2}
            required
            error={errors.companyName}
          >
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => update('companyName', e.target.value)}
              placeholder={t('Ej: Banco del Río', 'e.g. Río Bank')}
              className={inputCls(!!errors.companyName)}
            />
          </Field>

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

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t('Tu nombre', 'Your name')} icon={User} required error={errors.fullName}>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                placeholder={t('Nombre y apellido', 'Full name')}
                className={inputCls(!!errors.fullName)}
              />
            </Field>
            <Field label={t('Cargo (opcional)', 'Role (optional)')} icon={Briefcase}>
              <input
                type="text"
                value={form.role}
                onChange={(e) => update('role', e.target.value)}
                placeholder={t('Ej: Head of Innovation', 'e.g. Head of Innovation')}
                className={inputCls(false)}
              />
            </Field>
          </div>

          <Field
            label={t('Email de trabajo', 'Work email')}
            icon={Mail}
            required
            error={errors.email}
            hint={t('Acá te enviamos el link de acceso a tu PoC.', "We'll send your PoC access link here.")}
          >
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder={t('vos@empresa.com', 'you@company.com')}
              className={inputCls(!!errors.email)}
            />
          </Field>
        </div>
      )}

      {/* Step 1 — The idea */}
      {step === 1 && (
        <div className="space-y-5">
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

          <Field
            label={t('¿Cómo lo resuelven hoy? (opcional)', 'How do you handle it today? (optional)')}
            icon={Workflow}
            hint={t('Proceso actual, herramientas, cuántas personas, cuánto tarda.', 'Current process, tools, people involved, time it takes.')}
          >
            <textarea
              rows={3}
              value={form.currentProcess}
              onChange={(e) => update('currentProcess', e.target.value)}
              placeholder={t('Ej: Un analista revisa manualmente cada legajo en Excel…', 'e.g. An analyst manually reviews each file in Excel…')}
              className={inputCls(false)}
            />
          </Field>
        </div>
      )}

      {/* Step 2 — Goals & data */}
      {step === 2 && (
        <div className="space-y-5">
          <Field
            label={t('¿Qué querés lograr?', 'What do you want to achieve?')}
            icon={Target}
            required
            error={errors.goals}
            hint={t('Reducir tiempos, bajar errores, aumentar productividad…', 'Reduce time, lower errors, increase productivity…')}
          >
            <textarea
              rows={3}
              value={form.goals}
              onChange={(e) => update('goals', e.target.value)}
              placeholder={t('Ej: Reducir el tiempo de aprobación de 3 días a 1 hora.', 'e.g. Cut approval time from 3 days to 1 hour.')}
              className={inputCls(!!errors.goals)}
            />
          </Field>

          <Field
            label={t('¿Qué datos tenés disponibles? (opcional)', 'What data do you have available? (optional)')}
            icon={Database}
            hint={t('Bases, documentos, APIs, sistemas (SAP, CRM, etc.).', 'Databases, documents, APIs, systems (SAP, CRM, etc.).')}
          >
            <textarea
              rows={3}
              value={form.data}
              onChange={(e) => update('data', e.target.value)}
              placeholder={t('Ej: Histórico de operaciones en SQL + PDFs de balances.', 'e.g. Transaction history in SQL + balance-sheet PDFs.')}
              className={inputCls(false)}
            />
          </Field>
        </div>
      )}

      {/* Step 3 — Review */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {t('Revisá tu pedido', 'Review your request')}
          </h3>
          <div className="space-y-3 rounded-2xl bg-gray-50 p-5">
            <Review label={t('Empresa', 'Company')} value={form.companyName} />
            <Review
              label={t('Industria', 'Industry')}
              value={industries.find((i) => i.value === form.industry)?.label || '—'}
            />
            <Review label={t('Contacto', 'Contact')} value={`${form.fullName}${form.role ? ` · ${form.role}` : ''}`} />
            <Review label="Email" value={form.email} highlight />
            <Review label={t('Problema', 'Problem')} value={form.problem} />
            {form.currentProcess && <Review label={t('Proceso actual', 'Current process')} value={form.currentProcess} />}
            <Review label={t('Objetivos', 'Goals')} value={form.goals} />
            {form.data && <Review label={t('Datos', 'Data')} value={form.data} />}
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
            <p className="text-sm text-indigo-900">
              {t(
                'Al enviar, en menos de 24 hs vas a recibir el acceso a tu PoC funcional en tu email. Sin costo.',
                'Once you submit, you will receive access to your working PoC by email in under 24 hours. Free of charge.'
              )}
            </p>
          </div>
        </div>
      )}

      {/* Submit error */}
      {submitError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* Nav buttons */}
      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={handleBack}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('Atrás', 'Back')}
          </button>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <ShieldCheck className="h-4 w-4" />
            {t('Tus datos están seguros.', 'Your data is safe.')}
          </span>
        )}

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500"
          >
            {t('Continuar', 'Continue')}
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
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
        )}
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

function Review({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <span className="w-32 shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</span>
      <span className={`text-sm ${highlight ? 'font-semibold text-indigo-700' : 'text-gray-700'}`}>{value}</span>
    </div>
  )
}
