import { useEffect, useState } from 'react'
import { ArrowLeft, Loader2, Shield, ArrowRight, Plug, CheckCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n'
import { getVerticalPackStaticData } from '../data/verticalPack'
import { verticalPacksApi, VerticalPackSummary as VPSummary } from '../services/verticalPacks'
import { useAppSelector } from '../store/hooks'

export default function VerticalPackPage() {
  const { t, language } = useI18n()
  const navigate = useNavigate()
  const [packs, setPacks] = useState<VPSummary[]>([])
  const [loading, setLoading] = useState(true)
  const staticData = getVerticalPackStaticData(language)
  const isAuthenticated = useAppSelector((state) => state.user.tokens !== null)

  useEffect(() => {
    verticalPacksApi
      .listPacks(language)
      .then((data) => {
        setPacks(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [language])

  // Use API data if available, otherwise fallback to static data
  const hasDynamicPacks = packs.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(isAuthenticated ? '/workspace' : '/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{isAuthenticated ? 'Volver al workspace' : t('verticalPack.back')}</span>
          </button>
          <p className="text-xs text-gray-500">{staticData.summary.vertical}</p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <header className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-wide text-brand-600 font-semibold">
            {t('verticalPack.label')}
          </p>
          <h1 className="text-4xl font-bold text-gray-900">{t('verticalPack.title')}</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('verticalPack.subtitle')}
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              to="/roi-oracle"
              className="inline-flex items-center justify-center px-6 py-3 bg-brand-600 text-white font-semibold rounded-full hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
            >
              {t('verticalPack.heroCta')}
            </Link>
          </div>
        </header>

        {/* Summary tiles */}
        <section className="grid sm:grid-cols-3 gap-4">
          <Tile
            label={t('verticalPack.cards.pocs')}
            value={hasDynamicPacks ? `${packs.reduce((sum, p) => sum + p.total_blueprints, 0)}` : `${staticData.summary.pocTemplates}`}
          />
          <Tile
            label={t('verticalPack.cards.cases')}
            value={hasDynamicPacks ? `${packs.reduce((sum, p) => sum + p.total_pocs_generated, 0)}+` : `${staticData.summary.curatedCases}+`}
          />
          <Tile
            label={t('verticalPack.cards.compliance')}
            value={hasDynamicPacks
              ? `${new Set(packs.flatMap((p) => p.compliance_modules)).size}`
              : `${staticData.summary.complianceModules.length}`
            }
            helper={t('verticalPack.cards.complianceHelper')}
          />
        </section>

        {/* Vertical Packs grid (dynamic or static fallback) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{t('verticalPack.portfolio.title')}</h2>
            <span className="text-xs text-gray-500">{t('verticalPack.portfolio.subtitle')}</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
            </div>
          ) : hasDynamicPacks ? (
            <div className="grid md:grid-cols-3 gap-4">
              {packs.map((pack) => {
                const localized = staticData.portfolio.find((item) => item.slug === pack.slug)
                return (
                  <Link
                    key={pack.slug}
                    to={`/vertical-pack/${pack.slug}`}
                    className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3 hover:border-brand-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                        {localized?.name || pack.name}
                      </h3>
                      {(localized?.badge || pack.badge) && (
                        <span className="text-[11px] uppercase font-semibold text-white bg-brand-600 px-3 py-1 rounded-full">
                          {localized?.badge || pack.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{localized?.summary || pack.short_description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{pack.total_blueprints} {t('verticalPack.blueprintsLabel')}</span>
                      {pack.compliance_modules.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {pack.compliance_modules.length} {t('verticalPack.complianceModules')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-brand-600 font-medium">
                      {t('verticalPack.viewDetail')}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {staticData.portfolio.map((pack) => (
                <Link
                  key={pack.slug}
                  to={`/vertical-pack/${pack.slug}`}
                  className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3 hover:border-brand-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">{pack.name}</h3>
                    <span className="text-[11px] uppercase font-semibold text-white bg-brand-600 px-3 py-1 rounded-full">
                      {pack.badge}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{pack.summary}</p>
                  <div className="flex items-center gap-1 text-sm text-brand-600 font-medium">
                    {t('verticalPack.viewDetail')}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>


        {/* Connectors - Integration Kits */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{t('verticalPack.connectors.title')}</h2>
            <span className="text-xs text-gray-500">{staticData.connectors.length} kits</span>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {staticData.connectors.map((connector) => (
              <div
                key={connector.name}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
              >
                <Plug className="w-4 h-4 text-brand-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{connector.name}</p>
                  <p className="text-xs text-gray-500">{connector.system}</p>
                </div>
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              </div>
            ))}
          </div>
        </section>

        {/* Compliance */}
        <section className="bg-gradient-to-br from-brand-50 to-purple-50 rounded-2xl p-6 border border-brand-100 text-gray-900">
          <h3 className="text-lg font-semibold">{t('verticalPack.compliance.title')}</h3>
          <p className="text-sm text-gray-600 mb-3">{t('verticalPack.compliance.subtitle')}</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {(hasDynamicPacks
              ? [...new Set(packs.flatMap((p) => p.compliance_modules))]
              : staticData.summary.complianceModules
            ).map((module) => (
              <li key={module}>{module}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}

interface TileProps {
  label: string
  value: string
  helper?: string
}

function Tile({ label, value, helper }: TileProps) {
  return (
    <article className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm space-y-2">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
      {helper && <p className="text-xs text-gray-500">{helper}</p>}
    </article>
  )
}

