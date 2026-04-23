import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material'
import { Code, Eye, Brain, Cpu, Bot, ArrowRight, Sparkles } from 'lucide-react'
import { useAppSelector } from '../store/hooks'

const ARCHETYPES = [
  {
    id: 'code_generation',
    icon: Code,
    title: 'Code Generation',
    description: 'Genera código, scripts, APIs y aplicaciones completas con IA',
    examples: ['Generador de funciones', 'API builder', 'CLI tools'],
  },
  {
    id: 'vision_realtime',
    icon: Eye,
    title: 'Computer Vision',
    description: 'Detección de objetos, análisis de imágenes y procesamiento visual',
    examples: ['Object detection', 'Landmark recognition', 'Quality inspection'],
  },
  {
    id: 'rag_documental',
    icon: Brain,
    title: 'RAG / NLP',
    description: 'Búsqueda semántica, chatbots documentales y análisis de texto',
    examples: ['PDF Q&A', 'Knowledge base', 'Document classifier'],
  },
  {
    id: 'ml_predictive',
    icon: Cpu,
    title: 'ML Predictivo',
    description: 'Modelos de predicción, clasificación y series de tiempo',
    examples: ['Churn prediction', 'Demand forecast', 'Anomaly detection'],
  },
  {
    id: 'agents',
    icon: Bot,
    title: 'AI Agents',
    description: 'Agentes autónomos que ejecutan tareas complejas paso a paso',
    examples: ['API navigator', 'Data analyst', 'Code reviewer'],
  },
]

const WIZARD_STEPS = ['Bienvenida', 'Tu interés', 'Primer proyecto']

export default function WelcomePage() {
  const navigate = useNavigate()
  const user = useAppSelector((s) => s.user.user)
  const [activeStep, setActiveStep] = useState(0)
  const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null)

  const userName = user?.full_name?.split(' ')[0] || 'usuario'

  const handleArchetypeSelect = (id: string) => {
    setSelectedArchetype(id)
    setActiveStep(2)
  }

  const handleStartProject = () => {
    // Check if user came from anonymous session
    const anonSessionId = sessionStorage.getItem('anon_session_id')
    if (anonSessionId) {
      navigate('/onboarding')
      return
    }

    // Navigate to /try with the archetype as context
    if (selectedArchetype) {
      navigate(`/try?template=${selectedArchetype}`)
    } else {
      navigate('/try')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0f', color: 'white', py: 4 }}>
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 3 }}>
        {/* Stepper */}
        <Stepper
          activeStep={activeStep}
          sx={{
            mb: 5,
            '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.5)' },
            '& .MuiStepLabel-label.Mui-active': { color: 'white' },
            '& .MuiStepLabel-label.Mui-completed': { color: '#a5b4fc' },
            '& .MuiStepIcon-root': { color: 'rgba(255,255,255,0.15)' },
            '& .MuiStepIcon-root.Mui-active': { color: '#6366f1' },
            '& .MuiStepIcon-root.Mui-completed': { color: '#6366f1' },
          }}
        >
          {WIZARD_STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 0: Welcome */}
        {activeStep === 0 && (
          <Box textAlign="center">
            <Sparkles size={48} color="#6366f1" style={{ margin: '0 auto 16px' }} />
            <Typography variant="h3" fontWeight={800} mb={2}>
              Bienvenido, {userName}!
            </Typography>
            <Typography variant="h6" color="rgba(255,255,255,0.6)" fontWeight={400} mb={1}>
              CodlyLabs genera PoCs funcionales con IA en minutos.
            </Typography>
            <Typography variant="body1" color="rgba(255,255,255,0.5)" mb={4}>
              Describe tu idea, y la plataforma genera el código, el preview y el deploy.
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowRight size={18} />}
              onClick={() => setActiveStep(1)}
              sx={{
                bgcolor: '#6366f1',
                '&:hover': { bgcolor: '#4f46e5' },
                px: 5,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Comenzar
            </Button>
          </Box>
        )}

        {/* Step 1: Archetype selection */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h4" fontWeight={800} textAlign="center" mb={1}>
              Qué tipo de PoC te interesa?
            </Typography>
            <Typography variant="body1" color="rgba(255,255,255,0.5)" textAlign="center" mb={4}>
              Selecciona una categoría para personalizar tu experiencia.
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {ARCHETYPES.map((arch) => (
                <Card
                  key={arch.id}
                  onClick={() => handleArchetypeSelect(arch.id)}
                  sx={{
                    bgcolor: selectedArchetype === arch.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                    border: selectedArchetype === arch.id
                      ? '2px solid #6366f1'
                      : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#6366f1',
                      bgcolor: 'rgba(99,102,241,0.08)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                      <arch.icon size={22} color="#a5b4fc" />
                      <Typography fontWeight={700} color="white">
                        {arch.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="rgba(255,255,255,0.6)" mb={1.5}>
                      {arch.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {arch.examples.map((ex) => (
                        <Chip
                          key={ex}
                          label={ex}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.06)',
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: 11,
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* Step 2: First project */}
        {activeStep === 2 && (
          <Box textAlign="center">
            <Typography variant="h4" fontWeight={800} mb={2}>
              Listo para tu primer PoC!
            </Typography>
            <Typography variant="body1" color="rgba(255,255,255,0.5)" mb={4}>
              {selectedArchetype
                ? `Vamos a crear un PoC de ${ARCHETYPES.find((a) => a.id === selectedArchetype)?.title || ''}.`
                : 'Describe tu idea y la IA se encarga del resto.'}
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowRight size={18} />}
              onClick={handleStartProject}
              sx={{
                bgcolor: '#6366f1',
                '&:hover': { bgcolor: '#4f46e5' },
                px: 5,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Crear mi primer PoC
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  )
}
