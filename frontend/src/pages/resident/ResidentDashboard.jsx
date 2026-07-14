import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, Receipt, MessageSquareWarning, Megaphone, 
  Calendar, Settings, Activity
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PageLoader } from '../../components/ui/LoadingSkeletons';

// Sub Views
import ResidentOverview from './ResidentOverview';
import ComplaintsView from '../shared/ComplaintsView';
import AnnouncementsView from '../shared/AnnouncementsView';
import ServiceRequestsView from '../shared/ServiceRequestsView';
import BillingView from '../shared/BillingView';


const NAV_ITEMS = [
  { id: 'overview', label: 'Dashboard', icon: Activity },
  { id: 'billing', label: 'My Bills', icon: Receipt },
  { id: 'complaints', label: 'My Complaints', icon: MessageSquareWarning },
  { id: 'service-requests', label: 'Service Requests', icon: Settings },
  { id: 'announcements', label: 'Notices', icon: Megaphone },
  { id: 'events', label: 'Events', icon: Calendar },
];

export default function ResidentDashboard() {
  const { logout, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || 'overview';
  
  const setActiveTab = (newTab) => {
    navigate(`/resident/${newTab}`);
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api.get('/dashboard');
        setStats(data.data);
      } catch (err) {
        console.error("Failed to fetch resident stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getPageTitle = () => {
    const item = NAV_ITEMS.find(n => n.id === activeTab);
    return item ? item.label : 'Resident Dashboard';
  };

  const renderContent = () => {
    if (loading) return <PageLoader />;

    switch (activeTab) {
      case 'overview': return <ResidentOverview stats={stats} />;
      case 'service-requests': return <ServiceRequestsView />;
      case 'billing': return <BillingView />;
      case 'complaints': return <ComplaintsView />;
      case 'announcements': return <AnnouncementsView />;

      default: return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 bg-white/50 rounded-3xl border border-white/60 shadow-sm backdrop-blur-xl">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Building2 className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Module Under Construction</h2>
          <p className="text-slate-500 text-center max-w-md">
            We are actively building the <span className="font-semibold text-slate-700">{activeTab}</span> module. It will be available in an upcoming update.
          </p>
        </div>
      );
    }
  };

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={user}
      logout={logout}
      title={getPageTitle()}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
