import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { authApi } from '../services/auth'

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setLoading(true)
      setError(null)
      const response = await authApi.forgotPassword(email.trim())
      setMessage(response.message)
      setToken(response.token || null)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo generar el recovery token')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Paper elevation={0} className="w-full max-w-lg border border-gray-200 p-6">
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={700}>
            Recuperar contraseña
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ingresa tu email para generar un token de recuperación.
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                type="email"
                label="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Generando...' : 'Enviar'}
              </Button>
            </Stack>
          </form>

          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          {token && (
            <Alert severity="info">
              Token generado: <strong>{token}</strong>
              <br />
              <Button
                size="small"
                sx={{ mt: 1 }}
                onClick={() => navigate(`/auth/reset-password?token=${encodeURIComponent(token)}`)}
              >
                Ir a reset
              </Button>
            </Alert>
          )}

          <Button variant="text" onClick={() => navigate('/onboarding')}>
            Volver
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

export default ForgotPasswordPage

