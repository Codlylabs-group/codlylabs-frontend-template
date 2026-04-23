import { useEffect, useRef, useState, useCallback, memo } from "react"
import { ArrowUpCircle, Mic2, UploadCloud } from "lucide-react"
import { useI18n } from "../i18n"

interface PromptBarProps {
  onSubmit: (value: string) => void
  isLoading: boolean
  value?: string
  onChange?: (value: string) => void
  onUpload?: (files: File[]) => void
  uploadedFiles?: File[]
}

type SpeechRecognitionConstructor = new () => any

const recognitionCtor: SpeechRecognitionConstructor | null =
  typeof window !== "undefined"
    ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    : null

function PromptBar({
  onSubmit,
  isLoading,
  value: controlledValue,
  onChange,
  onUpload,
  uploadedFiles,
}: PromptBarProps) {
  const [internalValue, setInternalValue] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const { t } = useI18n()

  const value = controlledValue ?? internalValue

  const setValue = useCallback((next: string | ((prev: string) => string)) => {
    const evaluate = () => {
      return typeof next === 'function' ? next(onChange ? value : internalValue) : next
    }

    const resolved = evaluate()

    if (onChange) {
      onChange(resolved)
    } else {
      setInternalValue(resolved)
    }
  }, [value, internalValue, onChange])

  const handleSubmitValue = useCallback(() => {
    if (!value.trim() || isLoading) return
    onSubmit(value)
    setValue("")
  }, [value, isLoading, onSubmit, setValue])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    handleSubmitValue()
  }, [handleSubmitValue])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmitValue()
    }
  }, [handleSubmitValue])

  const manualStopRef = useRef(false)
  const segmentsRef = useRef<string[]>([])
  const interimRef = useRef('')

  const startRecognition = () => {
    if (!recognitionCtor) {
      return
    }
    segmentsRef.current = []
    interimRef.current = ''
    const recognition = new recognitionCtor()
    recognition.lang = "es-ES"
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const resultTranscript = event.results[i][0]?.transcript ?? ""
        if (event.results[i].isFinal) {
          if (resultTranscript.trim()) {
            segmentsRef.current.push(resultTranscript.trim())
          }
          interimRef.current = ""
        } else {
          interimRef.current = resultTranscript.trim()
        }
      }
    }
    recognition.onend = () => {
      if (!manualStopRef.current) {
        recognition.start()
        return
      }
      setIsListening(false)
      const finalTranscript = [...segmentsRef.current, interimRef.current]
        .filter(Boolean)
        .join(' ')
      if (finalTranscript) {
        setValue((prev) => `${prev ? `${prev} ` : ''}${finalTranscript}`)
      }
      segmentsRef.current = []
      interimRef.current = ''
      manualStopRef.current = false
    }
    recognition.onerror = () => {
      if (!manualStopRef.current) {
        recognition.start()
        return
      }
      setIsListening(false)
    }
    recognitionRef.current = recognition
    recognition.start()
  }

  const handleMicToggle = useCallback(() => {
    if (!recognitionCtor) {
      setMicError(t('prompt.micUnsupported'))
      return
    }

    if (isListening) {
      manualStopRef.current = true
      recognitionRef.current?.stop()
      return
    }

    setMicError(null)
    manualStopRef.current = false
    startRecognition()
    setIsListening(true)
  }, [isListening, t])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    const fileArray = Array.from(files)
    onUpload?.(fileArray)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [onUpload])

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        role="search"
        aria-label={t('prompt.placeholder')}
        className="bg-white/95 border border-white shadow-[0_20px_60px_rgba(15,23,42,0.15)] rounded-[32px] p-5 flex flex-col gap-4 backdrop-blur"
      >
        <label htmlFor="prompt-input" className="sr-only">{t('prompt.placeholder')}</label>
        <textarea
          id="prompt-input"
          rows={5}
          className="flex-1 resize-none outline-none text-neutral-800 placeholder:text-neutral-400 bg-transparent text-base leading-relaxed focus-ring"
          placeholder={t('prompt.placeholder')}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-describedby={isLoading ? "prompt-loading" : undefined}
        />
        <button
          type="submit"
          disabled={!value.trim() || isLoading}
          className="self-end rounded-full bg-brand-600 hover:bg-brand-700 p-3 text-white disabled:opacity-50 transition-colors focus-ring"
          aria-label={t('prompt.send') || 'Enviar mensaje'}
        >
          <ArrowUpCircle className="w-6 h-6" aria-hidden="true" />
        </button>

        <div className={`flex flex-col gap-3 pt-3 border-t border-gray-100 ${value.trim() ? 'mt-6' : 'mt-3'}`}>
          <div className="flex w-full items-center justify-between gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleUploadClick}
              className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-white transition"
              aria-label={t('prompt.uploadFiles')}
              title={t('prompt.uploadFiles')}
            >
              <UploadCloud className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleMicToggle}
              className="group flex items-center justify-center rounded-full border border-transparent bg-white shadow-sm transition hover:shadow-md focus-ring"
              aria-label={isListening ? (t('prompt.stopRecording') || 'Detener grabación') : (t('prompt.startRecording') || 'Iniciar grabación de voz')}
              aria-pressed={isListening}
            >
              <span
                className={`flex items-center justify-center h-10 w-10 rounded-full border transition ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-200 shadow-[0_0_0_6px_rgba(248,113,113,0.5)]'
                    : 'bg-gray-50 text-gray-600 border-gray-200 group-hover:border-gray-300 group-hover:bg-white'
                }`}
              >
                <Mic2 className="w-5 h-5" aria-hidden="true" />
              </span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />
          {uploadedFiles && uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              {uploadedFiles.map((file) => (
                <span
                  key={file.name}
                  className="rounded-full bg-gray-100 px-3 py-1 border border-gray-200"
                >
                  {file.name}
                </span>
              ))}
            </div>
          )}
          {micError && (
            <p className="text-xs text-rose-600">{micError}</p>
          )}
        </div>
      </form>

      {isLoading && (
        <p id="prompt-loading" className="mt-2 text-xs text-neutral-500 text-center" role="status" aria-live="polite">
          {t('onboarding.loader')}
        </p>
      )}
    </div>
  )
}

export default memo(PromptBar)
