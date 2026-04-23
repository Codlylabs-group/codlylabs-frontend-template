import { LayoutDashboard, Users, FileCode, Package, Linkedin, MessageSquare, Headphones, Brain, FileEdit, LogOut, Store, Building2, Activity, TrendingUp, CreditCard, FlaskConical, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface AdminSidebarProps {
  currentPage: 'dashboard' | 'users' | 'organizations' | 'pocs' | 'vertical-packs' | 'marketplace' | 'linkedin' | 'linkedin-outreach' | 'sales-assistant' | 'patterns' | 'spec-editor' | 'training-agent' | 'system' | 'tenants' | 'analytics' | 'billing'
  onLogout: () => void
}

export default function AdminSidebar({ currentPage, onLogout }: AdminSidebarProps) {
  const navigate = useNavigate()

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Panel Principal',
      icon: LayoutDashboard,
      path: '/admin'
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: Users,
      path: '/admin/users'
    },
    {
      id: 'organizations',
      label: 'Organizaciones',
      icon: Building2,
      path: '/admin/organizations'
    },
    {
      id: 'pocs',
      label: 'POCs Creadas',
      icon: FileCode,
      path: '/admin/pocs'
    },
    {
      id: 'vertical-packs',
      label: 'Vertical Packs',
      icon: Package,
      path: '/admin/vertical-packs'
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      icon: Store,
      path: '/admin/marketplace'
    },
    {
      id: 'linkedin',
      label: 'Campaign Generator',
      icon: Linkedin,
      path: '/admin/linkedin'
    },
    {
      id: 'linkedin-outreach',
      label: 'LinkedIn Outreach',
      icon: MessageSquare,
      path: '/admin/linkedin-outreach'
    },
    {
      id: 'sales-assistant',
      label: 'Sales Copilot',
      icon: Headphones,
      path: '/admin/sales-assistant'
    },
    {
      id: 'patterns',
      label: 'Pattern Memory',
      icon: Brain,
      path: '/admin/patterns'
    },
    {
      id: 'spec-editor',
      label: 'Spec Editor',
      icon: FileEdit,
      path: '/admin/spec-editor'
    },
    {
      id: 'training-agent',
      label: 'Training Agent',
      icon: FlaskConical,
      path: '/admin/training-agent'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      path: '/admin/analytics'
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: CreditCard,
      path: '/admin/billing'
    },
    {
      id: 'system',
      label: 'Sistema',
      icon: Activity,
      path: '/admin/system'
    },
    {
      id: 'tenants',
      label: 'Tenants',
      icon: RefreshCw,
      path: '/admin/tenants'
    }
  ]

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id

            return (
              <li key={item.id}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-200
                    ${isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                   text-gray-300 hover:bg-red-600 hover:text-white
                   transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}
