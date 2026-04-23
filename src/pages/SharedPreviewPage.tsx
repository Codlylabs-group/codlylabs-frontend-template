import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress, Paper, Typography } from '@mui/material'
import { ExternalLink, ArrowLeft, Share2, Copy, Rocket } from 'lucide-react'
import { projectsApi, SharedDeploymentResponse } from '../services/projects'
import { API_BASE_URL } from '../services/api'

const isLoopbackHost = (host: string): boolean =>
  host === 'localhost' || host === '127.0.0.1' || host === '::1'

const normalizePreviewUrl = (rawUrl: string): string => {
  if (rawUrl.startsWith('/')) {
    if (API_BASE_URL) {
      try {
        return new URL(rawUrl, API_BASE_URL).toString()
      } catch {
        return rawUrl
      }
    }
    return rawUrl
  }

  try {
    const parsed = new URL(rawUrl)
    if (typeof window === 'undefined') return parsed.toString()
    if (isLoopbackHost(parsed.hostname) && !isLoopbackHost(window.location.hostname)) {
      parsed.hostname = window.location.hostname
      parsed.protocol = window.location.protocol
    }
    return parsed.toString()
  } catch {
    return rawUrl
  }
}


export default function SharedPreviewPage() {
  const { shareSlug } = useParams<{ shareSlug: string }>()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<SharedDeploymentResponse | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!shareSlug) {
      setError('Share URL inválida')
      setIsLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError('')
      try {
        const response = await projectsApi.getSharedDeployment(shareSlug)
        if (!cancelled) {
          setData(response)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.response?.data?.detail || 'No se pudo abrir el deployment compartido')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [shareSlug])

  const previewUrl = data?.deployment?.preview_url ? normalizePreviewUrl(data.deployment.preview_url) : ''
  // Use the direct Vite dev server URL.
  // The preview-proxy breaks Vite's CJS→ESM module transformation.
  const previewEmbedUrl = data?.deployment?.poc_id
    ? previewUrl
    : previewUrl

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Share2 size={16} />
          <Typography fontWeight={600}>Preview Compartido</Typography>
          {data?.project?.name && (
            <Typography variant="body2" color="text.secondary">
              {data.project.name}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button size="small" startIcon={<ArrowLeft size={14} />} onClick={() => navigate(-1)}>
            Volver
          </Button>
          {previewUrl && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<ExternalLink size={14} />}
              onClick={() => window.open(previewUrl, '_blank')}
            >
              Abrir en nueva pestaña
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {isLoading && (
          <Paper sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography>Resolviendo deployment compartido...</Typography>
          </Paper>
        )}

        {!isLoading && error && (
          <Alert severity="error">{error}</Alert>
        )}

        {!isLoading && !error && data && !previewUrl && (
          <Alert severity="warning">
            El deployment existe, pero el preview no está disponible en este momento.
          </Alert>
        )}

        {!isLoading && !error && previewEmbedUrl && (
          <Paper sx={{ flex: 1, overflow: 'hidden' }}>
            <iframe
              src={previewEmbedUrl}
              title="Shared preview"
              style={{ width: '100%', height: '100%', minHeight: 540, border: 'none' }}
              allow="camera; microphone; fullscreen; autoplay; display-capture; clipboard-read; clipboard-write; geolocation"
            />
          </Paper>
        )}

        {/* PLG CTA Banner */}
        {!isLoading && !error && data && (
          <Paper
            sx={{
              mt: 1,
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              bgcolor: 'rgba(99,102,241,0.05)',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rocket size={18} />
              <Typography variant="body2" fontWeight={600}>
                Este PoC fue creado con CodlyLabs. Construye el tuyo en 60 segundos.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Copy size={14} />}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
              >
                {copied ? 'Copiado!' : 'Copiar enlace'}
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => navigate('/try')}
                sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, textTransform: 'none' }}
              >
                Prueba gratis
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  )
}
