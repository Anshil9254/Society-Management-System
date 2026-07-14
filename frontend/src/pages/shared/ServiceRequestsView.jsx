import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ServiceRequestForm from './ServiceRequestForm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ServiceRequestsView() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const isResident = user?.role === 'resident';
  const canManage = user?.role === 'admin' || user?.role === 'committee_member';

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/service-requests');
      setRequests(res.data?.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch service requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/service-requests/${id}/status`, { status: newStatus });
      toast.success("Status updated successfully");
      fetchRequests();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open': return <Badge variant="destructive">Open</Badge>;
      case 'in_progress': return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white border-transparent">In Progress</Badge>;
      case 'resolved': return <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white border-transparent">Resolved</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Service Requests</h2>
        {isResident && (
          <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            New Request
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Type</TableHead>
                {canManage && <TableHead>Resident</TableHead>}
                <TableHead>Preferred Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Status</TableHead>
                {canManage && <TableHead className="text-right">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={canManage ? 6 : 4} className="text-center h-24 text-muted-foreground">
                    Loading requests...
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManage ? 6 : 4} className="text-center h-24 text-muted-foreground">
                    No service requests found.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.serviceType}
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        <div className="text-sm">{item.resident?.profile?.fullName || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.resident?.profile?.flat ? `${item.resident.profile.flat.block}-${item.resident.profile.flat.flatNumber}` : 'No Flat'}
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      {item.preferredDate ? format(new Date(item.preferredDate), 'MMM d, yyyy h:mm a') : 'N/A'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {item.notes || '-'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status)}
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">Update Status</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'open')}>
                              Mark as Open
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'in_progress')}>
                              Mark In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'resolved')}>
                              Mark as Resolved
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ServiceRequestForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        onSuccess={fetchRequests}
      />
    </div>
  );
}
