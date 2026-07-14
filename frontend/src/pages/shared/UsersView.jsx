import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function UsersView() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data?.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/users/${id}/status`, { status: newStatus });
      toast.success("User status updated successfully");
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleUpdateRole = async (id, newRole) => {
    try {
      await api.patch(`/users/${id}/role`, { role: newRole });
      toast.success("User role updated successfully");
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Failed to update role");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white border-transparent">Active</Badge>;
      case 'inactive': return <Badge variant="secondary">Inactive</Badge>;
      case 'suspended': return <Badge variant="destructive">Suspended</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Society Directory</h2>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Flat</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead className="text-right">Manage</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center h-24 text-muted-foreground">
                    Loading directory...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center h-24 text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.profile?.fullName || 'No Name'}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.profile?.isOwner ? 'Owner' : 'Tenant'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{item.email}</div>
                      <div className="text-sm text-muted-foreground">{item.phone || '-'}</div>
                    </TableCell>
                    <TableCell>
                      {item.profile?.flatNumber ? `${item.profile.blockName}-${item.profile.flatNumber}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{item.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status)}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">Manage</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Change Status</div>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'active')}>Set Active</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'suspended')}>Set Suspended</DropdownMenuItem>
                            
                            <div className="px-2 py-1.5 mt-2 text-sm font-semibold text-muted-foreground border-t">Change Role</div>
                            <DropdownMenuItem onClick={() => handleUpdateRole(item.id, 'resident')}>Make Resident</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateRole(item.id, 'committee_member')}>Make Committee</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateRole(item.id, 'admin')}>Make Admin</DropdownMenuItem>
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
    </div>
  );
}
