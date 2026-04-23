import { X, ChevronRight } from 'lucide-react'
import * as Icons from 'lucide-react'
import { Vertical, Poc } from '../data/pocs'

interface PocSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  vertical: Vertical | null
  onSelectPoc: (poc: Poc) => void
}

export function PocSelectionModal({ isOpen, onClose, vertical, onSelectPoc }: PocSelectionModalProps) {
  if (!isOpen || !vertical) return null

  // Dynamically get the icon component
  const IconComponent = (Icons as any)[vertical.icon] || Icons.HelpCircle

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{vertical.name}</h2>
              <p className="text-sm text-gray-500">Selecciona el caso de uso</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {vertical.pocs.map((poc) => (
            <button
              key={poc.id}
              onClick={() => onSelectPoc(poc)}
              className="w-full text-left group flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-brand-300 hover:bg-brand-50/50 transition-all duration-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
                    {poc.name}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 uppercase">
                    {poc.interface}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {poc.description}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-500 mt-1 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
