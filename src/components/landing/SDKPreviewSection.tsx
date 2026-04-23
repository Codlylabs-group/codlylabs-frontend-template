import { Terminal, Shield, Blocks, Code2 } from 'lucide-react'
import { useI18n } from '../../i18n'

export default function SDKPreviewSection() {
  const { t } = useI18n()

  const features = [
    {
      icon: Code2,
      title: t('sdk.feature.typeSafe.title'),
      desc: t('sdk.feature.typeSafe.desc'),
    },
    {
      icon: Blocks,
      title: t('sdk.feature.modular.title'),
      desc: t('sdk.feature.modular.desc'),
    },
    {
      icon: Shield,
      title: t('sdk.feature.enterprise.title'),
      desc: t('sdk.feature.enterprise.desc'),
    },
  ]

  return (
    <section className="relative bg-black py-24 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-6">
              <Terminal className="w-4 h-4" />
              {t('sdk.badge')}
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              {t('sdk.title')}
            </h2>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed">
              {t('sdk.subtitle')}
            </p>

            <div className="space-y-8 mb-10">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-brand-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* <a
              href="/docs/sdk" // Placeholder link
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-500 transition-colors"
            >
              {t('sdk.cta')}
              <ArrowRight className="w-4 h-4" />
            </a> */}
          </div>

          {/* Right Column: Code Window */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-purple-600 rounded-2xl blur opacity-20" />
            <div className="relative bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
              {/* Window Controls */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-gray-800">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <div className="ml-4 text-xs text-gray-500 font-mono">generate-poc.ts</div>
              </div>

              {/* Code Content */}
              <div className="p-6 overflow-x-auto">
                <pre className="font-mono text-sm leading-relaxed">
                  <code className="text-gray-300">
                    <span className="text-purple-400">import</span> {'{'} <span className="text-yellow-400">PocSDK</span> {'}'} <span className="text-purple-400">from</span> <span className="text-green-400">'codlylabs_poc_sdk'</span>;
                    {'\n\n'}
                    <span className="text-gray-500">{t('sdk.code.comment')}</span>
                    {'\n'}
                    <span className="text-purple-400">const</span> <span className="text-blue-400">poc</span> = <span className="text-purple-400">await</span> <span className="text-yellow-400">PocSDK</span>.<span className="text-blue-400">create</span>({'{'}
                    {'\n'}
                    {'  '}type: <span className="text-green-400">'rag_chatbot'</span>,
                    {'\n'}
                    {'  '}vertical: <span className="text-green-400">'legal'</span>,
                    {'\n'}
                    {'  '}data: [<span className="text-green-400">'./contracts.pdf'</span>]
                    {'\n'}
                    {'}'});
                    {'\n\n'}
                    <span className="text-gray-500">{t('sdk.code.deploy')}</span>
                    {'\n'}
                    <span className="text-purple-400">await</span> <span className="text-blue-400">poc</span>.<span className="text-blue-400">deploy</span>();
                  </code>
                </pre>
              </div>
            </div>

            {/* Floating Terminal Output (Optional visual flair) */}
            <div className="absolute -bottom-6 -right-6 lg:-right-12 bg-black/90 backdrop-blur-xl rounded-xl border border-gray-800 p-4 shadow-xl max-w-sm hidden md:block">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-emerald-500 font-bold uppercase">Deployment Successful</span>
              </div>
              <div className="space-y-1 font-mono text-[10px] text-gray-400">
                <p>✓ Infrastructure provisioned (Terraform)</p>
                <p>✓ Models optimized (ONNX)</p>
                <p>✓ API endpoints active</p>
                <p className="text-white mt-2">{'>'} Access your POC at: <span className="text-underline">https://legal-bot-xy.poc.app</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
