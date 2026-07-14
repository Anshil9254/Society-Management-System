import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, Building2, IndianRupee, AlertTriangle, 
  ArrowUp, ArrowDown, UserPlus, FilePlus, Bell, Calendar, Minus
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Button } from '@/components/ui/button';

export default function DashboardOverview({ stats }) {
  // Map real data from backend
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
    'closed': '#9ca3af',
  };

  const complaintStatusData = (stats?.complaintData || []).map(item => ({
    name: item.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: item.value,
    color: complaintStatusColors[item.name] || '#9ca3af'
  }));

  const occupancyData = (stats?.occupancyData || []).map(item => ({
    ...item,
    color: item.name === 'Occupied' ? '#10b981' : '#d1d5db'
  }));

  const occupancyPercentage = totalFlats > 0 ? Math.round(((totalFlats - vacantFlats) / totalFlats) * 100) : 0;

  const recentNotifications = stats?.recentNotifications || [];
  const upcomingEvents = stats?.upcomingEvents || [];

  const formatTimeAgo = (dateString) => {
    if(!dateString) return '';
    const diff = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} days ago`;
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

  return (
    <div className="space-y-6">
      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-0 shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Total Residents</p>
              <h3 className="text-2xl font-bold text-slate-800">{totalResidents}</h3>
              {/* Note: Growth metric for residents not provided in backend yet, keeping placeholder formatting */}
              <p className="text-xs text-green-500 flex items-center font-medium mt-1">
                 Total Profiles
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Total Flats</p>
              <h3 className="text-2xl font-bold text-slate-800">{totalFlats}</h3>
              <p className="text-xs text-blue-500 font-medium mt-1">
                {vacantFlats} Vacant
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
              <IndianRupee className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Total Collection (This Month)</p>
              <h3 className="text-2xl font-bold text-slate-800">₹ {(totalCollections).toLocaleString()}</h3>
              <p className={`text-xs flex items-center font-medium mt-1 ${collectionGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {collectionGrowth >= 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />} 
                {Math.abs(collectionGrowth)}% vs last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Open Complaints</p>
              <h3 className="text-2xl font-bold text-slate-800">{pendingComplaints}</h3>
              <p className={`text-xs font-medium mt-1 ${highPriorityOpenComplaints > 0 ? 'text-red-500' : 'text-slate-500'}`}>
                {highPriorityOpenComplaints} High Priority
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Line Chart and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-2xl border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold text-slate-800">Maintenance Collection Overview</CardTitle>
            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Collected</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Pending</div>
              <select className="ml-4 border border-slate-200 rounded-md text-sm px-2 py-1 text-slate-600 outline-none">
                <option>Last 6 Months</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] mt-4">
            {collectionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={collectionData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `₹${value/1000}K`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`₹ ${value.toLocaleString()}`, '']}
                  />
                  <Line type="monotone" dataKey="collected" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="pending" stroke="#cbd5e1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-800">Recent Notifications</CardTitle>
            <a href="#" className="text-sm text-blue-600 font-medium hover:underline">View All</a>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 h-[300px] overflow-y-auto custom-scrollbar">
              {recentNotifications.map((note) => (
                <div key={note.id} className="p-4 flex gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{note.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{note.entityType} ID: {note.entityId}</p>
                  </div>
                  <div className="text-xs text-slate-400 whitespace-nowrap">{formatTimeAgo(note.createdAt)}</div>
                </div>
              ))}
              {recentNotifications.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-400">No recent notifications.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Donut Charts and Events */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">Complaint Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[220px] relative">
            {complaintStatusData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={complaintStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                      {complaintStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom Legend to match design */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                  {complaintStatusData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs font-medium text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="w-20">{item.name}</span>
                      <span className="font-bold text-slate-800">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
               <div className="text-slate-400">No complaints found</div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">Flats Occupancy</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[220px] relative">
             {occupancyData.length > 0 ? (
               <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={occupancyData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={0} dataKey="value" stroke="none">
                      {occupancyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-800">{occupancyPercentage}%</span>
                    <span className="text-xs text-slate-500 font-medium">Occupied</span>
                </div>
                {/* Custom Legend to match design */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                  {occupancyData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs font-medium text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="w-16">{item.name}</span>
                      <span className="font-bold text-slate-800">{item.value}</span>
                    </div>
                  ))}
                </div>
               </>
             ) : (
                <div className="text-slate-400">No flat data found</div>
             )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-sm bg-white">
           <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-800">Upcoming Events</CardTitle>
            <a href="#" className="text-sm text-blue-600 font-medium hover:underline">View All</a>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-slate-100 h-[220px] overflow-y-auto custom-scrollbar">
              {upcomingEvents.map((evt) => {
                const { day, month, time } = formatEventDate(evt.eventDate);
                return (
                  <div key={evt.id} className="p-4 flex gap-4 hover:bg-slate-50 transition-colors items-center">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-bold shrink-0 leading-tight">
                      <span className="text-lg">{day}</span>
                      <span className="text-[10px] uppercase">{month}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{evt.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{evt.location || 'Society Premises'}</p>
                    </div>
                    <div className="text-xs text-slate-500 font-medium whitespace-nowrap">{time}</div>
                  </div>
                );
              })}
              {upcomingEvents.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-400">No upcoming events scheduled.</div>
              )}
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Row */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-4 px-1">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" className="h-12 rounded-xl bg-white border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 px-6">
            <UserPlus className="w-4 h-4 text-blue-600" />
            Add Resident
          </Button>
          <Button variant="outline" className="h-12 rounded-xl bg-white border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 px-6">
            <Building2 className="w-4 h-4 text-green-600" />
            Add Flat
          </Button>
          <Button variant="outline" className="h-12 rounded-xl bg-white border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 px-6">
            <IndianRupee className="w-4 h-4 text-orange-500" />
            Collect Maintenance
          </Button>
          <Button variant="outline" className="h-12 rounded-xl bg-white border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 px-6">
            <Bell className="w-4 h-4 text-purple-600" />
            Add Notice
          </Button>
          <Button variant="outline" className="h-12 rounded-xl bg-white border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 px-6">
            <Users className="w-4 h-4 text-blue-600" />
            Register Visitor
          </Button>
          <Button variant="outline" className="h-12 rounded-xl bg-white border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 px-6">
            <FilePlus className="w-4 h-4 text-emerald-600" />
            Generate Report
          </Button>
        </div>
      </div>
    </div>
  );
}
