import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatInterface from '../ChatInterface'

const mockMessages = [
  { id: '1', type: 'assistant' as const, content: 'Hola, ¿en qué puedo ayudarte?', timestamp: new Date('2026-01-01T10:00:00') },
  { id: '2', type: 'user' as const, content: 'Necesito una PoC de fraud detection', timestamp: new Date('2026-01-01T10:01:00') },
]

const defaultProps = {
  onSendMessage: vi.fn().mockResolvedValue(undefined),
  onAnswerQuestion: vi.fn().mockResolvedValue(undefined),
  messages: mockMessages,
  currentQuestions: [],
  isLoading: false,
}

describe('ChatInterface', () => {
  it('renders messages correctly', () => {
    render(<ChatInterface {...defaultProps} />)
    expect(screen.getByText('Hola, ¿en qué puedo ayudarte?')).toBeInTheDocument()
    expect(screen.getByText('Necesito una PoC de fraud detection')).toBeInTheDocument()
  })

  it('has accessible chat region', () => {
    render(<ChatInterface {...defaultProps} />)
    expect(screen.getByRole('region', { name: /chat/i })).toBeInTheDocument()
    expect(screen.getByRole('log')).toBeInTheDocument()
  })

  it('has accessible input with label', () => {
    render(<ChatInterface {...defaultProps} />)
    const input = screen.getByPlaceholderText('Describe tu necesidad o pregunta...')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('id', 'chat-input')
  })

  it('disables submit button when input is empty', () => {
    render(<ChatInterface {...defaultProps} />)
    const button = screen.getByRole('button', { name: /enviar/i })
    expect(button).toBeDisabled()
  })

  it('calls onSendMessage when form is submitted', async () => {
    const user = userEvent.setup()
    const onSendMessage = vi.fn().mockResolvedValue(undefined)
    render(<ChatInterface {...defaultProps} onSendMessage={onSendMessage} />)

    const input = screen.getByPlaceholderText('Describe tu necesidad o pregunta...')
    await user.type(input, 'Mi consulta')

    const button = screen.getByRole('button', { name: /enviar/i })
    await user.click(button)

    await waitFor(() => {
      expect(onSendMessage).toHaveBeenCalledWith('Mi consulta')
    })
  })

  it('shows loading indicator when isLoading is true', () => {
    render(<ChatInterface {...defaultProps} isLoading={true} />)
    expect(screen.getByRole('status', { name: /procesando/i })).toBeInTheDocument()
  })

  it('disables input when loading', () => {
    render(<ChatInterface {...defaultProps} isLoading={true} />)
    const input = screen.getByPlaceholderText('Describe tu necesidad o pregunta...')
    expect(input).toBeDisabled()
  })

  it('renders multiple choice questions', async () => {
    const questions = [{
      id: 'q1',
      text: '¿Cuál es tu industria?',
      type: 'multiple_choice',
      options: ['Fintech', 'Healthcare', 'Retail'],
      required: true,
    }]
    render(<ChatInterface {...defaultProps} currentQuestions={questions} />)
    expect(screen.getByText('¿Cuál es tu industria?')).toBeInTheDocument()
    expect(screen.getByText('Fintech')).toBeInTheDocument()
  })

  it('clears input after sending message', async () => {
    const user = userEvent.setup()
    render(<ChatInterface {...defaultProps} />)
    const input = screen.getByPlaceholderText('Describe tu necesidad o pregunta...') as HTMLInputElement

    await user.type(input, 'Test message')
    expect(input.value).toBe('Test message')

    const button = screen.getByRole('button', { name: /enviar/i })
    await user.click(button)

    await waitFor(() => {
      expect(input.value).toBe('')
    })
  })

  it('handles yes/no questions', async () => {
    const user = userEvent.setup()
    const questions = [{
      id: 'q1',
      text: '¿Tienes experiencia en AI?',
      type: 'yes_no',
      required: true,
    }]
    const onAnswerQuestion = vi.fn().mockResolvedValue(undefined)
    render(<ChatInterface {...defaultProps} currentQuestions={questions} onAnswerQuestion={onAnswerQuestion} />)

    const yesButton = screen.getByRole('button', { name: 'Sí' })
    await user.click(yesButton)

    const submitButton = screen.getByRole('button', { name: /Enviar Respuestas/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(onAnswerQuestion).toHaveBeenCalledWith('q1', 'Sí')
    })
  })

  it('disables submit answers button when no questions answered', () => {
    const questions = [{
      id: 'q1',
      text: '¿Cuál es tu industria?',
      type: 'multiple_choice',
      options: ['Fintech', 'Healthcare'],
      required: true,
    }]
    render(<ChatInterface {...defaultProps} currentQuestions={questions} />)

    const submitButton = screen.getByRole('button', { name: /Enviar Respuestas/i })
    expect(submitButton).toBeDisabled()
  })
})
