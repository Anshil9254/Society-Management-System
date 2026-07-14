import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  IndianRupee, MessageSquareWarning, Megaphone, 
  Calendar, Settings, ShieldAlert, FileText, ChevronRight, AlertCircle, Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ResidentOverview({ stats }) {
  if (!stats) return null;

  const totalUnpaid = stats.unpaidBills?.reduce((sum, bill) => sum + Number(bill.amount), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-red-50 to-transparent">
            <CardTitle className="text-sm font-medium text-slate-600">Total Dues</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
              <IndianRupee className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-slate-800">₹{totalUnpaid.toLocaleString('en-IN')}</div>
            <p className="text-xs text-slate-500 mt-1">Across {stats.unpaidBills?.length || 0} pending bills</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-orange-50 to-transparent">
            <CardTitle className="text-sm font-medium text-slate-600">Active Complaints</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
              <MessageSquareWarning className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-slate-800">{stats.openComplaints || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Currently open or in progress</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-blue-50 to-transparent">
            <CardTitle className="text-sm font-medium text-slate-600">Service Requests</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <Wrench className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-slate-800">{stats.activeServiceRequests || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Pending maintenance requests</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Left Column (Wider) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Actions */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-slate-600 hover:text-blue-600">
                <IndianRupee className="w-5 h-5" />
                <span className="text-xs font-medium">Pay Bills</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all text-slate-600 hover:text-orange-600">
                <ShieldAlert className="w-5 h-5" />
                <span className="text-xs font-medium">Raise Complaint</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-slate-600 hover:text-emerald-600">
                <Wrench className="w-5 h-5" />
                <span className="text-xs font-medium">Service Request</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-slate-600 hover:text-purple-600">
                <Calendar className="w-5 h-5" />
                <span className="text-xs font-medium">Book Amenity</span>
              </Button>
            </CardContent>
          </Card>

          {/* Pending Bills List */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                Pending Bills
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                View All <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {stats.unpaidBills?.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {stats.unpaidBills.map((bill) => (
                    <div key={bill.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">Maintenance Bill</p>
                          <p className="text-xs text-slate-500">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">₹{Number(bill.amount).toLocaleString()}</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700 mt-1">
                          {bill.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                    <IndianRupee className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-800">All clear!</p>
                  <p className="text-xs text-slate-500 mt-1">You have no pending bills.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Narrower) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Announcements */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-800">Society Notices</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {stats.recentAnnouncements?.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {stats.recentAnnouncements.map((announcement) => (
                    <div key={announcement.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        {announcement.isPinned && (
                          <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                        )}
                        <h4 className="text-sm font-medium text-slate-800 line-clamp-1">
                          {announcement.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                        {announcement.content}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No recent announcements.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-800">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {stats.upcomingEvents?.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {stats.upcomingEvents.map((event) => (
                    <div key={event.id} className="p-4 flex gap-4 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col items-center justify-center w-12 h-12 bg-blue-50 rounded-lg shrink-0">
                        <span className="text-xs font-medium text-blue-600 uppercase">
                          {new Date(event.startDate).toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="text-lg font-bold text-blue-700 leading-none">
                          {new Date(event.startDate).getDate()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-800">{event.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{event.location}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(event.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No upcoming events scheduled.
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
