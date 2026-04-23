import { useI18n } from '../i18n'

interface TechStackViewerProps {
  category: string
  stack: string[]
}

export default function TechStackViewer({ category, stack }: TechStackViewerProps) {
  const { t } = useI18n()
  
  if (!stack.length) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {t('techStack.title')}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {t('techStack.description', { category })}
      </p>
      <div className="flex flex-wrap gap-2">
        {stack.map((item) => (
          <span
            key={item}
            className="inline-flex items-center px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium border border-brand-100"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

