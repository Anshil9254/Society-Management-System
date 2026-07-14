import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Receipt, MessageSquareWarning, Settings, Megaphone, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';


export default function ResidentOverview({ stats }) {

  // Backend returns:
  //   openComplaints       (number)
  //   activeServiceRequests (number)
  //   unpaidBills          (array of bill objects)
  //   recentAnnouncements  (array)
  //   upcomingEvents       (array)

  const unpaidBillsList = stats?.unpaidBills || [];
  const pendingBills    = unpaidBillsList.length;
  const billAmount      = unpaidBillsList.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  const activeComplaints      = stats?.openComplaints || 0;
  const openServiceRequests   = stats?.activeServiceRequests || 0;

  const recentNotices    = stats?.recentAnnouncements || [];
  const upcomingEvents   = stats?.upcomingEvents || [];


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatEventDate = (dateString) => {
    if(!dateString) return { day: '', month: '', time: '' };
    const d = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return {
      day: d.getDate(),
      month: months[d.getMonth()],
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show" 
      className="space-y-6 pb-12"
    >
      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="rounded-3xl border-0 shadow-lg shadow-orange-900/5 bg-white overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 relative z-10 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-inner">
                <Receipt className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Pending Dues</p>
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{formatCurrency(billAmount)}</h3>
                <p className={`text-xs font-semibold mt-1 ${pendingBills > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {pendingBills} {pendingBills === 1 ? 'bill' : 'bills'} pending
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-3xl border-0 shadow-lg shadow-blue-900/5 bg-white overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 relative z-10 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-inner">
                <Settings className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Service Requests</p>
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{openServiceRequests}</h3>
                <p className="text-xs text-blue-600 font-semibold mt-1">Currently open</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-3xl border-0 shadow-lg shadow-rose-900/5 bg-white overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-6 relative z-10 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-red-500 text-white flex items-center justify-center shrink-0 shadow-inner">
                <MessageSquareWarning className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">My Complaints</p>
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{activeComplaints}</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">In progress</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="rounded-3xl border-0 shadow-lg shadow-slate-200/50 bg-white h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-500" />
                Recent Notices
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <div className="divide-y divide-slate-100 h-[320px] overflow-y-auto custom-scrollbar">
                {recentNotices.map((notice, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    key={notice.id} 
                    className="p-5 hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{notice.title}</h4>
                      <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{notice.content}</p>
                  </motion.div>
                ))}
                {recentNotices.length === 0 && (
                  <div className="p-8 h-full flex flex-col items-center justify-center text-center text-slate-400">
                    <Megaphone className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm font-medium">No new notices.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-3xl border-0 shadow-lg shadow-slate-200/50 bg-white h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <div className="divide-y divide-slate-100 h-[320px] overflow-y-auto custom-scrollbar">
                {upcomingEvents.map((evt, idx) => {
                  const { day, month, time } = formatEventDate(evt.eventDate);
                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      key={evt.id} 
                      className="p-4 flex gap-5 hover:bg-slate-50 transition-colors items-center cursor-pointer group"
                    >
                      <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 font-bold shrink-0 leading-tight group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
                        <span className="text-xl">{day}</span>
                        <span className="text-[10px] uppercase tracking-widest">{month}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate group-hover:text-emerald-600 transition-colors">{evt.title}</p>
                        <p className="text-xs text-slate-500 mt-1 truncate font-medium">{evt.location || 'Society Premises'}</p>
                      </div>
                      <div className="text-xs text-slate-400 font-bold whitespace-nowrap bg-slate-50 px-2 py-1 rounded-md">{time}</div>
                    </motion.div>
                  );
                })}
                {upcomingEvents.length === 0 && (
                  <div className="p-8 h-full flex flex-col items-center justify-center text-center text-slate-400">
                    <Calendar className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm font-medium">No upcoming events.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      
    </motion.div>
  );
}
