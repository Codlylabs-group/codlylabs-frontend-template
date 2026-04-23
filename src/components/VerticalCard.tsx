import * as Icons from 'lucide-react'
import { Vertical } from '../data/pocs'

interface VerticalCardProps {
  vertical: Vertical
  onClick: () => void
}

export function VerticalCard({ vertical, onClick }: VerticalCardProps) {
  // Dynamically get the icon component
  const IconComponent = (Icons as any)[vertical.icon] || Icons.HelpCircle

  return (
    <button
      onClick={onClick}
      className="flex flex-col text-left p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-brand-100 transition-all duration-200 group h-full"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-100 group-hover:text-brand-700 transition-colors">
          <IconComponent className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{vertical.name}</h3>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
            {vertical.pocs.length} POCs
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-500 leading-relaxed">
        {vertical.description}
      </p>
    </button>
  )
}
