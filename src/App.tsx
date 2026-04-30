import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { BarChart3, Database as DbIcon, Settings, LayoutDashboard, LogOut } from 'lucide-react';
import DashboardPage from './pages/Dashboard';
import DataEntryPage from './pages/DataEntry';
import SettingsPage from './pages/Settings';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ModeToggle } from '@/components/mode-toggle';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Header } from './components/Header';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Data Entry', path: '/data-entry', icon: DbIcon },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const sidebarVariants = {
    hidden: { x: -20, opacity: 0 },
    show: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: -10, opacity: 0 },
    show: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.aside 
      variants={sidebarVariants}
      initial="hidden"
      animate="show"
      className="w-64 border-r border-border bg-card/50 flex flex-col h-full hidden md:flex"
    >
      {/* Sidebar Navigation - Simplified as logo is now in top Header */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-4">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <motion.div key={item.path} variants={itemVariants}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-secondary text-secondary-foreground" 
                      : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </ScrollArea>
      </div>
      <motion.div variants={itemVariants} className="p-4 border-t border-border bg-card">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-medium truncate">{user?.username || 'Guest User'}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email || 'guest@example.com'}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-xs text-muted-foreground hover:text-destructive h-8"
          onClick={logout}
        >
          <LogOut className="w-3.5 h-3.5 mr-2" />
          Logout
        </Button>
      </motion.div>
    </motion.aside>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  // Unified layout with Header for all pages

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {isAuthenticated && <Sidebar />}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/data-entry" element={<ProtectedRoute><DataEntryPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
