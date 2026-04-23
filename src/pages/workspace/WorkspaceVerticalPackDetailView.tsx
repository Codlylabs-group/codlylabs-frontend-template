import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import VerticalPackDetailPage from '../VerticalPackDetailPage'
import { useWorkspaceOutletContext } from './WorkspaceLayout'
import { useI18n } from '../../i18n'

// Wrapper thin del detail de vertical pack para que viva DENTRO del workspace.
// Reutiliza el componente `VerticalPackDetailPage` en modo `embedded`, lo cual
// omite el wrapper full-screen y el botón de "volver al listado" nativo. El
// sidebar del workspace provee la navegación; acá agregamos un back inline
// arriba del contenido para que el user pueda volver a /workspace/verticals
// sin depender solo del sidebar.
export default function WorkspaceVerticalPackDetailView() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { setHeader } = useWorkspaceOutletContext()
  const { t, language } = useI18n()

  useEffect(() => {
    setHeader(
      language === 'es' ? 'Detalle de vertical' : 'Vertical detail',
      language === 'es'
        ? 'Casos de uso curados listos para generar como PoC.'
        : 'Curated use cases ready to generate as a PoC.',
    )
  }, [setHeader, language, slug])

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/workspace/verticals')}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('verticalPack.detail.backToList')}</span>
      </button>
      <VerticalPackDetailPage embedded />
    </div>
  )
}
