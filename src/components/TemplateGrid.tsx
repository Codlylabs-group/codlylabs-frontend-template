import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
} from '@mui/material'
import { ArrowRight } from 'lucide-react'
import { api } from '../services/api'

interface Template {
  id: string | number
  name: string
  vertical: string
  interface: string
  poc_type: string
}

interface TemplateGridProps {
  category?: string
  limit?: number
  onSelect?: (templateId: string) => void
}

export default function TemplateGrid({ category, limit = 12, onSelect }: TemplateGridProps) {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeVertical, setActiveVertical] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (category) params.set('category', category)
        params.set('limit', String(limit))
        const res = await api.get(`/api/v1/plg/templates?${params.toString()}`)
        if (!cancelled) {
          setTemplates(res.data.templates || [])
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [category, limit])

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  if (templates.length === 0) return null

  const verticals = [...new Set(templates.map((t) => t.vertical))]
  const filtered = activeVertical
    ? templates.filter((t) => t.vertical === activeVertical)
    : templates

  const handleSelect = (tmpl: Template) => {
    const id = String(tmpl.id)
    if (onSelect) {
      onSelect(id)
    } else {
      navigate(`/try?template=${id}`)
    }
  }

  return (
    <Box>
      {/* Vertical filter chips */}
      {verticals.length > 1 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, justifyContent: 'center' }}>
          <Chip
            label="Todos"
            variant={activeVertical === null ? 'filled' : 'outlined'}
            onClick={() => setActiveVertical(null)}
            sx={{
              bgcolor: activeVertical === null ? '#6366f1' : undefined,
              color: activeVertical === null ? 'white' : 'rgba(255,255,255,0.7)',
              borderColor: 'rgba(255,255,255,0.15)',
            }}
          />
          {verticals.map((v) => (
            <Chip
              key={v}
              label={v}
              variant={activeVertical === v ? 'filled' : 'outlined'}
              onClick={() => setActiveVertical(v)}
              sx={{
                bgcolor: activeVertical === v ? '#6366f1' : undefined,
                color: activeVertical === v ? 'white' : 'rgba(255,255,255,0.7)',
                borderColor: 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </Box>
      )}

      {/* Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
        {filtered.map((tmpl) => (
          <Card
            key={tmpl.id}
            sx={{
              bgcolor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { borderColor: '#6366f1', bgcolor: 'rgba(99,102,241,0.08)' },
            }}
            onClick={() => handleSelect(tmpl)}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography fontWeight={600} color="white" mb={0.5} noWrap>
                {tmpl.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
                <Chip
                  label={tmpl.vertical}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                />
                <Chip
                  label={tmpl.poc_type}
                  size="small"
                  sx={{ bgcolor: 'rgba(99,102,241,0.1)', color: '#a5b4fc', fontSize: 11 }}
                />
              </Box>
              <Button
                size="small"
                endIcon={<ArrowRight size={14} />}
                sx={{ color: '#a5b4fc', textTransform: 'none', p: 0, minWidth: 0 }}
              >
                Usar template
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  )
}
