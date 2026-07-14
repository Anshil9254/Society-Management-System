import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, MessageSquare, Wrench } from 'lucide-react';
import api from '../../lib/api';

export default function ResidentDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api.get('/dashboard/resident');
        setStats(data.data);
      } catch (err) {
        console.error("Failed to fetch resident stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-8 text-xl">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold tracking-tight">Resident Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Bills</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unpaidBillsCount || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Complaints</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeComplaintsCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Service Requests</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeServiceRequestsCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Recent Announcements</h2>
        <Card>
          <CardContent className="p-0">
            {stats?.recentAnnouncements?.length > 0 ? (
              <div className="divide-y">
                {stats.recentAnnouncements.map((announcement) => (
                  <div key={announcement.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <h3 className="font-semibold">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(announcement.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">No recent announcements</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
