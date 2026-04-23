import { useState, useCallback, useMemo, memo } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant' | 'question'
  content: string
  timestamp: Date
}

interface Question {
  id: string
  text: string
  type: string
  options?: string[]
  required: boolean
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => Promise<void>
  onAnswerQuestion: (questionId: string, answer: string) => Promise<void>
  messages: Message[]
  currentQuestions?: Question[]
  isLoading?: boolean
}

function ChatInterface({
  onSendMessage,
  onAnswerQuestion,
  messages,
  currentQuestions = [],
  isLoading = false
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('')
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({})

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    await onSendMessage(inputValue)
    setInputValue('')
  }, [inputValue, isLoading, onSendMessage])

  const handleAnswerQuestion = useCallback((questionId: string, answer: string) => {
    setQuestionAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }, [])

  const handleSubmitAnswers = useCallback(async () => {
    const answers = Object.entries(questionAnswers)
    if (answers.length === 0) return

    for (const [questionId, answer] of answers) {
      await onAnswerQuestion(questionId, answer)
    }
    setQuestionAnswers({})
  }, [questionAnswers, onAnswerQuestion])

  const renderQuestion = useMemo(() => (question: Question) => {
    const answer = questionAnswers[question.id] || ''

    switch (question.type) {
      case 'multiple_choice':
        return (
          <div key={question.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={answer}
              onChange={(e) => handleAnswerQuestion(question.id, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecciona una opción</option>
              {question.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )

      case 'yes_no':
        return (
          <div key={question.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => handleAnswerQuestion(question.id, 'Sí')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                  answer === 'Sí'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Sí
              </button>
              <button
                onClick={() => handleAnswerQuestion(question.id, 'No')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                  answer === 'No'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                No
              </button>
            </div>
          </div>
        )

      case 'open':
      default:
        return (
          <div key={question.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={answer}
              onChange={(e) => handleAnswerQuestion(question.id, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Escribe tu respuesta aquí..."
            />
          </div>
        )
    }
  }, [questionAnswers])

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-md" role="region" aria-label="Chat de discovery">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite" aria-label="Mensajes del chat">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              role={message.type === 'assistant' ? 'status' : undefined}
              aria-label={message.type === 'user' ? 'Tu mensaje' : 'Respuesta del asistente'}
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-brand-600 text-white'
                  : message.type === 'question'
                  ? 'bg-purple-50 text-purple-900 border border-purple-200'
                  : 'bg-neutral-100 text-neutral-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block" aria-label={`Enviado a las ${message.timestamp.toLocaleTimeString()}`}>
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}

        {/* Current Questions Form */}
        {currentQuestions.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-3">
              Preguntas para entender mejor tu necesidad:
            </h4>
            {currentQuestions.map((question) => renderQuestion(question))}
            <button
              onClick={handleSubmitAnswers}
              disabled={isLoading || Object.keys(questionAnswers).length === 0}
              className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando...
                </span>
              ) : (
                'Enviar Respuestas'
              )}
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start" id="chat-loading" role="status" aria-live="polite" aria-label="Procesando respuesta">
            <div className="bg-neutral-100 rounded-lg p-3">
              <Loader2 className="w-5 h-5 animate-spin text-neutral-600" aria-hidden="true" />
              <span className="sr-only">Procesando respuesta...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2" role="form" aria-label="Enviar mensaje">
          <label htmlFor="chat-input" className="sr-only">Describe tu necesidad o pregunta</label>
          <input
            id="chat-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe tu necesidad o pregunta..."
            className="flex-1 p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent focus-ring"
            disabled={isLoading}
            aria-describedby={isLoading ? "chat-loading" : undefined}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="bg-brand-600 text-white px-6 py-3 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 focus-ring"
            aria-label="Enviar mensaje"
          >
            <Send className="w-5 h-5" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default memo(ChatInterface)
