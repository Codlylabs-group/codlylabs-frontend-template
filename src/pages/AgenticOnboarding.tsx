import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, User, Bot } from 'lucide-react';
import { useI18n } from '../i18n';
import { LivePreview } from '../components/LivePreview';
import axios from 'axios';
import { logger } from '../utils/logger';

// Interfaces for our Agent messages
interface AgentMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: Date;
}

export const AgenticOnboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n(); 
  
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: '1',
      role: 'assistant',
      text: t('agenticOnboarding.greeting'),
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [currentBlueprint, setCurrentBlueprint] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitial = useRef(false);
  const pendingPromptRef = useRef<string | null>(null);

  // Capture initial prompt from localStorage on mount (before any render)
  if (!hasProcessedInitial.current) {
    const stored = localStorage.getItem('onboarding_initial_prompt');
    const initial = stored || location.state?.initialPrompt;
    if (initial) {
      pendingPromptRef.current = initial;
      hasProcessedInitial.current = true;
      if (stored) localStorage.removeItem('onboarding_initial_prompt');
    }
  }

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSendMessage = async (text?: string) => {
    const finalInput = text || inputValue;
    if (!finalInput.trim()) return;

    logger.debug("Sending message", { messageLength: finalInput.length });

    // 1. Immediate UI Optimistic Update
    setInputValue(''); 
    setIsThinking(true);
    
    // Only add user message if it's new (not initial prompt sometimes needs special handling, but here we just add it)
    const userMsg: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: finalInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);

    try {
      // Real Backend Call
      const response = await axios.post('/api/v1/blueprint/infer', { prompt: finalInput });
      
      const blueprint = response.data.manifest;
      
      setCurrentBlueprint(blueprint);
      
      const aiMsg: AgentMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response.data.explanation,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error("Error in agent loop:", error);
      
      // Fallback/Error handling
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: t('agenticOnboarding.error'),
        timestamp: new Date()
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  // Process pending prompt from diagnostic after handleSendMessage is defined
  useEffect(() => {
    if (pendingPromptRef.current) {
      const prompt = pendingPromptRef.current;
      pendingPromptRef.current = null;
      handleSendMessage(prompt);
    }
  }, []);

  return (
    <div className="flex h-screen w-full bg-gray-50 text-slate-900 font-sans overflow-hidden">
      
      {/* Left Sidebar: Chat Interaction */}
      <div className="w-full md:w-[35%] min-w-[400px] flex flex-col bg-white border-r border-gray-200 shadow-sm z-10">
        
        {/* Header */}
        <div className="h-16 border-b border-gray-100 flex items-center px-6 justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
                <div onClick={() => navigate('/')} className="cursor-pointer p-2 -ml-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                    <ArrowLeft size={20} />
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-brand-600 p-1.5 rounded-lg">
                        <Sparkles size={16} className="text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">PoC Architect</span>
                </div>
            </div>
            {currentBlueprint && (
                <button
                    onClick={() => {
                        logger.info("Navigating to recommendation");
                        navigate('/recommendation');
                    }}
                    className="ml-auto text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors animate-fade-in flex items-center gap-2"
                >
                    {t('agenticOnboarding.generateStrategy')}
                </button>
            )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-100' : 'bg-brand-50'}`}>
                        {msg.role === 'user' ? <User size={14} className="text-gray-600"/> : <Bot size={14} className="text-brand-600"/>}
                    </div>

                    {/* Bubble */}
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-gray-900 text-white rounded-tr-sm' 
                        : 'bg-white border border-gray-100 text-gray-700 shadow-sm rounded-tl-sm'
                    }`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        <span className={`text-[10px] block mt-2 opacity-60 ${msg.role === 'user' ? 'text-gray-300' : 'text-gray-400'}`}>
                            {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                </div>
            ))}
            
            {isThinking && (
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center">
                        <Bot size={14} className="text-brand-600"/>
                    </div>
                    <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                        <span className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                        </span>
                        <span className="text-xs text-gray-400 font-medium">{t('agenticOnboarding.thinking')}</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-100 bg-white">
            <div className="relative shadow-sm hover:shadow-md transition-shadow dark:shadow-none rounded-xl border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500">
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    placeholder={t('onboarding.answerPlaceholder') || "Describe tu app..."}
                    className="w-full text-sm p-4 pr-12 bg-transparent text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none min-h-[60px] max-h-[150px]"
                    rows={2}
                />
                <button 
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isThinking}
                    className="absolute right-2 bottom-2 p-2 rounded-lg bg-gray-50 text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={18} />
                </button>
            </div>
            <p className="text-center text-[11px] text-gray-400 mt-3 flex items-center justify-center gap-1">
                 <Sparkles size={10} />
                 AI Powered by Codlylabs SDK
            </p>
        </div>
      </div>

      {/* Right Content: Live Preview */}
      <div className="flex-1 bg-gray-50 relative hidden md:block overflow-hidden">
         <LivePreview blueprint={currentBlueprint} isGenerating={isThinking} />
      </div>

    </div>
  );
};
