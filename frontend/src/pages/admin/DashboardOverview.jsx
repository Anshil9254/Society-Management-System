import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users, Building2, IndianRupee, AlertTriangle,
  ArrowUp, ArrowDown, UserPlus, FilePlus, Bell, Calendar
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function DashboardOverview({ stats }) {
  const totalResidents = stats?.totalResidents || 0;
  const totalFlats = stats?.totalFlats || 0;
  const vacantFlats = stats?.vacantFlats || 0;
  const totalCollections = stats?.collectionsThisMonth || 0;
  const collectionGrowth = Number(stats?.collectionGrowth || 0);
  const pendingComplaints = stats?.openComplaints || 0;
  const highPriorityOpenComplaints = stats?.highPriorityOpenComplaints || 0;

  const collectionData = stats?.maintenanceData || [];

  const complaintStatusColors = {
    'open': '#ef4444',
    'in_progress': '#3b82f6',
    'resolved': '#10b981',
    'closed': '#94a3b8',
  };

  const complaintStatusData = (stats?.complaintData || []).map(item => ({
    name: item.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: item.value,
    color: complaintStatusColors[item.name] || '#94a3b8'
  }));

  const occupancyData = (stats?.occupancyData || []).map(item => ({
    ...item,
    color: item.name === 'Occupied' ? '#10b981' : '#cbd5e1'
  }));

  const occupancyPercentage = totalFlats > 0 ? Math.round(((totalFlats - vacantFlats) / totalFlats) * 100) : 0;
  const recentNotifications = stats?.recentNotifications || [];
  const upcomingEvents = stats?.upcomingEvents || [];

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const diff = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} d ago`;
  };

  const formatEventDate = (dateString) => {
    if (!dateString) return { day: '', month: '', time: '' };
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="rounded-3xl border-0 shadow-lg shadow-blue-900/5 bg-white overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300 h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5 xl:p-6 relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 xl:w-16 xl:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-inner">
                <Users className="w-6 h-6 xl:w-7 xl:h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-500 font-medium mb-1 truncate">Total Residents</p>
                <h3 className="text-2xl xl:text-3xl font-bold text-slate-800 tracking-tight truncate">{totalResidents}</h3>
                <p className="text-[11px] xl:text-xs text-blue-600 font-semibold mt-1 truncate">Total Profiles</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-3xl border-0 shadow-lg shadow-emerald-900/5 bg-white overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300 h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5 xl:p-6 relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 xl:w-16 xl:h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-inner">
                <Building2 className="w-6 h-6 xl:w-7 xl:h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-500 font-medium mb-1 truncate">Total Flats</p>
                <h3 className="text-2xl xl:text-3xl font-bold text-slate-800 tracking-tight truncate">{totalFlats}</h3>
                <p className="text-[11px] xl:text-xs text-emerald-600 font-semibold mt-1 truncate">{vacantFlats} Vacant</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-3xl border-0 shadow-lg shadow-orange-900/5 bg-white overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300 h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5 xl:p-6 relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 xl:w-16 xl:h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-inner">
                <IndianRupee className="w-6 h-6 xl:w-7 xl:h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-500 font-medium mb-1 truncate">Collections (Month)</p>
                <h3 className="text-2xl xl:text-3xl font-bold text-slate-800 tracking-tight truncate">₹{(totalCollections).toLocaleString()}</h3>
                <p className={`text-[11px] xl:text-xs flex items-center font-semibold mt-1 truncate ${collectionGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {collectionGrowth >= 0 ? <ArrowUp className="w-3 h-3 mr-0.5 shrink-0" /> : <ArrowDown className="w-3 h-3 mr-0.5 shrink-0" />}
                  <span className="truncate">{Math.abs(collectionGrowth)}% vs last month</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-3xl border-0 shadow-lg shadow-rose-900/5 bg-white overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300 h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5 xl:p-6 relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 xl:w-16 xl:h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-red-500 text-white flex items-center justify-center shrink-0 shadow-inner">
                <AlertTriangle className="w-6 h-6 xl:w-7 xl:h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-500 font-medium mb-1 truncate">Open Complaints</p>
                <h3 className="text-2xl xl:text-3xl font-bold text-slate-800 tracking-tight truncate">{pendingComplaints}</h3>
                <p className={`text-[11px] xl:text-xs font-semibold mt-1 truncate ${highPriorityOpenComplaints > 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                  {highPriorityOpenComplaints} High Priority
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Middle Row: Line Chart and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="rounded-3xl border-0 shadow-lg shadow-slate-200/50 bg-white h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-8">
              <CardTitle className="text-xl font-bold text-slate-800">Maintenance Collection</CardTitle>
              <div className="flex items-center gap-4 text-sm font-medium">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></span> Collected</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-200 shadow-sm"></span> Pending</div>
                <select className="ml-4 bg-slate-50 border border-slate-200 rounded-xl text-sm px-3 py-1.5 text-slate-600 outline-none focus:ring-2 focus:ring-blue-100 transition-all">
                  <option>Last 6 Months</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="h-[320px] px-2 pb-6">
              {collectionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={collectionData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }} tickFormatter={(value) => `₹${value / 1000}K`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      formatter={(value) => [`₹ ${value.toLocaleString()}`, '']}
                    />
                    <Line type="monotone" dataKey="collected" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8, strokeWidth: 0, fill: '#3b82f6' }} />
                    <Line type="monotone" dataKey="pending" stroke="#cbd5e1" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8, strokeWidth: 0, fill: '#94a3b8' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 font-medium">No data available</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-3xl border-0 shadow-lg shadow-slate-200/50 bg-white h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6 border-b border-slate-100">
              <CardTitle className="text-xl font-bold text-slate-800">Activity</CardTitle>
              <a href="#" className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1 rounded-full">View All</a>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <div className="divide-y divide-slate-100 h-[320px] overflow-y-auto custom-scrollbar">
                {recentNotifications.map((note, idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    key={note.id}
                    className="p-4 flex gap-4 hover:bg-slate-50 transition-colors items-center cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors flex items-center justify-center shrink-0">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{note.action.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{note.entityType} ID: {note.entityId}</p>
                    </div>
                    <div className="text-xs font-medium text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-1 rounded-md">{formatTimeAgo(note.createdAt)}</div>
                  </motion.div>
                ))}
                {recentNotifications.length === 0 && (
                  <div className="p-8 h-full flex flex-col items-center justify-center text-center text-slate-400">
                    <Bell className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm font-medium">All caught up!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row: Donut Charts and Events */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="rounded-3xl border-0 shadow-lg shadow-slate-200/50 bg-white">
            <CardHeader className="pt-6 px-6">
              <CardTitle className="text-lg font-bold text-slate-800">Complaint Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-[280px] relative pb-6">
              {complaintStatusData.length > 0 ? (
                <>
                  <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={complaintStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none" cornerRadius={4}>
                          {complaintStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 w-full">
                    {complaintStatusData.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span>{item.name} <span className="font-bold text-slate-800 ml-1">{item.value}</span></span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-slate-400 font-medium">No complaints found</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-3xl border-0 shadow-lg shadow-slate-200/50 bg-white">
            <CardHeader className="pt-6 px-6">
              <CardTitle className="text-lg font-bold text-slate-800">Flats Occupancy</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-[280px] relative pb-6">
              {occupancyData.length > 0 ? (
                <>
                  <div className="h-[180px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={occupancyData} cx="50%" cy="50%" innerRadius={65} outerRadius={80} paddingAngle={0} dataKey="value" stroke="none" cornerRadius={4}>
                          {occupancyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-bold text-slate-800 tracking-tight">{occupancyPercentage}%</span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">Occupied</span>
                    </div>
                  </div>
                  <div className="flex justify-center gap-6 mt-4 w-full">
                    {occupancyData.map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1 text-sm font-medium">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                          {item.name}
                        </div>
                        <span className="font-bold text-lg text-slate-800">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-slate-400 font-medium">No flat data found</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-3xl border-0 shadow-lg shadow-slate-200/50 bg-white h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-800">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="divide-y divide-slate-100 h-[280px] overflow-y-auto custom-scrollbar">
                {upcomingEvents.map((evt, idx) => {
                  const { day, month, time } = formatEventDate(evt.eventDate);
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      key={evt.id}
                      className="p-4 flex gap-4 hover:bg-slate-50 transition-colors items-center cursor-pointer group"
                    >
                      <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 font-bold shrink-0 leading-tight group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                        <span className="text-xl">{day}</span>
                        <span className="text-[10px] uppercase tracking-widest">{month}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{evt.title}</p>
                        <p className="text-xs text-slate-500 mt-1 truncate font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {evt.location || 'Society Premises'}
                        </p>
                      </div>
                      <div className="text-xs text-slate-400 font-bold whitespace-nowrap bg-slate-50 px-2 py-1 rounded-md">{time}</div>
                    </motion.div>
                  );
                })}
                {upcomingEvents.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
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
