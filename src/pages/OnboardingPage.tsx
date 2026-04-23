import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Upload, ArrowRight, Shield, Linkedin, ArrowLeft, User, Loader2, Lock, Globe, ChevronDown } from 'lucide-react';
import { useI18n } from '../i18n';
import { AgenticOnboarding } from './AgenticOnboarding';
import { api } from '../services/api';
import { authApi, getAndClearAuthReturnUrl } from '../services/auth';
import { plgService } from '../services/plg';
import { discoveryService } from '../services/discovery';
import { onboardingApi } from '../services/onboarding';
import { setSessionName } from '../utils/sessionName';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearAuth, setAuthData } from '../store/userSlice';
import { useLogout } from '../hooks/useLogout';
import { verticalPacksApi, type VerticalPackSummary as VPSummary } from '../services/verticalPacks';
import { getVerticalPackStaticData } from '../data/verticalPack';


export default function OnboardingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, language, setLanguage } = useI18n();
  const es = language === 'es';
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.user.user);
  const logout = useLogout();

  const [inputValue, setInputValue] = useState('');
  const [verticalPacks, setVerticalPacks] = useState<VPSummary[]>([]);
  const [loadingPacks, setLoadingPacks] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isAnalyzingDocument, setIsAnalyzingDocument] = useState(false);
  const [isStartingDiscovery, setIsStartingDiscovery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // OAuth State
  const oauthProcessedRef = useRef(false);
  const [oauthStatus, setOauthStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [oauthError, setOauthError] = useState<string | null>(null);
  const staticVerticalData = getVerticalPackStaticData(language);

  const oauthCode = searchParams.get('code');
  const oauthState = searchParams.get('state');
  const oauthErrorParam = searchParams.get('error');
  const hasOauthParams = Boolean(oauthCode || oauthState || oauthErrorParam);

  const BLUEPRINT_COUNTS: Record<string, number> = { fintech: 11, retail: 9, healthcare: 14 };

  const buildStaticFallback = () =>
    staticVerticalData.portfolio.map((p) => ({
      id: p.slug,
      name: p.name,
      slug: p.slug,
      vertical: p.name,
      short_description: p.summary,
      badge: p.badge,
      icon: null,
      status: 'active' as const,
      total_blueprints: BLUEPRINT_COUNTS[p.slug] ?? 0,
      total_pocs_generated: 0,
      compliance_modules: [] as string[],
      sort_order: 0,
    }));

  useEffect(() => {
    setLoadingPacks(true);
    verticalPacksApi
      .listPacks(language)
      .then((data) => {
        if (data && data.length > 0) {
          setVerticalPacks(data);
        } else {
          setVerticalPacks(buildStaticFallback());
        }
      })
      .catch(() => {
        setVerticalPacks(buildStaticFallback());
      })
      .finally(() => setLoadingPacks(false));
  }, [language]);

  useEffect(() => { checkAuth(); }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setIsLangOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle OAuth Redirect
  useEffect(() => {
    if (!hasOauthParams) return;
    if (oauthProcessedRef.current) return;
    oauthProcessedRef.current = true;

    const run = async () => {
      try {
        setOauthStatus('loading');
        setOauthError(null);
        if (oauthErrorParam) throw new Error(oauthErrorParam);
        if (!oauthCode || !oauthState) throw new Error('missing_oauth_params');

        const response = await authApi.exchangeLinkedInCode(oauthCode, oauthState);
        if (!response?.user || !response?.tokens) throw new Error('Invalid authentication response from server');

        dispatch(setAuthData({
          user: response.user,
          tokens: { access_token: response.tokens.access_token, refresh_token: response.tokens.refresh_token },
        }));
        authApi.saveTokens(response.tokens);
        authApi.saveUserData(response.user);
        setOauthStatus('idle');

        const returnUrl = getAndClearAuthReturnUrl();
        if (returnUrl) { navigate(returnUrl, { replace: true }); setIsAuthenticated(true); return; }

        const anonSessionId = sessionStorage.getItem('anon_session_id');
        if (anonSessionId) {
          try {
            const linkResult = await plgService.linkSession(anonSessionId);
            sessionStorage.removeItem('anon_session_id');
            if (linkResult.linked && linkResult.poc_id) { navigate(`/preview/${linkResult.poc_id}`, { replace: true }); setIsAuthenticated(true); return; }
          } catch { sessionStorage.removeItem('anon_session_id'); }
        }

        navigate('/onboarding', { replace: true });
        setIsAuthenticated(true);
      } catch (err) {
        console.error('LinkedIn OAuth failed', err);
        setOauthStatus('error');
        setOauthError(t('auth.linkedin.error'));
        getAndClearAuthReturnUrl();
        navigate('/onboarding', { replace: true });
      }
    };
    void run();
  }, [hasOauthParams, navigate, oauthCode, oauthErrorParam, oauthState, t, dispatch]);

  const checkAuth = async () => {
    const accessToken = authApi.getAccessToken();
    const refreshToken = authApi.getRefreshToken();
    if (!accessToken) { setIsAuthenticated(false); setLoadingAuth(false); return; }

    const fetchCurrentUser = async (token: string) => {
      const response = await api.get('/api/v1/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    };
    const applyAuthData = (user: any, nextAccessToken: string, nextRefreshToken: string) => {
      setIsAuthenticated(true);
      dispatch(setAuthData({ user, tokens: { access_token: nextAccessToken, refresh_token: nextRefreshToken } }));
    };

    try {
      const user = await fetchCurrentUser(accessToken);
      if (user) { applyAuthData(user, accessToken, refreshToken || ''); }
      else { authApi.clearTokens(); dispatch(clearAuth()); setIsAuthenticated(false); }
    } catch (error: any) {
      if (error?.response?.status === 401 && refreshToken) {
        try {
          const refreshedTokens = await authApi.refreshAccessToken(refreshToken);
          authApi.saveTokens(refreshedTokens);
          const user = await fetchCurrentUser(refreshedTokens.access_token);
          if (user) { applyAuthData(user, refreshedTokens.access_token, refreshedTokens.refresh_token); }
          else { authApi.clearTokens(); dispatch(clearAuth()); setIsAuthenticated(false); }
        } catch { authApi.clearTokens(); dispatch(clearAuth()); setIsAuthenticated(false); }
      } else { authApi.clearTokens(); dispatch(clearAuth()); setIsAuthenticated(false); }
    } finally { setLoadingAuth(false); }
  };

  const handleLogin = async () => {
    try {
      setOauthStatus('loading');
      setOauthError(null);
      const url = await authApi.getLinkedInAuthUrl();
      window.location.href = url;
    } catch (error: any) {
      console.error("Login error", error);
      setOauthStatus('idle');
      setOauthError(error?.response?.data?.detail || t('auth.linkedin.startError'));
    }
  };

  const handleSearch = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (trimmed.length < 10) { alert(es ? 'Por favor, describe tu necesidad con al menos 10 caracteres.' : 'Please describe your need with at least 10 characters.'); return; }

    setIsStartingDiscovery(true);
    try {
      // Start discovery session directly from onboarding
      const response = await discoveryService.start({ initial_message: trimmed });
      const sessionId = response.session_id;

      // Associate user with session if authenticated
      if (userData && userData.full_name) {
        try {
          const result = await onboardingApi.associateUserWithSession(sessionId);
          if (result.success && result.user_name) {
            setSessionName(sessionId, result.user_name);
          }
        } catch (err) {
          console.error('Failed to associate user with session:', err);
        }
      }

      // Navigate directly to chat with session already created
      navigate(`/discovery-progress?session=${sessionId}`);
    } catch (error) {
      console.error('Error starting discovery:', error);
      alert(es ? 'Error al iniciar el diagnóstico. Por favor intenta de nuevo.' : 'Error starting diagnosis. Please try again.');
    } finally {
      setIsStartingDiscovery(false);
    }
  };

  const handleSelectLanguage = (lang: 'en' | 'es') => { setLanguage(lang); setIsLangOpen(false); };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) { alert(es ? 'Por favor sube un archivo PDF, Word (.doc, .docx) o texto (.txt)' : 'Please upload a PDF, Word (.doc, .docx) or text (.txt) file'); return; }
    if (file.size > 10 * 1024 * 1024) { alert(es ? 'El archivo es demasiado grande. Máximo 10MB.' : 'File is too large. Maximum 10MB.'); return; }

    setIsAnalyzingDocument(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/api/v1/document/analyze-requirements', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (response.data.prompt) setInputValue(response.data.prompt);
    } catch (error) {
      console.error('Error analyzing document:', error);
      alert(es ? 'Error al analizar el documento. Por favor intenta de nuevo.' : 'Error analyzing document. Please try again.');
    } finally {
      setIsAnalyzingDocument(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col relative">
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-xl shadow-sm shadow-indigo-500/5">
        <div className="flex justify-between items-center px-6 h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-slate-400 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link to="/" className="text-xl font-bold tracking-tight text-indigo-600" style={{ fontFamily: 'Manrope, sans-serif' }}>
              CodlyLabs
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {/* Language */}
            <div ref={langRef} className="relative">
              <button
                type="button"
                onClick={() => setIsLangOpen(prev => !prev)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-100"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium uppercase">{language}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden z-20">
                  <button type="button" onClick={() => handleSelectLanguage('es')}
                    className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${language === 'es' ? 'font-semibold text-indigo-600 bg-indigo-50' : 'text-gray-700'}`}>
                    🇪🇸 Español
                  </button>
                  <button type="button" onClick={() => handleSelectLanguage('en')}
                    className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${language === 'en' ? 'font-semibold text-indigo-600 bg-indigo-50' : 'text-gray-700'}`}>
                    🇺🇸 English
                  </button>
                </div>
              )}
            </div>

            {/* User + Finish */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              {userData && (
                <div className="flex items-center gap-2">
                  {userData.profile_picture ? (
                    <img src={userData.profile_picture} alt={userData.full_name || userData.email} className="w-8 h-8 rounded-full object-cover border-2 border-indigo-100" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center border-2 border-indigo-100">
                      <User className="w-4 h-4 text-indigo-600" />
                    </div>
                  )}
                  <span className="text-xs font-bold text-gray-900 hidden sm:block">
                    {userData.full_name || userData.email?.split('@')[0] || (es ? 'Usuario' : 'User')}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={logout}
                className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold active:scale-95 transition-transform"
              >
                {t('app.finish')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-28 pb-20 px-6 max-w-7xl mx-auto w-full">
        {/* Hero */}
        <section className="text-center mb-16 relative">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full -z-10" />
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-6">
            {es ? 'Esto no es un chat genérico — es una evaluación consultiva guiada.' : 'This is not a generic chat — it\'s a guided consultative assessment.'}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6 max-w-4xl mx-auto" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {es ? 'Diagnóstico estratégico de ' : 'Strategic diagnosis of '}<span className="text-indigo-600">{es ? 'oportunidades de IA' : 'AI opportunities'}</span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {es ? 'Describí tu contexto y nuestro sistema de IA evaluará las mejores oportunidades para tu organización.' : 'Describe your context and our AI system will evaluate the best opportunities for your organization.'}
          </p>
        </section>

        {/* Main Input */}
        <section className={`max-w-[900px] mx-auto mb-24 ${!isAuthenticated ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-[0px_24px_48px_rgba(25,28,30,0.06)] relative group focus-within:shadow-[0px_32px_64px_rgba(88,68,237,0.1)] transition-all duration-500">
            <div className="relative flex flex-col gap-4">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSearch()}
                placeholder={es ? 'Ej: Automatizar gestión de reclamos, reducir tiempos de respuesta, análisis de contratos, predecir demanda...' : 'E.g. Automate claims management, reduce response times, contract analysis, demand forecasting...'}
                className="w-full h-[250px] bg-transparent border-none focus:ring-0 text-xl text-gray-900 placeholder:text-slate-400 leading-relaxed resize-none outline-none"
                disabled={!isAuthenticated}
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                <div className="relative group/tooltip">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzingDocument}
                    className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors py-2 px-4 rounded-xl hover:bg-indigo-50 disabled:opacity-50"
                  >
                    {isAnalyzingDocument ? <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> : <Upload className="w-5 h-5" />}
                    <span className="text-sm font-semibold">{es ? 'Subir documentos' : 'Upload documents'}</span>
                  </button>
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:block bg-gray-900 text-white text-[10px] py-1 px-3 rounded shadow-lg whitespace-nowrap">
                    {es ? 'PDF, Word o TXT (max 10MB)' : 'PDF, Word or TXT (max 10MB)'}
                  </div>
                </div>
                <button
                  onClick={handleSearch}
                  disabled={!inputValue.trim() || isStartingDiscovery}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStartingDiscovery ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Vertical Packs */}
        <section className={`${!isAuthenticated ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {t('verticalPack.portfolio.title')}
              </h2>
              <p className="text-gray-500 font-medium">{t('verticalPack.portfolio.subtitle')}</p>
            </div>
            <Link to="/vertical-pack" className="text-indigo-600 font-bold text-sm flex items-center gap-2 hover:underline">
              {es ? 'Ver todas las industrias' : 'See all industries'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingPacks ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            </div>
          ) : verticalPacks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {verticalPacks.map((pack) => {
                const localized = staticVerticalData.portfolio.find((item) => item.slug === pack.slug);
                return (
                  <div
                    key={pack.slug}
                    onClick={() => isAuthenticated && navigate(`/vertical-pack/${pack.slug}`)}
                    className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all group cursor-pointer border border-transparent hover:border-indigo-100"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Shield className="w-6 h-6" />
                      </div>
                      {(localized?.badge || pack.badge) && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                          {localized?.badge || pack.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {localized?.name || pack.name}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                      {localized?.summary || pack.short_description}
                    </p>
                    <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{t('verticalPack.blueprintsLabel')}</span>
                        <span className="text-sm font-bold text-gray-900">{pack.total_blueprints} {es ? 'Modelos' : 'Models'}</span>
                      </div>
                      {pack.compliance_modules.length > 0 && (
                        <>
                          <div className="w-px h-8 bg-slate-100" />
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{t('verticalPack.complianceModules')}</span>
                            <span className="text-sm font-bold text-gray-900">{pack.compliance_modules.length} {es ? 'módulos' : 'modules'}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>{t('onboarding.verticalPacksNotFound')}</p>
            </div>
          )}
        </section>
      </main>

      {/* Auth Barrier Modal */}
      {!loadingAuth && !isAuthenticated && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-md" />
          <div className="bg-white w-full max-w-md rounded-2xl p-10 relative shadow-[0px_24px_48px_rgba(25,28,30,0.12)] border border-gray-200/10 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {t('onboarding.linkedin.title')}
            </h2>
            <p className="text-gray-500 font-medium mb-8">
              {t('onboarding.linkedin.description')}
            </p>

            {oauthError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{oauthError}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={oauthStatus === 'loading'}
              className="w-full bg-[#0A66C2] hover:bg-[#0958a7] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all mb-6 shadow-lg shadow-blue-900/10 disabled:opacity-70"
            >
              {oauthStatus === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Linkedin className="w-5 h-5" />}
              {oauthStatus === 'loading' ? (es ? 'Conectando...' : 'Connecting...') : t('onboarding.linkedin.button')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-gray-900 text-sm font-semibold transition-colors"
            >
              {t('onboarding.linkedin.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* OAuth Loading */}
      {oauthStatus === 'loading' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-gray-900">{t('auth.linkedin.loading')}</p>
            <p className="mt-2 text-xs text-gray-500">{t('auth.linkedin.wait')}</p>
          </div>
        </div>
      )}

      {/* OAuth Error */}
      {oauthStatus === 'error' && oauthError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl text-center">
            <p className="text-sm font-semibold text-gray-900">{t('auth.linkedin.errorTitle')}</p>
            <p className="mt-2 text-xs text-gray-500">{oauthError}</p>
            <button
              type="button"
              onClick={() => setOauthStatus('idle')}
              className="mt-4 inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              {t('auth.linkedin.back')}
            </button>
          </div>
        </div>
      )}

      {/* Starting Discovery Modal */}
      {isStartingDiscovery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-indigo-50 rounded-full">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {es ? 'Iniciando diagnóstico' : 'Starting diagnosis'}
            </h3>
            <p className="text-sm text-gray-500">
              {es ? 'Estamos preparando tu sesión de discovery. Esto toma unos segundos.' : 'We\'re preparing your discovery session. This takes a few seconds.'}
            </p>
          </div>
        </div>
      )}

      {/* Document Analysis Modal */}
      {isAnalyzingDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-indigo-50 rounded-full">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {es ? 'Analizando documento' : 'Analyzing document'}
            </h3>
            <p className="text-sm text-gray-500">
              {es ? 'Estamos procesando tu archivo para identificar los requisitos. Esto puede tomar unos segundos.' : 'We\'re processing your file to identify requirements. This may take a few seconds.'}
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-8 mt-auto bg-gray-50 border-t border-slate-200/50">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-4">
          <span className="text-sm text-slate-400">{t('footer.copyright', { year: new Date().getFullYear() })}</span>
          <nav className="flex gap-6">
            <Link to="/policies" className="text-sm text-slate-400 hover:text-indigo-500 transition-colors">{t('footer.terms')}</Link>
            <Link to="/policies" className="text-sm text-slate-400 hover:text-indigo-500 transition-colors">{t('footer.privacy')}</Link>
            <Link to="/contact" className="text-sm text-slate-400 hover:text-indigo-500 transition-colors">{t('footer.contact')}</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

// Sub-component wrapper for the route logic
export const AgenticRedirect = () => {
    return <AgenticOnboarding />;
};
