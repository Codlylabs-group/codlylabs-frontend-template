import { useI18n } from '../i18n'

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function MessageLog({ messages }: { messages: Message[] }) {
  const { t } = useI18n()
  
  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      {messages.map((m) => (
        <div
          key={m.id}
          className="w-full max-w-3xl bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow-sm"
        >
          <div className="text-xs text-gray-500 mb-1">
            {m.type === 'user' ? t('messageLog.user') : t('messageLog.assistant')}
          </div>
          <div className="whitespace-pre-line text-gray-800">
            {m.content}
          </div>
        </div>
      ))}
    </div>
  )
}
