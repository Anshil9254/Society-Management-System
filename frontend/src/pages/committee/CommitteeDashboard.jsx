import React, { useEffect, useState } from 'react';
import { 
  Building2, Users, Receipt, MessageSquareWarning, Megaphone, 
  UserCheck, Calendar, FileText, Settings, Activity, Search, Bell, Mail, LogOut, Menu
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Sub Views
import DashboardOverview from '../admin/DashboardOverview'; // Reusing Admin's Overview component
import ComplaintsView from '../shared/ComplaintsView';
import AnnouncementsView from '../shared/AnnouncementsView';
import ServiceRequestsView from '../shared/ServiceRequestsView';
import BillingView from '../shared/BillingView';
import UsersView from '../shared/UsersView';
import FlatsView from '../shared/FlatsView';

const NAV_ITEMS = [
  { id: 'overview', label: 'Dashboard', icon: Activity },
  { id: 'directory', label: 'Residents', icon: Users },
  { id: 'flats', label: 'Flats', icon: Building2 },
  { id: 'service-requests', label: 'Maintenance', icon: Settings },
  { id: 'billing', label: 'Payments', icon: Receipt },
  { id: 'complaints', label: 'Complaints', icon: MessageSquareWarning },
  { id: 'visitors', label: 'Visitors', icon: UserCheck },
  { id: 'announcements', label: 'Notices', icon: Megaphone },
  { id: 'amenities', label: 'Amenities', icon: Building2 },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'documents', label: 'Documents', icon: FileText },
];

export default function CommitteeDashboard() {
  const { logout, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api.get('/dashboard');
        setStats(data.data);
      } catch (err) {
        console.error("Failed to fetch committee stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const renderContent = () => {
    if (loading) return <div className="p-8 text-xl">Loading dashboard...</div>;

    switch (activeTab) {
      case 'overview': return <DashboardOverview stats={stats} />;
      case 'directory': return <UsersView />;
      case 'flats': return <FlatsView />;
      case 'service-requests': return <ServiceRequestsView />;
      case 'billing': return <BillingView />;
      case 'complaints': return <ComplaintsView />;
      case 'announcements': return <AnnouncementsView />;
      default: return <div className="p-8 text-slate-500 flex flex-col items-center justify-center h-full">
        <Building2 className="w-16 h-16 mb-4 text-slate-300" />
        <h2 className="text-xl font-semibold text-slate-700">Module Under Construction</h2>
        <p>The {activeTab} module is coming soon.</p>
      </div>;
    }
  };

  const getPageTitle = () => {
    const item = NAV_ITEMS.find(n => n.id === activeTab);
    return item ? item.label : 'Committee Dashboard';
  };

  return (
    <div className="flex h-screen w-full bg-[#f4f7fb] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`transition-all duration-300 flex flex-col bg-[#0b1426] text-slate-300 h-full shadow-xl z-20 overflow-hidden ${isSidebarOpen ? 'w-[260px]' : 'w-[80px] -ml-[80px] md:ml-0 md:w-[80px]'}`}>
        {/* Logo Area */}
        <div className="h-[72px] flex items-center px-4 mb-2 shrink-0 border-b border-white/5">
          <div className="flex items-center gap-3 w-full">
            <Building2 className="w-8 h-8 text-blue-500 shrink-0" strokeWidth={1.5} />
            {isSidebarOpen && (
              <div className="flex flex-col overflow-hidden whitespace-nowrap">
                <span className="text-white font-bold text-[15px] tracking-wide leading-tight">SOCIETY</span>
                <span className="text-blue-500 text-[10px] tracking-widest font-semibold uppercase leading-tight">Management System</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white font-medium' 
                    : 'hover:bg-white/5 hover:text-white'
                }`}
                title={!isSidebarOpen ? item.label : ''}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {isSidebarOpen && <span className="text-sm whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* User Profile */}
        <div className="mt-auto p-4 shrink-0 border-t border-white/5">
          <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={logout}>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 border-2 border-[#0b1426]">
              <span className="text-sm font-bold text-white text-center leading-none">{user?.name ? user.name.substring(0,2).toUpperCase() : 'CM'}</span>
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold text-white truncate">{user?.name || 'Committee User'}</span>
                <span className="text-xs text-slate-400 truncate">Committee Member</span>
              </div>
            )}
            {isSidebarOpen && <LogOut className="w-4 h-4 text-slate-500 hover:text-red-400 shrink-0" />}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-800">{getPageTitle()}</h1>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="hidden md:flex relative group">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
              <Input 
                placeholder="Search anything..." 
                className="pl-9 pr-14 w-[280px] h-10 bg-slate-50 border-slate-200 rounded-xl text-sm focus-visible:ring-blue-100 focus-visible:border-blue-400 transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-sm">
                <span className="text-[10px] font-medium text-slate-400">Ctrl + K</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>
              <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                <Mail className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white"></span>
              </button>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-800">14 Jul 2026</span>
                <span className="text-xs text-slate-500">Tuesday, 2:30 PM</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto w-full h-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
