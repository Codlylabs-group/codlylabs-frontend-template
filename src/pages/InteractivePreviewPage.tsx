/**
 * Interactive Preview Page
 *
 * A page that shows a live preview of a POC with an AI-powered chat interface
 * for making code modifications. Similar to Lovable, Base44, and Emergent.
 *
 * Layout:
 * - Left panel (30%): Chat with AI agent
 * - Right panel (70%): Live preview iframe
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";
import {
  Send,
  RefreshCw,
  Monitor,
  Smartphone,
  ArrowLeft,
  FileCode,
  Sparkles,
  CheckCircle,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
  Share2,
  Copy,
  X,
} from "lucide-react";
import { api } from "../services/api";
import { pocGeneratorApi } from "../services/pocGenerator";
import { ACCESS_TOKEN_KEY } from "../services/authStorage";
import PreviewLoadingState from "../components/PreviewLoadingState";
import AgentActivityFeed from "../components/AgentActivityFeed";
import type { AgentTurn, EditorEvent } from "../types/editorEvents";
import { logger } from "../utils/logger";
import { useLogout } from "../hooks/useLogout";
import { useAppSelector } from "../store/hooks";

// Types
interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  filesModified?: string[];
  filesCreated?: string[];
  suggestions?: string[];
  success?: boolean;
}

interface ExampleCategory {
  name: string;
  icon: string;
  examples: string[];
}

interface ValidationCheck {
  id: string;
  name: string;
  status: "pending" | "running" | "passed" | "failed" | "fixed" | "skipped";
  error?: string;
  fix?: string;
}

interface AgentChatPayload {
  success: boolean;
  message: string;
  files_modified?: string[];
  files_created?: string[];
  suggestions?: string[];
  errors?: string[];
}

type ValidationPhase = "initializing" | "validating" | "fixing" | "complete" | "error";

// Deduplicate preview creation requests per POC to avoid duplicate POSTs
// under React.StrictMode double-mount in development.
const previewCreateRequests = new Map<string, Promise<any>>();

// Espejo de _BACKEND_INTENT_KEYWORDS / _derive_initial_plan en
// backend/app/api/v1/interactive_editor.py — los mantenemos sincronizados
// para que el plan que ve el usuario al mandar el mensaje coincida con el que
// el backend va a emitir vía WebSocket. Si después llega el `editor_plan` real
// del backend, sobreescribimos el local.
const BACKEND_INTENT_KEYWORDS = [
  'endpoint', 'endpoints', 'backend', 'api ', '/api', 'ruta', 'rutas',
  'servicio', 'service', 'guardar', 'persistir', 'almacenar', 'base de datos',
  'database', 'sqlite', 'postgres', 'redis', 'qdrant', 'fastapi', 'router',
  'modelo', 'model', 'ml', 'ia', 'llm', 'gpt', 'claude', 'openai', 'anthropic',
  'embedding', 'vector', 'rag', 'ingest', 'procesar', 'subir', 'upload',
  'descargar', 'download', 'auth', 'login', 'registrar', 'register', 'webhook',
  'cron', 'stripe', 'paypal',
];

// Espejo de _NEW_COMPONENT_KEYWORDS / _request_hints_new_component en el
// backend. Cuando el pedido implica UI nueva (visor, modal, panel, etc.) el
// plan local incluye un paso explícito "Crear componente nuevo" para que el
// LLM no infle pages existentes.
const NEW_COMPONENT_KEYWORDS = [
  'visor', 'viewer', 'modal', 'dialog', 'popup', 'panel',
  'selector', 'picker', 'tabla', 'table', 'grid',
  'formulario', 'form', 'wizard',
  'dashboard', 'tablero', 'gráfico', 'grafico', 'chart',
  'vista', 'view', 'componente', 'component',
  'card', 'tarjeta', 'lista', 'list',
  'menu', 'menú', 'navbar', 'sidebar', 'header', 'footer',
  'preview', 'previa', 'previsualiza',
  'uploader', 'cargador',
  'chat', 'conversa',
];

function requestHintsBackend(message: string): boolean {
  const text = (message || '').toLowerCase();
  return BACKEND_INTENT_KEYWORDS.some((kw) => text.includes(kw));
}

function requestHintsNewComponent(message: string): boolean {
  const text = (message || '').toLowerCase();
  return NEW_COMPONENT_KEYWORDS.some((kw) => text.includes(kw));
}

function deriveLocalPlan(message: string): string[] {
  const text = (message || '').toLowerCase();
  const steps: string[] = ['Analizar el pedido'];
  const layoutHints = /\b(layout|sidebar|menu|header|navbar|tema|color|estilo)\b/;
  if (layoutHints.test(text)) {
    steps.push('Localizar layout/navegación a tocar');
  } else {
    steps.push('Identificar archivos relevantes');
  }
  if (requestHintsBackend(message)) {
    steps.push('Crear/editar endpoint en backend');
  }
  if (requestHintsNewComponent(message)) {
    steps.push('Crear componente nuevo en frontend/src/components/');
    steps.push('Insertar el componente en la page (import + uso)');
  } else if (requestHintsBackend(message)) {
    steps.push('Conectar el frontend al endpoint nuevo');
  } else {
    steps.push('Aplicar cambios en frontend');
  }
  steps.push('Validar sintaxis y preview');
  return steps;
}

const isLoopbackHost = (host: string): boolean =>
  host === "localhost" || host === "127.0.0.1" || host === "::1";

const normalizePreviewUrl = (rawUrl: string): string => {
  try {
    const parsed = new URL(rawUrl);
    if (typeof window === "undefined") return parsed.toString();

    // If backend returns localhost but UI is served from another host/device,
    // rewrite the host so the browser can actually reach the preview.
    if (isLoopbackHost(parsed.hostname) && !isLoopbackHost(window.location.hostname)) {
      parsed.hostname = window.location.hostname;
      parsed.protocol = window.location.protocol;
    }

    return parsed.toString();
  } catch {
    return rawUrl;
  }
};

const createOrGetPreview = async (pocId: string) => {
  const existing = previewCreateRequests.get(pocId);
  if (existing) {
    return existing;
  }

  const request = (async () => {
    try {
      return await pocGeneratorApi.createPreview(pocId);
    } catch (createError: any) {
      if (createError.response?.status === 409) {
        const response = await api.get(`/api/v1/poc-preview/preview/${pocId}`);
        return response.data;
      }
      throw createError;
    }
  })();

  previewCreateRequests.set(pocId, request);
  try {
    return await request;
  } finally {
    if (previewCreateRequests.get(pocId) === request) {
      previewCreateRequests.delete(pocId);
    }
  }
};

// Helper Components
const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-500">{message.content}</span>
      </div>
    );
  }

  return (
    <div className={`flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[90%] px-5 py-4 ${isUser ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm' : 'bg-gray-50 text-gray-900 rounded-2xl rounded-bl-sm'}`}>
        <p className="text-sm leading-6 whitespace-pre-wrap">{message.content}</p>
        {message.filesModified && message.filesModified.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200/20">
            <span className="text-xs font-medium">📝 Modificados:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {message.filesModified.map((file, i) => (
                <span key={i} className={`text-xs font-mono px-2 py-0.5 rounded ${isUser ? 'bg-white/20' : 'bg-indigo-50 text-indigo-700'}`}>{file.split("/").pop()}</span>
              ))}
            </div>
          </div>
        )}
        {message.filesCreated && message.filesCreated.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200/20">
            <span className="text-xs font-medium">✨ Creados:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {message.filesCreated.map((file, i) => (
                <span key={i} className={`text-xs font-mono px-2 py-0.5 rounded border ${isUser ? 'border-white/30 text-white/90' : 'border-gray-200 text-gray-600'}`}>{file.split("/").pop()}</span>
              ))}
            </div>
          </div>
        )}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200/20">
            <span className="text-xs font-medium">💡 Sugerencias:</span>
            <ul className="mt-1 pl-3 space-y-0.5">
              {message.suggestions.map((sugg, i) => (
                <li key={i} className="text-sm opacity-80">{sugg}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const ExamplePrompts = ({
  categories,
  onSelect,
}: {
  categories: ExampleCategory[];
  onSelect: (prompt: string) => void;
}) => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  return (
    <div>
      {categories.map((category) => (
        <div key={category.name}>
          <button
            type="button"
            onClick={() => setOpenCategory(openCategory === category.name ? null : category.name)}
            className="w-full flex items-center gap-2 py-2.5 px-1 hover:bg-gray-50 rounded-lg text-left"
          >
            <span>{category.icon}</span>
            <span className="text-base flex-1">{category.name}</span>
            {openCategory === category.name ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {openCategory === category.name && (
            <div className="pl-8 space-y-0.5">
              {category.examples.map((example, i) => (
                <button key={i} type="button" onClick={() => onSelect(example)} className="block w-full text-left text-sm text-gray-500 hover:text-indigo-600 py-1.5 hover:bg-indigo-50 rounded px-2 transition-colors">
                  {example}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Main Component
export default function InteractivePreviewPage() {
  const { pocId } = useParams<{ pocId: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const userData = useAppSelector((state) => state.user.user);
  const finish = useLogout(userData ? "/workspace" : "/");

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  // Lista de turnos del agente. Cada turno se asocia al mensaje del usuario
  // que lo originó (`userMessageId`) y se renderiza JUSTO debajo de ese
  // mensaje, manteniendo la cronología natural del chat.
  const [agentTurns, setAgentTurns] = useState<AgentTurn[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const [viewportSize, setViewportSize] = useState<"desktop" | "mobile">("desktop");
  const [exampleCategories, setExampleCategories] = useState<ExampleCategory[]>([]);
  const [showExamples, setShowExamples] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" | "info" }>({
    open: false,
    message: "",
    severity: "info",
  });
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Validation state
  const [isValidating, setIsValidating] = useState(false);
  const [validationPhase, setValidationPhase] = useState<ValidationPhase>("initializing");
  const [validationMessage, setValidationMessage] = useState("");
  const [validationChecks, setValidationChecks] = useState<ValidationCheck[]>([]);
  const [totalErrors, setTotalErrors] = useState(0);
  const [totalFixed, setTotalFixed] = useState(0);
  const [validationComplete, setValidationComplete] = useState(false);
  const previewInitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const validationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const wsResponseReceivedRef = useRef(false);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const clearValidationTimeout = useCallback(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
      validationTimeoutRef.current = null;
    }
  }, []);

  const clearPreviewInitTimeout = useCallback(() => {
    if (previewInitTimeoutRef.current) {
      clearTimeout(previewInitTimeoutRef.current);
      previewInitTimeoutRef.current = null;
    }
  }, []);

  const markValidationComplete = useCallback(
    (message?: string) => {
      clearValidationTimeout();
      clearPreviewInitTimeout();
      if (message) {
        setValidationMessage(message);
      }
      setValidationComplete(true);
      setIsValidating(false);
    },
    [clearValidationTimeout, clearPreviewInitTimeout]
  );

  useEffect(() => {
    return () => {
      clearValidationTimeout();
      clearPreviewInitTimeout();
    };
  }, [clearValidationTimeout, clearPreviewInitTimeout]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  // Aplica una mutación al ÚLTIMO turno activo (el que no está completed/failed).
  // Si no hay ningún turno activo, opcionalmente arranca uno nuevo. Centraliza
  // la lógica para que los handlers del WS no contaminen turnos cerrados con
  // eventos rezagados (lo que antes causaba "el chat queda enganchado al
  // pedido anterior").
  const updateActiveTurn = useCallback(
    (
      updater: (turn: AgentTurn) => AgentTurn,
      options?: { startIfMissing?: () => AgentTurn },
    ) => {
      setAgentTurns((prev) => {
        const last = prev.length > 0 ? prev[prev.length - 1] : null;
        if (!last || last.completed || last.failed) {
          if (options?.startIfMissing) {
            return [...prev, options.startIfMissing()];
          }
          return prev;
        }
        return [...prev.slice(0, -1), updater(last)];
      });
    },
    [],
  );

  const appendAgentMessage = useCallback((data: AgentChatPayload) => {
    setMessages((prev) => {
      const content = data.message || t('editor.toast.changesApplied');
      const filesModified = data.files_modified || [];
      const filesCreated = data.files_created || [];

      const last = prev[prev.length - 1];
      if (
        last &&
        last.role === "assistant" &&
        last.content === content &&
        JSON.stringify(last.filesModified || []) === JSON.stringify(filesModified) &&
        JSON.stringify(last.filesCreated || []) === JSON.stringify(filesCreated)
      ) {
        return prev;
      }

      return [
        ...prev.filter((m) => m.id !== "thinking"),
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content,
          timestamp: new Date(),
          filesModified,
          filesCreated,
          suggestions: data.suggestions || [],
          success: data.success,
        },
      ];
    });
  }, []);

  // Initialize preview
  useEffect(() => {
    if (!pocId) return;

    const initPreview = async () => {
      setIsLoading(true);
      setIsValidating(true);
      setValidationComplete(false);
      setValidationPhase("initializing");
      setValidationMessage(t('editor.validation.creating'));
      setValidationChecks([]);
      setTotalErrors(0);
      setTotalFixed(0);

      try {
        // Deduplicated creation to avoid duplicate requests in StrictMode.
        setValidationMessage(t('editor.validation.starting'));
        const previewData = await createOrGetPreview(pocId);
        logger.debug("Preview created", { previewUrl: previewData.preview_url });

        setPreviewUrl(normalizePreviewUrl(previewData.preview_url));
        setIsLoading(false);

        // If readiness takes too long, stop blocking the UI
        clearPreviewInitTimeout();
        previewInitTimeoutRef.current = setTimeout(() => {
          if (!validationComplete) {
            setToast({
              open: true,
              message: t('editor.toast.takingLong'),
              severity: "info",
            });
            markValidationComplete(t('editor.validation.background'));
          }
        }, 30000);

        // Poll for readiness
        setValidationMessage(t('editor.validation.waiting'));
        const MAX_WAIT_MS = 5 * 60 * 1000; // 5 minutos
        const POLL_INTERVAL_MS = 2000;
        let isReady = false;
        let readiness: { backend_ready?: boolean } | null = null;
        let notFoundCount = 0;
        const start = Date.now();

        while (Date.now() - start < MAX_WAIT_MS && !isReady) {
          try {
            const readyResponse = await pocGeneratorApi.checkPreviewReadiness(pocId);
            if (readyResponse.status === "not_found") {
              notFoundCount += 1;
              // Fail fast if backend confirms preview disappeared right after creation.
              if (notFoundCount >= 3) {
                setToast({
                  open: true,
                  message: t('editor.toast.failedStart'),
                  severity: "error",
                });
                markValidationComplete(t('editor.toast.failedStartShort'));
                return;
              }
            } else {
              notFoundCount = 0;
            }

            readiness = readyResponse;
            isReady = readyResponse.ready;
            if (isReady) {
              if (readyResponse.preview_url) {
                setPreviewUrl(normalizePreviewUrl(readyResponse.preview_url));
              }
              clearPreviewInitTimeout();
              setPreviewReady(true);
              break;
            }
          } catch (e) {
            console.warn("Readiness check failed:", e);
          }
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        }

        if (!isReady) {
          console.warn("Preview did not become ready in time");
          setToast({
            open: true,
            message: t('editor.toast.takingLongAlt'),
            severity: "info",
          });
          // Stop blocking UI if preview is taking too long
          markValidationComplete(t('editor.toast.stillStarting'));
        }

        // Add welcome message
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: t('editor.welcome'),
            timestamp: new Date(),
          },
        ]);

        if (isReady) {
          const backendHealthy = Boolean(readiness?.backend_ready);
          if (!backendHealthy) {
            setToast({
              open: true,
              message: t('editor.toast.frontendReady'),
              severity: "info",
            });
            markValidationComplete(t('editor.toast.frontendReadyShort'));
          } else {
            // Start validation process
            setValidationPhase("validating");
            setValidationMessage(t('editor.validation.validating'));

            // Fallback: if validation takes too long or WS doesn't connect, don't block UI
            clearValidationTimeout();
            validationTimeoutRef.current = setTimeout(() => {
              setToast({
                open: true,
                message: t('editor.toast.validationSlow'),
                severity: "info",
              });
              markValidationComplete(t('editor.validation.background'));
            }, 120000);

            // Trigger validation — use HTTP response as fallback if WebSocket doesn't deliver
            try {
              const { data: valData } = await api.post(`/api/v1/editor/${pocId}/validate`, {}, { timeout: 120000 });
              // The endpoint is synchronous: by the time we get the response,
              // validation is done. Use it as fallback in case WS messages were lost.
              clearValidationTimeout();
              const HIDDEN = new Set(["null_checks", "cors_patterns"]);
              if (valData.checks) {
                setValidationChecks(
                  valData.checks
                    .filter((c: any) => !HIDDEN.has(c.id))
                    .map((c: any) => ({ id: c.id, name: c.name, status: c.status, error: c.error, fix: c.fix }))
                );
              }
              if (valData.total_errors !== undefined) setTotalErrors(valData.total_errors);
              if (valData.total_fixed !== undefined) setTotalFixed(valData.total_fixed);
              setValidationPhase(valData.success ? "complete" : "error");
              setValidationMessage(
                valData.success ? t('editor.validation.complete') : t('editor.validation.completeErrors')
              );
              setTimeout(() => markValidationComplete(), 1500);
            } catch (validationError) {
              console.error("Error starting validation:", validationError);
              // If validation fails to start, just show the preview anyway
              markValidationComplete(t('editor.validation.cannotStart'));
            }
          }
        }
      } catch (error: any) {
        console.error("Error initializing preview:", error);
        setValidationPhase("error");
        setValidationMessage(t('editor.toast.errorCreate'));

        if (error.response?.status === 404) {
          setToast({
            open: true,
            message: t('editor.toast.notFound'),
            severity: "error",
          });
          setTimeout(() => navigate(-1), 2000);
        } else {
          setToast({
            open: true,
            message: error.response?.data?.detail || t('editor.toast.createError'),
            severity: "error",
          });
        }
        setIsValidating(false);
      } finally {
        setIsLoading(false);
      }
    };

    initPreview();
  }, [pocId, navigate, clearValidationTimeout, markValidationComplete]);

  // Keep the preview alive after initial readiness. If it drops, try to recover.
  useEffect(() => {
    if (!pocId || !previewReady) return;

    let cancelled = false;
    let consecutiveFailures = 0;
    let recovering = false;

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const attemptRecovery = async () => {
      if (recovering || cancelled) return;
      recovering = true;
      try {
        // El reintento es silencioso a propósito: el preview puede tardar unos
        // segundos en estar listo tras un cambio (especialmente en backend) y
        // mostrar "se desconectó" hace pensar que algo se rompió cuando solo
        // se está reconciliando. Si la recuperación falla del todo, queda log.
        logger.debug("Preview readiness fallback: attempting recovery");

        const recreated = await createOrGetPreview(pocId);
        setPreviewUrl(normalizePreviewUrl(recreated.preview_url));

        const start = Date.now();
        while (!cancelled && Date.now() - start < 60000) {
          const readiness = await pocGeneratorApi.checkPreviewReadiness(pocId);
          if (readiness.preview_url) {
            setPreviewUrl(normalizePreviewUrl(readiness.preview_url));
          }
          if (readiness.ready) {
            setPreviewReady(true);
            consecutiveFailures = 0;
            return;
          }
          await wait(2000);
        }
      } catch (error) {
        console.warn("Preview recovery failed:", error);
      } finally {
        recovering = false;
      }
    };

    const tick = async () => {
      if (cancelled || recovering) return;
      try {
        const readiness = await pocGeneratorApi.checkPreviewReadiness(pocId);

        if (readiness.preview_url) {
          const nextUrl = normalizePreviewUrl(readiness.preview_url);
          if (nextUrl !== previewUrlRef.current) {
            setPreviewUrl(nextUrl);
          }
        }

        if (readiness.ready) {
          consecutiveFailures = 0;
          return;
        }

        consecutiveFailures += 1;
        if (consecutiveFailures >= 3 || readiness.status === "not_found") {
          await attemptRecovery();
        }
      } catch (error) {
        consecutiveFailures += 1;
        if (consecutiveFailures >= 3) {
          await attemptRecovery();
        }
      }
    };

    const intervalId = setInterval(() => {
      void tick();
    }, 10000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [pocId, previewReady]);

  // Load examples
  useEffect(() => {
    const loadExamples = async () => {
      try {
        const response = await api.get("/api/v1/editor/examples");
        setExampleCategories(response.data.categories);
      } catch (error) {
        console.error("Error loading examples:", error);
      }
    };

    loadExamples();
  }, []);

  // WebSocket connection - only connect after preview is ready
  useEffect(() => {
    // Don't connect WebSocket until preview is ready
    // This prevents "WebSocket closed before connection established" error
    // caused by React StrictMode double mount or connecting before preview exists
    if (!pocId || !previewUrl) return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isCleaningUp = false;

    const connect = () => {
      if (isCleaningUp) return;

      const apiBase = api.defaults.baseURL || "";
      let wsBase = "";
      if (apiBase) {
        wsBase = apiBase;
      } else if (import.meta.env.DEV) {
        wsBase = (import.meta.env.VITE_DEV_API_URL as string) || "http://127.0.0.1:8000";
      } else if (import.meta.env.VITE_API_URL) {
        wsBase = import.meta.env.VITE_API_URL as string;
      } else if (typeof window !== "undefined") {
        wsBase = window.location.origin;
      }

      if (wsBase.startsWith("http")) {
        wsBase = wsBase.replace(/^http/, "ws");
      } else if (wsBase.startsWith("/")) {
        if (typeof window !== "undefined") {
          wsBase = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}${wsBase}`;
        }
      }

      wsBase = wsBase.replace(/\/$/, "");
      const accessToken =
        typeof window !== "undefined" ? window.localStorage.getItem(ACCESS_TOKEN_KEY) : null;
      const wsUrl = accessToken
        ? `${wsBase}/api/v1/editor/ws/${pocId}?token=${encodeURIComponent(accessToken)}`
        : `${wsBase}/api/v1/editor/ws/${pocId}`;
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        logger.debug("WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case "agent_thinking":
              // Show thinking indicator
              setMessages((prev) => {
                const filtered = prev.filter((m) => m.id !== "thinking");
                return [
                  ...filtered,
                  {
                    id: "thinking",
                    role: "system",
                    content: data.message,
                    timestamp: new Date(),
                  },
                ];
              });
              break;

            case "agent_response":
              // Remove thinking indicator and add response
              wsResponseReceivedRef.current = true;
              appendAgentMessage(data);
              setIsSending(false);
              break;

            case "editor_plan": {
              const steps = Array.isArray(data.steps) ? data.steps : null;
              // Sobreescribe el plan del turno actual si está activo (caso
              // normal: el front lo pre-pobló y ahora llega el real). Si no
              // hay turno activo, NO arrancamos uno nuevo desde acá — el WS
              // puede llegar antes de que sendMessage haya hecho push del
              // turno; en ese caso lo agarrá el sendMessage local y luego
              // este handler quedará sin nada que actualizar.
              updateActiveTurn(
                (turn) => ({ ...turn, plan: steps ?? turn.plan }),
                {
                  startIfMissing: () => ({
                    id: String(Date.now()),
                    plan: steps,
                    events: [],
                    fileChanges: [],
                    clarification: null,
                    completed: false,
                    failed: false,
                  }),
                },
              );
              break;
            }

            case "editor_file_changed": {
              const entry = {
                path: String(data.path || ''),
                action: (data.action || 'modified') as 'created' | 'modified' | 'deleted',
                summary: data.summary ? String(data.summary) : '',
                ts: Date.now(),
              };
              if (!entry.path) break;
              updateActiveTurn(
                (turn) => {
                  const existing = turn.fileChanges.findIndex(c => c.path === entry.path);
                  const next = [...turn.fileChanges];
                  if (existing >= 0) next[existing] = entry;
                  else next.push(entry);
                  return { ...turn, fileChanges: next };
                },
                {
                  startIfMissing: () => ({
                    id: String(Date.now()),
                    plan: null,
                    events: [],
                    fileChanges: [entry],
                    clarification: null,
                    completed: false,
                    failed: false,
                  }),
                },
              );
              break;
            }

            case "editor_thinking_delta":
            case "editor_message_delta": {
              // Streaming: appendea el delta al último evento del tipo abierto
              // (thinking_delta → editor_thinking; message_delta → editor_message).
              const targetType = data.type === "editor_thinking_delta"
                ? "editor_thinking"
                : "editor_message";
              const delta = data.content || "";
              updateActiveTurn(
                (turn) => {
                  const events = turn.events;
                  for (let i = events.length - 1; i >= 0; i--) {
                    if (events[i].type === targetType) {
                      const next = [...events];
                      next[i] = { ...events[i], content: (events[i].content || "") + delta };
                      return { ...turn, events: next };
                    }
                    if (
                      events[i].type === "editor_tool_use" ||
                      events[i].type === "editor_tool_result" ||
                      events[i].type === "editor_executing"
                    ) {
                      break;
                    }
                  }
                  return { ...turn, events: [...events, { type: targetType, content: delta }] };
                },
                {
                  startIfMissing: () => ({
                    id: String(Date.now()),
                    plan: null,
                    events: [{ type: targetType, content: delta }],
                    fileChanges: [],
                    clarification: null,
                    completed: false,
                    failed: false,
                  }),
                },
              );
              break;
            }

            case "editor_thinking":
            case "editor_discovery":
            case "editor_executing":
            case "editor_message":
            case "editor_tool_use":
            case "editor_tool_result":
            case "editor_validating": {
              const evt: EditorEvent = {
                type: data.type,
                content: data.content,
                file: data.file,
                check: data.check,
                status: data.status,
                tool_name: data.tool_name,
                tool_input: data.tool_input,
                tool_result: data.tool_result,
                duration_ms: data.duration_ms,
              };
              updateActiveTurn(
                (turn) => ({ ...turn, events: [...turn.events, evt] }),
                {
                  startIfMissing: () => ({
                    id: String(Date.now()),
                    plan: null,
                    events: [evt],
                    fileChanges: [],
                    clarification: null,
                    completed: false,
                    failed: false,
                  }),
                },
              );
              break;
            }

            case "editor_clarification_needed":
              updateActiveTurn(
                (turn) => ({
                  ...turn,
                  clarification: {
                    question: data.question || data.content || '',
                    options: Array.isArray(data.options) ? data.options : undefined,
                  },
                }),
                {
                  startIfMissing: () => ({
                    id: String(Date.now()),
                    plan: null,
                    events: [],
                    fileChanges: [],
                    clarification: {
                      question: data.question || data.content || '',
                      options: Array.isArray(data.options) ? data.options : undefined,
                    },
                    completed: false,
                    failed: false,
                  }),
                },
              );
              break;

            case "editor_completed":
              updateActiveTurn((turn) => ({
                ...turn,
                completed: true,
                summary: data.summary,
                clarification: null,
              }));
              break;

            case "editor_failed":
              updateActiveTurn((turn) => ({
                ...turn,
                failed: true,
                summary: data.summary,
                clarification: null,
              }));
              break;

            case "file_changed":
              // Refresh iframe on file change
              if (iframeRef.current) {
                iframeRef.current.src = iframeRef.current.src;
              }
              break;

            case "error":
              setToast({
                open: true,
                message: data.message,
                severity: "error",
              });
              setIsSending(false);
              break;

            case "validation_progress":
              // Handle validation progress updates
              setValidationPhase(data.phase);
              setValidationMessage(data.message);

              if (data.checks) {
                const HIDDEN_CHECKS = new Set(["null_checks", "cors_patterns"]);
                setValidationChecks(
                  data.checks
                    .filter((check: any) => !HIDDEN_CHECKS.has(check.id))
                    .map((check: any) => ({
                      id: check.id,
                      name: check.name,
                      status: check.status,
                      error: check.error,
                      fix: check.fix,
                    }))
                );
              }

              if (data.total_errors !== undefined) {
                setTotalErrors(data.total_errors);
              }
              if (data.total_fixed !== undefined) {
                setTotalFixed(data.total_fixed);
              }

              // When validation is complete
              if (data.phase === "complete" || data.phase === "error") {
                setTimeout(() => {
                  markValidationComplete();
                }, 1500); // Small delay to show the final state
              }
              break;

            case "validation_complete":
              if (data.total_errors !== undefined) {
                setTotalErrors(data.total_errors);
              }
              if (data.total_fixed !== undefined) {
                setTotalFixed(data.total_fixed);
              }
              setValidationPhase(data.success ? "complete" : "error");
              setValidationMessage(
                data.success ? t('editor.validation.complete') : t('editor.validation.completeErrors')
              );
              markValidationComplete();
              break;

          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        logger.debug("WebSocket disconnected");

        // Attempt to reconnect after 3 seconds if not cleaning up
        if (!isCleaningUp && previewUrl) {
          reconnectTimeout = setTimeout(() => {
            logger.debug("Attempting WebSocket reconnection");
            connect();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    };

    // Initial connection
    connect();

    return () => {
      isCleaningUp = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [pocId, previewUrl, markValidationComplete, appendAgentMessage]);

  // Send message to agent
  const sendMessage = async () => {
    if (!inputValue.trim() || isSending || !pocId) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsSending(true);
    setShowExamples(false);
    wsResponseReceivedRef.current = false;

    // Pre-poblamos un nuevo turno asociado a este mensaje. El render del
    // chat intercala cada turno DEBAJO del mensaje del usuario que lo
    // originó, manteniendo el orden cronológico (msg → plan/thinking → msg → ...).
    setAgentTurns((prev) => [
      ...prev,
      {
        id: `turn-${Date.now()}`,
        userMessageId: userMessage.id,
        plan: deriveLocalPlan(userMessage.content),
        events: [],
        fileChanges: [],
        clarification: null,
        completed: false,
        failed: false,
      },
    ]);

    try {
      // Build conversation history
      const history = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Send to API. Prefer HTTP response as source of truth and keep WS as realtime channel.
      const response = await api.post<AgentChatPayload>(`/api/v1/editor/${pocId}/chat`, {
        message: userMessage.content,
        conversation_history: history,
      });

      if (!wsResponseReceivedRef.current) {
        appendAgentMessage(response.data);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `Error: ${error.response?.data?.detail || error.message || t('editor.error.requestFailed')}`,
          timestamp: new Date(),
          success: false,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Handle example selection
  const handleExampleSelect = (example: string) => {
    setInputValue(example);
    setShowExamples(false);
  };

  // Finish preview: destroy backend resources and go home
  const [isFinishing, setIsFinishing] = useState(false);

  const handleFinish = async () => {
    if (!pocId || isFinishing) return;
    setIsFinishing(true);
    try {
      // Close WebSocket before destroying
      if (wsRef.current) {
        wsRef.current.close();
      }
      await pocGeneratorApi.destroyPreview(pocId);
    } catch (error) {
      console.warn("Error destroying preview:", error);
    } finally {
      finish();
    }
  };

  // Refresh preview
  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  // Open preview in new window
  const openInNewWindow = () => {
    if (previewUrl) {
      window.open(previewUrl, "_blank");
    }
  };

  const showValidationOverlay = isLoading || (isValidating && !validationComplete);

  return (
    <div className="h-screen flex flex-col bg-[#f8f9fa] overflow-hidden">
      {/* Header (56px) */}
      <header className="h-[56px] bg-white/70 backdrop-blur-xl border-b border-gray-200/30 flex items-center justify-between px-6 z-50 flex-shrink-0"
        style={{ boxShadow: '0 20px 40px rgba(88,68,237,0.05)' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft size={18} className="text-gray-500" />
          </button>
          <div className="flex flex-col">
            <h1 className="font-bold text-[15px] tracking-tight leading-none" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t('editor.title')}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              {wsConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-medium text-emerald-600/80 uppercase tracking-wider">{t('editor.connected')}</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-[11px] font-medium text-red-500/80 uppercase tracking-wider">{t('editor.disconnected')}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-gray-50 rounded-lg border border-gray-200/20">
            <span className="text-[12px] font-mono text-indigo-600 font-semibold">#{pocId?.slice(0, 8)}</span>
          </div>
          {previewUrl && (
            <button
              onClick={() => {
                setShareCopied(false);
                setShareModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
            >
              <Share2 size={14} />
              Compartir
            </button>
          )}
          <button
            onClick={handleFinish}
            disabled={isFinishing}
            className="bg-indigo-600 text-white px-5 py-1.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
          >
            {isFinishing && <Loader2 size={14} className="animate-spin" />}
            {isFinishing ? t('editor.finishing') : t('editor.finish')}
          </button>
        </div>
      </header>

      {/* Main content: Chat + Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel (30%) — visible sólo en dev (prod lo oculta via build). */}
        <div
          className={`w-[24%] min-w-[280px] max-w-[380px] border-r border-gray-200/30 flex-col bg-white ${
            import.meta.env.DEV ? 'flex' : 'hidden'
          }`}
        >
          {/* Chat header */}
          <div className="p-5 border-b border-gray-100" style={{ background: 'linear-gradient(135deg, rgba(88,68,237,0.04) 0%, rgba(88,68,237,0.08) 100%)' }}>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-600" />
              <span className="font-bold text-lg text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>{t('editor.assistant')}</span>
            </div>
            <p className="text-xs text-gray-500 leading-5 mt-1.5">{t('editor.assistantSubtitle')}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5">
            {messages
              .filter((m) => {
                // Ocultá el saludo en cuanto el agente arranca a trabajar para
                // que no compita visualmente con el thinking / la respuesta.
                if (m.id === 'welcome' && (agentTurns.length > 0 || isSending || messages.length > 1)) {
                  return false
                }
                return true
              })
              .map((message) => {
                // Render intercalado: cada mensaje del usuario seguido del
                // turno del agente que lo originó (si existe).
                const correlatedTurns = agentTurns.filter((t) => t.userMessageId === message.id)
                return (
                  <div key={message.id}>
                    <MessageBubble message={message} />
                    {pocId && correlatedTurns.map((turn) => (
                      <div key={turn.id} className="mb-4 mt-2">
                        <AgentActivityFeed
                          pocId={pocId}
                          turn={turn}
                          onClarificationSent={() =>
                            setAgentTurns((prev) =>
                              prev.map((t) => (t.id === turn.id ? { ...t, clarification: null } : t)),
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                )
              })}
            {/* Turnos sin mensaje correlado (defensa: WS llegó antes que sendMessage). */}
            {pocId && agentTurns
              .filter((t) => !t.userMessageId)
              .map((turn) => (
                <div key={turn.id} className="mb-4">
                  <AgentActivityFeed
                    pocId={pocId}
                    turn={turn}
                    onClarificationSent={() =>
                      setAgentTurns((prev) =>
                        prev.map((t) => (t.id === turn.id ? { ...t, clarification: null } : t)),
                      )
                    }
                  />
                </div>
              ))}
            {isSending && (
              <div className="flex items-center gap-2 text-gray-400 my-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
                <span className="text-xs italic">{t('editor.processing')}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Examples (collapsible) */}
          {showExamples && exampleCategories.length > 0 && (
            <div className="border-t border-gray-100 p-4 max-h-[220px] overflow-y-auto">
              <div className="flex items-center gap-1 mb-2">
                <Lightbulb size={12} className="text-gray-400" />
                <span className="text-xs text-gray-400">{t('editor.examples')}</span>
              </div>
              <ExamplePrompts categories={exampleCategories} onSelect={handleExampleSelect} />
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex gap-3 items-end bg-white rounded-xl border border-gray-200 px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-300 transition-all">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={t('editor.placeholder')}
                disabled={isSending}
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 150) + 'px';
                }}
                className="flex-1 bg-transparent border-none outline-none text-sm leading-6 py-1.5 placeholder:text-gray-400 disabled:opacity-60 resize-none overflow-y-auto"
                style={{ minHeight: '44px', maxHeight: '150px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isSending}
                className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all flex-shrink-0"
              >
                {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-1 px-1">
              <span className="text-xs text-gray-400">Shift + Enter para nueva línea</span>
            </div>
          </div>
        </div>

        {/* Preview Panel (70%) */}
        <div className="flex-1 flex flex-col bg-gray-100">
          {/* Preview toolbar (48px) */}
          <nav className="h-[48px] bg-white border-b border-gray-200/20 flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm text-gray-500" style={{ fontFamily: 'Manrope, sans-serif' }}>{t('editor.previewLabel')}</span>
              {previewReady ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
                  <CheckCircle size={14} className="text-emerald-500" />
                  <span className="text-[11px] font-bold text-emerald-600">{t('editor.ready')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 rounded-full border border-indigo-100">
                  <Loader2 size={14} className="text-indigo-500 animate-spin" />
                  <span className="text-[11px] font-bold text-indigo-600">{t('editor.loading')}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewportSize("desktop")}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${viewportSize === 'desktop' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <Monitor size={18} />
              </button>
              <button
                onClick={() => setViewportSize("mobile")}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${viewportSize === 'mobile' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <Smartphone size={18} />
              </button>
              <div className="w-px h-6 bg-gray-200/30 mx-2" />
              <button onClick={refreshPreview} className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <RefreshCw size={18} />
              </button>
              <button onClick={openInNewWindow} className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors" title="Abrir en nueva ventana">
                <ExternalLink size={18} />
              </button>
            </div>
          </nav>

          {/* Preview iframe */}
          <div className="flex-1 p-2 flex items-center justify-center">
            <div
              className="rounded-xl overflow-hidden relative transition-all duration-300 shadow-lg"
              style={viewportSize === "desktop" ? { width: "100%", height: "100%" } : { width: 375, height: 667 }}
            >
              {previewUrl ? (
                <iframe
                  ref={iframeRef}
                  src={previewUrl}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  title="POC Preview"
                  allow="camera; microphone; fullscreen; autoplay; display-capture; clipboard-read; clipboard-write; geolocation"
                  onError={() => setToast({ open: true, message: t('editor.toast.iframeError'), severity: "info" })}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center text-gray-400">
                    <FileCode size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-sm">No hay preview disponible</p>
                  </div>
                </div>
              )}

              {showValidationOverlay && (
                <div className="absolute inset-0 bg-white z-10">
                  <PreviewLoadingState
                    phase={validationPhase}
                    currentMessage={validationMessage}
                    checks={validationChecks}
                    totalErrors={totalErrors}
                    totalFixed={totalFixed}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share modal */}
      {shareModalOpen && previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShareModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Compartir PoC
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Cualquier persona con este link podrá abrir el preview.
                </p>
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2">
              <input
                type="text"
                readOnly
                value={previewUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 bg-transparent px-2 py-1 text-sm text-gray-700 outline-none"
              />
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(previewUrl);
                    setShareCopied(true);
                    setTimeout(() => setShareCopied(false), 2000);
                  } catch (err) {
                    logger.warn('clipboard failed', { error: String(err) });
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 active:scale-95"
              >
                <Copy size={12} />
                {shareCopied ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>

            <div className="mt-4 flex justify-end">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                <ExternalLink size={14} />
                Abrir en pestaña nueva
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toast.open && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
            toast.severity === 'success' ? 'bg-emerald-600' : toast.severity === 'error' ? 'bg-red-600' : 'bg-indigo-600'
          }`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast({ ...toast, open: false })} className="text-white/70 hover:text-white ml-2">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
