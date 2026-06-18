import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import PageTracker from './components/PageTracker'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import FeatureGate from './components/FeatureGate'
import GlobalWorkspaceShortcut from './components/GlobalWorkspaceShortcut'
import AdminRouteGuard from './components/AdminRouteGuard'
import { isTenantSubdomainHost } from './utils/platformBranding'
import { TENANT_STATIC_BRANDING } from './constants/tenantBranding'
import { ACCESS_LOCKED } from './constants/accessLock'

// ─── Route-level code splitting ─────────────────────────────────
// Each page is loaded on demand, reducing initial bundle size.

// Public pages
const HomePage = lazy(() => import('./pages/HomePage'))
const RoiOraclePage = lazy(() => import('./pages/RoiOraclePage'))
const VerticalPackPage = lazy(() => import('./pages/VerticalPackPage'))
const VerticalPackDetailPage = lazy(() => import('./pages/VerticalPackDetailPage'))
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'))
const MarketplaceBundlePage = lazy(() => import('./pages/MarketplaceBundlePage'))
const MarketplaceDetailPage = lazy(() => import('./pages/MarketplaceDetailPage'))
const MarketplaceEmbedPage = lazy(() => import('./pages/MarketplaceEmbedPage'))
const MarketplacePartnerDashboardPage = lazy(() => import('./pages/MarketplacePartnerDashboardPage'))
const MarketplacePartnerProfilePage = lazy(() => import('./pages/MarketplacePartnerProfilePage'))
const MarketplacePurchasesPage = lazy(() => import('./pages/MarketplacePurchasesPage'))
const MarketplaceReferralPage = lazy(() => import('./pages/MarketplaceReferralPage'))
const MarketplaceWorkspacePage = lazy(() => import('./pages/MarketplaceWorkspacePage'))
const AboutPlatformPage = lazy(() => import('./pages/AboutPlatformPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const PoliciesPage = lazy(() => import('./pages/PoliciesPage'))

// Onboarding / Discovery flow
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))
const DiscoveryProgressPage = lazy(() => import('./pages/DiscoveryProgressPage'))
const PocGeneratorPage = lazy(() => import('./pages/PocGeneratorPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const ShadowModePage = lazy(() => import('./pages/ShadowModePage'))

// Try / Preview
const TryPage = lazy(() => import('./pages/TryPage'))
const TryEditorPage = lazy(() => import('./pages/TryEditorPage'))
const ReviewPocEditorPage = lazy(() => import('./pages/ReviewPocEditorPage'))
const WelcomePage = lazy(() => import('./pages/WelcomePage'))
const InteractivePreviewPage = lazy(() => import('./pages/InteractivePreviewPage'))
const SharedPreviewPage = lazy(() => import('./pages/SharedPreviewPage'))

// Auth
const LoginPage = lazy(() => import('./pages/LoginPage'))
const InviteAcceptPage = lazy(() => import('./pages/InviteAcceptPage'))
const LinkedInCallbackPage = lazy(() => import('./pages/LinkedInCallbackPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const WorkspaceLayout = lazy(() => import('./pages/workspace/WorkspaceLayout'))
const WorkspaceDashboardView = lazy(() => import('./pages/workspace/WorkspaceDashboardView'))
const WorkspaceProjectsView = lazy(() => import('./pages/workspace/WorkspaceProjectsView'))
const WorkspaceMembersView = lazy(() => import('./pages/workspace/WorkspaceMembersView'))
const WorkspacePreviewsView = lazy(() => import('./pages/workspace/WorkspacePreviewsView'))
const WorkspaceDiscoveryView = lazy(() => import('./pages/workspace/WorkspaceDiscoveryView'))
const WorkspaceDiscoverySummaryView = lazy(() => import('./pages/workspace/WorkspaceDiscoverySummaryView'))
const WorkspacePocGeneratorView = lazy(() => import('./pages/workspace/WorkspacePocGeneratorView'))
const WorkspaceBillingView = lazy(() => import('./pages/workspace/WorkspaceBillingView'))
const WorkspaceSettingsView = lazy(() => import('./pages/workspace/WorkspaceSettingsView'))
const WorkspaceProfileView = lazy(() => import('./pages/workspace/WorkspaceProfileView'))
const WorkspaceBrandingStudioView = lazy(() => import('./pages/workspace/WorkspaceBrandingStudioView'))
const WorkspaceVerticalsView = lazy(() => import('./pages/workspace/WorkspaceVerticalsView'))
const WorkspaceVerticalPackDetailView = lazy(() => import('./pages/workspace/WorkspaceVerticalPackDetailView'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
const BillingPage = lazy(() => import('./pages/BillingPage'))

// Admin (heavy pages – conditionally imported so they are excluded from prod bundle)
const ADMIN_ENABLED = import.meta.env.VITE_ENABLE_ADMIN_ADVANCED === 'true'
const SALES_ENABLED = import.meta.env.VITE_ENABLE_SALES_TOOLS === 'true'

const AdminLoginPage = ADMIN_ENABLED ? lazy(() => import('./pages/AdminLoginPage')) : () => null
const AdminDashboardPage = ADMIN_ENABLED ? lazy(() => import('./pages/AdminDashboardPage')) : () => null
const AdminUsersPage = ADMIN_ENABLED ? lazy(() => import('./pages/AdminUsersPage')) : () => null
const AdminOrganizationsPage = ADMIN_ENABLED ? lazy(() => import('./pages/AdminOrganizationsPage')) : () => null
const AdminPocsPage = ADMIN_ENABLED ? lazy(() => import('./pages/AdminPocsPage')) : () => null
const AdminVerticalPacksPage = ADMIN_ENABLED ? lazy(() => import('./pages/AdminVerticalPacksPage')) : () => null
const AdminMarketplacePage = ADMIN_ENABLED ? lazy(() => import('./pages/AdminMarketplacePage')) : () => null
const AdminPatternsPage = ADMIN_ENABLED ? lazy(() => import('./pages/AdminPatternsPage')) : () => null
const AdminSpecEditorPage = ADMIN_ENABLED ? lazy(() => import('./pages/AdminSpecEditorPage')) : () => null
const AdminTrainingAgentPage = ADMIN_ENABLED ? lazy(() => import('./pages/AdminTrainingAgentPage')) : () => null
const AdminSystemPage = ADMIN_ENABLED ? lazy(() => import('./pages/AdminSystemPage')) : () => null
const AdminDeployPage = ADMIN_ENABLED ? lazy(() => import('./pages/AdminDeployPage')) : () => null
const AdminTenantsPage = ADMIN_ENABLED ? lazy(() => import('./pages/AdminTenantsPage')) : () => null
const AdminAnalyticsPage = ADMIN_ENABLED ? lazy(() => import('./pages/AdminAnalyticsPage')) : () => null
const AdminBillingPage = ADMIN_ENABLED ? lazy(() => import('./pages/AdminBillingPage')) : () => null
const AdminSalesAssistantPage = SALES_ENABLED ? lazy(() => import('./pages/AdminSalesAssistantPage')) : () => null
const AdminPocSocialPage = ADMIN_ENABLED ? lazy(() => import('./pages/AdminPocSocialPage')) : () => null
const AdminMarketingInsightsPage = ADMIN_ENABLED ? lazy(() => import('./pages/AdminMarketingInsightsPage')) : () => null
const AdminPulsePage = ADMIN_ENABLED ? lazy(() => import('./pages/AdminPulsePage')) : () => null

// ─── AgenticRedirect (small, inline is fine) ────────────────────
// Imported directly since OnboardingPage exports it as a named export.
// We wrap it in a small lazy component to keep the pattern consistent.
const AgenticRedirectPage = lazy(() =>
  import('./pages/OnboardingPage').then(mod => ({ default: mod.AgenticRedirect }))
)

// ─── Route loading fallback ─────────────────────────────────────
function RouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" aria-hidden="true" />
        <p className="text-sm text-neutral-500">Cargando...</p>
      </div>
    </div>
  )
}

// Root route element: on tenant subdomains go straight to /login instead of
// the public CodlyLabs marketing landing.
function RootRoute() {
  if (isTenantSubdomainHost()) {
    return <Navigate to="/login" replace />
  }
  return <HomePage />
}

// On tenant subdomains only these route prefixes are allowed; everything else
// (CodlyLabs marketing pages) is redirected into the tenant's own workspace.
// `/workspace` already redirects to `/login` when unauthenticated.
const TENANT_ALLOWED_PREFIXES = [
  '/login',
  '/register',
  '/auth/',
  '/workspace',
  '/profile',
  '/invite/',
  '/preview/',
  '/review/',
]

function TenantBoundary({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  if (!isTenantSubdomainHost()) return <>{children}</>
  const path = location.pathname
  const allowed = path === '/' || TENANT_ALLOWED_PREFIXES.some(p =>
    p.endsWith('/') ? path.startsWith(p) : path === p || path.startsWith(p + '/')
  )
  if (!allowed) {
    return <Navigate to="/workspace" replace />
  }
  return <>{children}</>
}

// Temporary public-onboarding lock — hides/blocks workspace, login, register,
// pricing and billing while signups/subscriptions are paused. Does NOT apply to
// tenant subdomains (white-label), where their own users must still log in.
function LockedRoute({ children }: { children: React.ReactNode }) {
  if (ACCESS_LOCKED && !isTenantSubdomainHost()) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

// White Label is a CodlyLabs-only feature — tenants cannot white-label inside
// their own white-label. Blocks both runtime subdomain visitors and dedicated
// tenant builds (where TENANT_STATIC_BRANDING is baked in).
function WhiteLabelOnlyRoute({ children }: { children: React.ReactNode }) {
  if (TENANT_STATIC_BRANDING !== null || isTenantSubdomainHost()) {
    return <Navigate to="/workspace" replace />
  }
  return <>{children}</>
}

// ─── App ─────────────────────────────────────────────────────────
function App() {
  return (
    <AppErrorBoundary>
      <Router>
        <PageTracker />
        <GlobalWorkspaceShortcut />

        {/* Skip-to-content link (accessibility) */}
        <a href="#main-content" className="skip-to-content">
          Saltar al contenido principal
        </a>

        <div className="min-h-screen bg-neutral-50 relative">
          <main id="main-content" role="main">
            <Suspense fallback={<RouteLoader />}>
              <TenantBoundary>
              <Routes>
                {/* Public */}
                <Route path="/" element={<RootRoute />} />
                <Route path="/roi-oracle" element={<RoiOraclePage />} />
                <Route path="/vertical-pack" element={<VerticalPackPage />} />
                <Route path="/vertical-pack/:slug" element={<VerticalPackDetailPage />} />
                {/* Marketplace — R-01: gated by VITE_ENABLE_MARKETPLACE */}
                <Route path="/marketplace" element={<FeatureGate feature="marketplace"><MarketplacePage /></FeatureGate>} />
                <Route path="/marketplace/bundles/:slug" element={<FeatureGate feature="marketplace"><MarketplaceBundlePage /></FeatureGate>} />
                <Route path="/marketplace/embed/:slug" element={<FeatureGate feature="marketplace"><MarketplaceEmbedPage /></FeatureGate>} />
                <Route path="/marketplace/purchases" element={<FeatureGate feature="marketplace"><MarketplacePurchasesPage /></FeatureGate>} />
                <Route path="/marketplace/private-workspace" element={<FeatureGate feature="marketplace"><MarketplaceWorkspacePage /></FeatureGate>} />
                <Route path="/marketplace/partners" element={<FeatureGate feature="marketplace"><MarketplacePartnerDashboardPage /></FeatureGate>} />
                <Route path="/marketplace/partners/:profileId" element={<FeatureGate feature="marketplace"><MarketplacePartnerProfilePage /></FeatureGate>} />
                <Route path="/marketplace/ref/:referralCode" element={<FeatureGate feature="marketplace"><MarketplaceReferralPage /></FeatureGate>} />
                <Route path="/marketplace/:slug" element={<FeatureGate feature="marketplace"><MarketplaceDetailPage /></FeatureGate>} />
                <Route path="/about-platform" element={<AboutPlatformPage />} />
                <Route path="/policies" element={<PoliciesPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Onboarding / Discovery */}
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/discovery-progress" element={<DiscoveryProgressPage />} />
                <Route path="/ai-architect" element={<AgenticRedirectPage />} />
                <Route path="/poc-generator" element={<PocGeneratorPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/shadow-mode" element={<ShadowModePage />} />

                {/* Try / Preview */}
                <Route path="/try" element={<TryPage />} />
                <Route path="/try/editor/:anonSessionId" element={<TryEditorPage />} />
                <Route path="/review/pocs/:token" element={<AdminRouteGuard><ReviewPocEditorPage /></AdminRouteGuard>} />
                <Route path="/welcome" element={<WelcomePage />} />
                <Route path="/preview/:pocId" element={<InteractivePreviewPage />} />
                <Route path="/shared/:shareSlug" element={<SharedPreviewPage />} />

                {/* Auth — locked while public signup is paused */}
                <Route path="/login" element={<LockedRoute><LoginPage /></LockedRoute>} />
                <Route path="/register" element={<LockedRoute><LoginPage /></LockedRoute>} />
                <Route path="/invite/:token" element={<LockedRoute><InviteAcceptPage /></LockedRoute>} />
                <Route path="/auth/callback" element={<LockedRoute><LinkedInCallbackPage /></LockedRoute>} />
                <Route path="/auth/google/callback" element={<LockedRoute><LinkedInCallbackPage /></LockedRoute>} />
                <Route path="/auth/linkedin/callback" element={<LockedRoute><LinkedInCallbackPage /></LockedRoute>} />
                <Route path="/auth/forgot-password" element={<LockedRoute><ForgotPasswordPage /></LockedRoute>} />
                <Route path="/auth/reset-password" element={<LockedRoute><ResetPasswordPage /></LockedRoute>} />
                <Route path="/profile" element={<LockedRoute><ProfilePage /></LockedRoute>} />
                {/* White Label (ex-Branding Studio) — full-screen, outside
                    WorkspaceLayout. Blocked on tenant hosts / dedicated builds. */}
                <Route path="/workspace/branding" element={<LockedRoute><WhiteLabelOnlyRoute><WorkspaceBrandingStudioView /></WhiteLabelOnlyRoute></LockedRoute>} />
                <Route path="/workspace" element={<LockedRoute><WorkspaceLayout /></LockedRoute>}>
                  <Route index element={<WorkspaceDashboardView />} />
                  <Route path="projects" element={<WorkspaceProjectsView />} />
                  <Route path="verticals" element={<WorkspaceVerticalsView />} />
                  <Route path="verticals/:slug" element={<WorkspaceVerticalPackDetailView />} />
                  <Route path="members" element={<WorkspaceMembersView />} />
                  <Route path="previews" element={<WorkspacePreviewsView />} />
                  <Route path="discovery" element={<WorkspaceDiscoveryView />} />
                  <Route path="summary" element={<WorkspaceDiscoverySummaryView />} />
                  <Route path="poc-generator" element={<WorkspacePocGeneratorView />} />
                  <Route path="billing" element={<WorkspaceBillingView />} />
                  <Route path="settings" element={<WorkspaceSettingsView />} />
                  <Route path="profile" element={<WorkspaceProfileView />} />
                </Route>
                {/* Pricing & billing — locked while subscriptions are paused */}
                <Route path="/pricing" element={<LockedRoute><PricingPage /></LockedRoute>} />
                <Route path="/billing" element={<LockedRoute><FeatureGate feature="billing"><BillingPage /></FeatureGate></LockedRoute>} />

                {/* Admin — R-01: core admin gated, sales tools gated separately.
                    Login is not wrapped in AdminRouteGuard (it's the entry point).
                    All other admin routes require valid admin token via AdminRouteGuard. */}
                <Route path="/admin/login" element={<FeatureGate feature="admin_advanced"><AdminLoginPage /></FeatureGate>} />
                <Route path="/admin" element={<FeatureGate feature="admin_advanced"><AdminRouteGuard><AdminDashboardPage /></AdminRouteGuard></FeatureGate>} />
                <Route path="/admin/users" element={<FeatureGate feature="admin_advanced"><AdminRouteGuard><AdminUsersPage /></AdminRouteGuard></FeatureGate>} />
                <Route path="/admin/organizations" element={<FeatureGate feature="admin_advanced"><AdminRouteGuard><AdminOrganizationsPage /></AdminRouteGuard></FeatureGate>} />
                <Route path="/admin/pocs" element={<FeatureGate feature="admin_advanced"><AdminRouteGuard><AdminPocsPage /></AdminRouteGuard></FeatureGate>} />
                <Route path="/admin/vertical-packs" element={<FeatureGate feature="admin_advanced"><AdminRouteGuard><AdminVerticalPacksPage /></AdminRouteGuard></FeatureGate>} />
                <Route path="/admin/marketplace" element={<FeatureGate feature="marketplace"><AdminRouteGuard><AdminMarketplacePage /></AdminRouteGuard></FeatureGate>} />
                <Route path="/admin/poc-social" element={<FeatureGate feature="admin_advanced"><AdminRouteGuard><AdminPocSocialPage /></AdminRouteGuard></FeatureGate>} />
                <Route path="/admin/marketing-insights" element={<FeatureGate feature="admin_advanced"><AdminRouteGuard><AdminMarketingInsightsPage /></AdminRouteGuard></FeatureGate>} />
                <Route path="/admin/pulse" element={<FeatureGate feature="admin_advanced"><AdminRouteGuard><AdminPulsePage /></AdminRouteGuard></FeatureGate>} />
                <Route path="/admin/sales-assistant" element={<FeatureGate feature="sales_tools"><AdminRouteGuard><AdminSalesAssistantPage /></AdminRouteGuard></FeatureGate>} />
                <Route path="/admin/patterns" element={<FeatureGate feature="admin_advanced"><AdminRouteGuard><AdminPatternsPage /></AdminRouteGuard></FeatureGate>} />
                <Route path="/admin/spec-editor" element={<FeatureGate feature="admin_advanced"><AdminRouteGuard><AdminSpecEditorPage /></AdminRouteGuard></FeatureGate>} />
                <Route path="/admin/training-agent" element={<FeatureGate feature="admin_advanced"><AdminRouteGuard><AdminTrainingAgentPage /></AdminRouteGuard></FeatureGate>} />
                <Route path="/admin/analytics" element={<FeatureGate feature="admin_advanced"><AdminRouteGuard><AdminAnalyticsPage /></AdminRouteGuard></FeatureGate>} />
                <Route path="/admin/billing" element={<FeatureGate feature="admin_advanced"><AdminRouteGuard><AdminBillingPage /></AdminRouteGuard></FeatureGate>} />
                <Route path="/admin/system" element={<FeatureGate feature="admin_advanced"><AdminRouteGuard><AdminSystemPage /></AdminRouteGuard></FeatureGate>} />
                <Route path="/admin/deploy" element={<FeatureGate feature="admin_advanced"><AdminRouteGuard><AdminDeployPage /></AdminRouteGuard></FeatureGate>} />
                <Route path="/admin/tenants" element={<FeatureGate feature="admin_advanced"><AdminRouteGuard><AdminTenantsPage /></AdminRouteGuard></FeatureGate>} />
              </Routes>
              </TenantBoundary>
            </Suspense>
          </main>
        </div>
      </Router>
    </AppErrorBoundary>
  )
}

export default App
