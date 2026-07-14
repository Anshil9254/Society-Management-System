import React, { useState } from 'react';
import { Search, Bell, Mail, LogOut, Menu, Calendar, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({ 
  navItems, 
  activeTab, 
  setActiveTab, 
  user, 
  logout, 
  title, 
  children 
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // User initials
  const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : 'US';
  const roleDisplay = user?.role === 'admin' ? 'Super Admin' 
                    : user?.role === 'committee_member' ? 'Committee Member' 
                    : 'Resident';

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="flex flex-col bg-[#0f172a] text-slate-300 h-full shadow-2xl z-20 overflow-hidden relative"
      >
        {/* Logo Area */}
        <div className="h-[72px] flex items-center px-4 mb-2 shrink-0 border-b border-white/5">
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-blue-500" strokeWidth={1.5} />
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col overflow-hidden whitespace-nowrap"
                >
                  <span className="text-white font-bold text-[15px] tracking-wide leading-tight">SOCIETY</span>
                  <span className="text-blue-400 text-[10px] tracking-widest font-semibold uppercase leading-tight">Management</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative group overflow-hidden ${
                  isActive 
                    ? 'text-white bg-blue-600 shadow-md shadow-blue-900/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
                title={!isSidebarOpen ? item.label : ''}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-blue-600 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3 w-full">
                  <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span 
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            );
          })}
        </div>

        {/* User Profile */}
        <div className="mt-auto p-4 shrink-0 border-t border-white/5">
          <div 
            className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group" 
            onClick={logout}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shrink-0 shadow-inner">
              <span className="text-sm font-bold text-white text-center leading-none">{initials}</span>
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col min-w-0 flex-1"
                >
                  <span className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</span>
                  <span className="text-xs text-slate-400 truncate group-hover:text-slate-300 transition-colors">{roleDisplay}</span>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <LogOut className="w-4 h-4 text-slate-500 hover:text-red-400 shrink-0 transition-colors" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#f8fafc]">
        {/* Header (Glassmorphic) */}
        <header className="h-[72px] bg-white/70 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-6 shrink-0 z-50 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100/80 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
              {title}
            </h1>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="hidden md:flex relative group z-50">
              <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors z-10 ${isSearchFocused ? 'text-blue-500' : 'text-slate-400'}`} />
              <Input 
                placeholder="Search anything..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="pl-9 pr-14 w-[280px] h-10 bg-slate-100/50 border-slate-200/50 rounded-xl text-sm focus-visible:ring-blue-100 focus-visible:border-blue-400 transition-all shadow-sm relative z-0"
              />
              
              
              <AnimatePresence>
                {isSearchFocused && searchQuery && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-12 left-0 w-[320px] bg-white rounded-xl shadow-xl border border-slate-100 p-2 overflow-hidden"
                  >
                    <div className="p-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Results for "{searchQuery}"</div>
                    <div className="p-3 text-sm text-slate-500 text-center">No recent results found.</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTab('announcements')}
                className="relative p-2.5 rounded-xl transition-colors text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                title="Announcements"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-800">
                  {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {new Date().toLocaleDateString('en-GB', { weekday: 'long' })}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content with Page Transition */}
        <div className="flex-1 overflow-auto custom-scrollbar relative">
          <div className="max-w-[1400px] mx-auto w-full h-full p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
