import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { authApi, type UserProfileResponse } from '../services/auth'

const formatDate = (value?: string | null): string => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function ProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const response = await authApi.getProfile()
        setProfile(response)
        setError(null)
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'No se pudo cargar el perfil')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const roleLabel = useMemo(() => {
    if (!profile) return ''
    return `${profile.roles.effective_role} (${profile.roles.organization_role})`
  }, [profile])

  if (loading) {
    return (
      <Box className="min-h-screen flex items-center justify-center">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box className="min-h-screen p-6">
        <Stack spacing={2} maxWidth={720} margin="0 auto">
          <Alert severity="error">{error}</Alert>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Volver
          </Button>
        </Stack>
      </Box>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <Box className="min-h-screen bg-gray-50 p-6">
      <Stack spacing={3} maxWidth={980} margin="0 auto">
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" fontWeight={700}>
            Perfil de Usuario
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/onboarding')}>
            Ir a onboarding
          </Button>
        </Stack>

        <Paper elevation={0} className="border border-gray-200 p-5">
          <Stack spacing={1}>
            <Typography variant="h6">{profile.user.full_name || profile.user.email}</Typography>
            <Typography color="text.secondary">{profile.user.email}</Typography>
            <Stack direction="row" spacing={1}>
              <Chip label={`Rol: ${roleLabel}`} color={profile.roles.effective_role === 'admin' ? 'primary' : 'default'} />
              <Chip
                label={`Plan: ${profile.organization.plan}`}
                variant="outlined"
                onClick={() => navigate('/billing')}
                sx={{ cursor: 'pointer' }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Ultimo login: {formatDate(profile.user.last_login)}
            </Typography>
          </Stack>
        </Paper>

        <Paper elevation={0} className="border border-gray-200 p-5">
          <Typography variant="h6" gutterBottom>
            Uso de Presupuesto
          </Typography>
          <Typography variant="body2">Presupuesto: ${profile.usage.budget_usd.toFixed(2)}</Typography>
          <Typography variant="body2">Consumido: ${profile.usage.spent_usd.toFixed(2)}</Typography>
          <Typography variant="body2">Disponible: ${profile.usage.remaining_usd.toFixed(2)}</Typography>
          <Typography variant="body2">Uso: {profile.usage.usage_percentage.toFixed(2)}%</Typography>
        </Paper>

        <Paper elevation={0} className="border border-gray-200 p-5">
          <Typography variant="h6" gutterBottom>
            Proyectos ({profile.totals.projects})
          </Typography>
          <Stack spacing={1.5}>
            {profile.projects.length === 0 ? (
              <Typography color="text.secondary">Todavia no hay proyectos para este tenant.</Typography>
            ) : (
              profile.projects.map((project) => (
                <Paper key={project.id} variant="outlined" className="p-3">
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography fontWeight={600}>{project.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {project.poc_type} - {project.vertical}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => navigate(`/preview/${project.current_poc_id}`)}
                    >
                      Abrir
                    </Button>
                  </Stack>
                </Paper>
              ))
            )}
          </Stack>
        </Paper>
      </Stack>
    </Box>
  )
}

export default ProfilePage

