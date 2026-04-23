import { Layers, Package } from 'lucide-react'
import { useI18n } from '../../i18n'

export default function WhatIsSection() {
  const { t } = useI18n()

  return (
    <section id="what-is" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          {/* <span className="text-indigo-600 font-bold tracking-widest uppercase text-sm">
            CodlyLabs
          </span> */}
          <h2 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {t('whatIs.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-[#f8f9fa] p-8 rounded-2xl border border-gray-100">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-5">
              <Layers className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-gray-600 leading-relaxed text-lg">
              {t('whatIs.block1')}
            </p>
          </div>

          <div className="bg-[#f8f9fa] p-8 rounded-2xl border border-gray-100">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-5">
              <Package className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-gray-600 leading-relaxed text-lg">
              {t('whatIs.block2')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
