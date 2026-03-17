import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Bot, 
  MessageSquare, 
  BarChart3, 
  Building2, 
  Settings,
  LogOut,
  Users,
  X,
  Target
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Sidebar({ isOpen, onClose }) {
  const { logout, user } = useAuth();
  const role = user?.role || 'customer';
  const pathname = usePathname();

  const getNavItems = () => {
    if (role === 'admin') {
      return [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ];
    } else if (role === 'customer') {
      return [
        { name: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard },
        { name: 'Chat', href: '/customer/chat', icon: MessageSquare },
        { name: 'Find Business', href: '/customer/find-business', icon: Building2 },
        { name: 'Bookmarks', href: '/customer/bookmarks', icon: Bot },
        { name: 'Settings', href: '/customer/settings', icon: Settings },
      ];
    } else {
      return [
        { name: 'Dashboard', href: '/business/dashboard', icon: LayoutDashboard },
        { name: 'Conversations', href: '/business/conversation', icon: MessageSquare },
        { name: 'Settings', href: '/business/settings', icon: Settings },
      ];
    }
  };

  const navItems = getNavItems();
  const userDisplayName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'User';
  const roleLabel = role === 'business_owner' ? 'Business' : role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed lg:static top-0 left-0 z-[70] h-screen w-72 bg-black flex flex-col border-r border-white/10 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo Section */}
        <div className="p-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="size-8 bg-[#00D18F]/10 rounded-lg flex items-center justify-center border border-[#00D18F]/20">
              <Target className="text-[#00D18F] w-5 h-5" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-white">Voxy</span>
          </Link>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-zinc-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto pt-4 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                onClick={() => onClose?.()}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-[#1f1f1f] text-[#00D18F]" 
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className={`w-6 h-6 ${isActive ? "text-[#00D18F]" : "text-white"}`} />
                <span className="font-bold text-lg">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* Bottom Section */}
        <div className="p-4 border-t border-white/5 space-y-4">
          {/* Logout */}
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white transition-colors w-full group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-lg">Logout</span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="size-12 rounded-full bg-[#00D18F] flex items-center justify-center text-black font-bold text-xl shadow-[0_0_20px_rgba(0,209,143,0.3)]">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-lg text-white truncate leading-tight uppercase tracking-tight">
                {userDisplayName}
              </div>
              <div className="text-sm text-zinc-500 font-medium">
                {roleLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
