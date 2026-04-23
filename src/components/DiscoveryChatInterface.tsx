/**
 * Discovery Chat Interface
 * Natural conversational interface for the Discovery Agent
 */

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Send, Loader2, Sparkles, Mic, MicOff } from 'lucide-react';
import type { Message } from '../types/discovery';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useI18n } from '../i18n';

interface DiscoveryChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
  status?: string;
}

// Simple markdown renderer for basic formatting - memoized
const RenderMarkdown = memo(({ text }: { text: string }): JSX.Element => {
  // Convert **bold** to <strong>
  let html = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Convert *italic* to <em>
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Convert numbered lists (1. 2. etc)
  html = html.replace(/^(\d+\.\s.+)$/gm, '<div class="ml-4">$1</div>');

  // Convert bullet points (- or *)
  html = html.replace(/^[-*]\s(.+)$/gm, '<div class="ml-4">• $1</div>');

  // Preserve line breaks
  html = html.replace(/\n/g, '<br />');

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
});

const DiscoveryChatInterfaceComponent: React.FC<DiscoveryChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading = false,
  status,
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { t } = useI18n();
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition({});

  // Sync transcript to input
  useEffect(() => {
    if (transcript) {
        // If we want to append, we'd need to track what part is new.
        // For now, let's just use the transcript as the input value while listening?
        // Or better: Let user speak, and we set it.
        // Issue: if hook resets transcript on start, we are good.
        setInputValue(transcript);
    }
  }, [transcript]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when not loading
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue;
    setInputValue('');
    await onSendMessage(message);
  }, [inputValue, isLoading, onSendMessage]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'client' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === 'client'
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.role === 'agent' && (
                <div className="flex items-center mb-1">
                  <Sparkles className="w-4 h-4 mr-2 text-brand-600" />
                  <span className="text-xs font-medium text-brand-600">
                    Discovery Agent
                  </span>
                </div>
              )}
              <div className="text-sm">
                {message.role === 'agent'
                  ? <RenderMarkdown text={message.message} />
                  : <p className="whitespace-pre-wrap">{message.message}</p>
                }
              </div>
              <span className="text-xs opacity-70 mt-1 block">
                {new Date(message.timestamp).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                <span className="text-sm text-gray-600">
                  {t('discoveryChat.thinking')}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        {/* Status Indicator */}
        {status && status !== 'in_progress' && (
          <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              {status === 'ready_for_confirmation' && t('discoveryChat.reviewSynthesis')}
              {status === 'completed' && t('discoveryChat.discoveryCompleted')}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-3">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`px-3 py-3 rounded-lg border transition-colors flex items-center justify-center ${
              isListening
                ? 'bg-red-50 border-red-200 text-red-600 animate-pulse'
                : 'bg-white border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            title={isListening ? t('discoveryChat.stopDictation') : t('discoveryChat.activateMic')}
            disabled={isLoading || status === 'ready_for_confirmation' || status === 'completed'}
          >
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
          <textarea
            ref={inputRef}
            rows={2}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              isListening
                ? t('discoveryChat.listening')
                : (isLoading ? t('discoveryChat.waitingAgent') : t('discoveryChat.placeholder'))
            }
            disabled={isLoading || status === 'ready_for_confirmation' || status === 'completed'}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || status === 'ready_for_confirmation' || status === 'completed'}
            className="bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {t('discoveryChat.send')}
          </button>
        </form>

        {/* Helper Text */}
        <p className="text-xs text-gray-500 mt-2">
          {t('discoveryChat.helperText')}
        </p>
      </div>
    </div>
  );
};

export const DiscoveryChatInterface = memo(DiscoveryChatInterfaceComponent);

export default DiscoveryChatInterface;
