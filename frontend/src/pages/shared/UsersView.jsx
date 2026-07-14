import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Users, MoreVertical, Shield, User, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListSkeleton } from '@/components/ui/LoadingSkeletons';
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
      case 'active': return <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 font-semibold shadow-sm">Active</Badge>;
      case 'inactive': return <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 font-semibold shadow-sm">Inactive</Badge>;
      case 'suspended': return <Badge variant="destructive" className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200 font-semibold shadow-sm">Suspended</Badge>;
      default: return <Badge variant="outline" className="font-semibold shadow-sm">{status}</Badge>;
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <Shield className="w-4 h-4 text-rose-500" />;
      case 'committee_member': return <UserCheck className="w-4 h-4 text-blue-500" />;
      default: return <User className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-100/50">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Directory</h2>
            <p className="text-sm text-slate-500 font-medium">Manage residents and staff members</p>
          </div>
        </div>
       
      </div>

      {loading ? (
        <ListSkeleton rows={8} />
      ) : (
        <Card className="rounded-3xl border-0 shadow-lg shadow-slate-200/50 bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-600 h-14 pl-6">Resident</TableHead>
                    <TableHead className="font-semibold text-slate-600 h-14">Contact Info</TableHead>
                    <TableHead className="font-semibold text-slate-600 h-14">Flat</TableHead>
                    <TableHead className="font-semibold text-slate-600 h-14">Role</TableHead>
                    <TableHead className="font-semibold text-slate-600 h-14">Status</TableHead>
                    {isAdmin && <TableHead className="font-semibold text-slate-600 h-14 text-right pr-6">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 6 : 5} className="h-48 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <Users className="w-12 h-12 mb-3 opacity-20" />
                            <p className="text-base font-medium text-slate-500">No users found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((item, index) => (
                        <motion.tr 
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group hover:bg-slate-50/80 border-b border-slate-50 transition-colors"
                        >
                          <TableCell className="pl-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center shrink-0 border border-slate-200/50 shadow-inner text-slate-500 font-bold text-sm">
                                {item.profile?.fullName ? item.profile.fullName.substring(0, 2).toUpperCase() : 'US'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                  {item.profile?.fullName || 'No Name'}
                                </div>
                                <div className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${item.profile?.isOwner ? 'bg-indigo-500' : 'bg-orange-500'}`}></span>
                                  {item.profile?.isOwner ? 'Owner' : 'Tenant'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm font-medium text-slate-700">{item.email}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{item.phone || 'No phone added'}</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200/60 shadow-sm">
                              {item.profile?.flatNumber ? `${item.profile.blockName}-${item.profile.flatNumber}` : 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              {getRoleIcon(item.role)}
                              <span className="capitalize text-sm font-semibold text-slate-700">
                                {item.role.replace('_', ' ')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            {getStatusBadge(item.status)}
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="text-right pr-6 py-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200/50 focus-visible:ring-0">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl shadow-slate-200/50 border-slate-100">
                                  <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Change Status</div>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'active')} className="cursor-pointer font-medium hover:bg-slate-50 rounded-lg mx-1">Set Active</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'suspended')} className="cursor-pointer font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg mx-1">Set Suspended</DropdownMenuItem>
                                  
                                  <div className="px-3 py-2 mt-1 text-xs font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100">Change Role</div>
                                  <DropdownMenuItem onClick={() => handleUpdateRole(item.id, 'resident')} className="cursor-pointer font-medium hover:bg-slate-50 rounded-lg mx-1">Make Resident</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateRole(item.id, 'committee_member')} className="cursor-pointer font-medium hover:bg-slate-50 rounded-lg mx-1">Make Committee</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateRole(item.id, 'admin')} className="cursor-pointer font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg mx-1">Make Admin</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          )}
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
