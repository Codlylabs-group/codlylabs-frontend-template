import { FormEvent, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { authApi } from '../services/auth'

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tokenFromUrl = useMemo(() => searchParams.get('token') || '', [searchParams])

  const [token, setToken] = useState(tokenFromUrl)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      setLoading(true)
      setError(null)
      const response = await authApi.resetPassword(token.trim(), newPassword, confirmPassword)
      setMessage(response.message)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No se pudo restablecer la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Paper elevation={0} className="w-full max-w-lg border border-gray-200 p-6">
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={700}>
            Restablecer contraseña
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Token"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Nueva contraseña"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Confirmar contraseña"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar contraseña'}
              </Button>
            </Stack>
          </form>

          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          <Button variant="text" onClick={() => navigate('/onboarding')}>
            Volver
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}

export default ResetPasswordPage

