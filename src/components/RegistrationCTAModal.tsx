import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Linkedin, Sparkles, Code, Share2, Rocket } from 'lucide-react'
import { authApi, saveAuthReturnUrl } from '../services/auth'
import { useI18n } from '../i18n'

export type CTATrigger = 'generation_complete' | 'second_attempt' | 'edit_attempt'

interface RegistrationCTAModalProps {
  open: boolean
  onClose: () => void
  trigger?: CTATrigger
}

export default function RegistrationCTAModal({ open, onClose, trigger = 'generation_complete' }: RegistrationCTAModalProps) {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [isLoadingLinkedIn, setIsLoadingLinkedIn] = useState(false)

  const TRIGGER_TITLES: Record<CTATrigger, string> = {
    generation_complete: t('cta.generationComplete.title'),
    second_attempt: t('cta.secondAttempt.title'),
    edit_attempt: t('cta.editAttempt.title'),
  }

  const TRIGGER_SUBTITLES: Record<CTATrigger, string> = {
    generation_complete: t('cta.generationComplete.subtitle'),
    second_attempt: t('cta.secondAttempt.subtitle'),
    edit_attempt: t('cta.editAttempt.subtitle'),
  }

  const BENEFITS = [
    { icon: Code, text: t('cta.benefit.editCode') },
    { icon: Rocket, text: t('cta.benefit.deploy') },
    { icon: Share2, text: t('cta.benefit.share') },
    { icon: Sparkles, text: t('cta.benefit.unlimited') },
  ]

  const handleLinkedIn = useCallback(async () => {
    setIsLoadingLinkedIn(true)
    saveAuthReturnUrl()
    try {
      const url = await authApi.getLinkedInAuthUrl()
      window.location.href = url
    } catch {
      navigate('/login')
    } finally {
      setIsLoadingLinkedIn(false)
    }
  }, [navigate])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm mx-4 p-6 sm:p-8">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
          {TRIGGER_TITLES[trigger]}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-5">
          {TRIGGER_SUBTITLES[trigger]}
        </p>

        {/* Benefits */}
        <div className="space-y-2.5 mb-6">
          {BENEFITS.map((b) => (
            <div key={b.text} className="flex items-center gap-2.5">
              <b.icon className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">{b.text}</span>
            </div>
          ))}
        </div>

        {/* LinkedIn button */}
        <button
          type="button"
          disabled={isLoadingLinkedIn}
          onClick={handleLinkedIn}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0077b5] text-white text-sm font-semibold hover:bg-[#005f8d] transition-colors disabled:opacity-60 mb-2.5"
        >
          <Linkedin className="w-4 h-4" />
          {isLoadingLinkedIn ? t('cta.linkedInLoading') : t('cta.linkedIn')}
        </button>

        {/* Email button */}
        <button
          type="button"
          onClick={() => { saveAuthReturnUrl(); navigate('/register') }}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg border-2 border-gray-200 text-gray-700 text-sm font-semibold hover:border-gray-300 transition-colors mb-3"
        >
          {t('cta.emailRegister')}
        </button>

        {/* Continue without */}
        <button
          type="button"
          onClick={onClose}
          className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          {t('cta.continueWithout')}
        </button>
      </div>
    </div>
  )
}
