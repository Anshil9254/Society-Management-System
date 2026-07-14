import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import ComplaintForm from './ComplaintForm';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareWarning, Plus, CheckCircle2, Clock, AlertCircle, Inbox, Edit } from 'lucide-react';
import { ListSkeleton } from '@/components/ui/LoadingSkeletons';

export default function ComplaintsView() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Status update state
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints');
      setComplaints(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    
    try {
      setIsUpdating(true);
      await api.patch(`/complaints/${selectedComplaint.id}/status`, {
        status: newStatus,
        comment: comment
      });
      setStatusUpdateOpen(false);
      setComment('');
      setNewStatus('');
      fetchComplaints();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert(err.response?.data?.message || 'Error updating status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open': 
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none font-bold shadow-sm px-2.5 py-1">Open</Badge>;
      case 'in_progress': 
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none font-bold shadow-sm px-2.5 py-1">In Progress</Badge>;
      case 'resolved': 
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-bold shadow-sm px-2.5 py-1">Resolved</Badge>;
      case 'closed': 
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none font-bold shadow-sm px-2.5 py-1">Closed</Badge>;
      default: 
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'low': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return null;
    }
  };

  const isAdminOrCommittee = user?.role === 'admin' || user?.role === 'committee_member';

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 shadow-sm border border-rose-100/50">
            <MessageSquareWarning className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Complaints</h2>
            <p className="text-sm text-slate-500 font-medium">View and manage society complaints</p>
          </div>
        </div>
        {user?.role === 'resident' && (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md shadow-rose-600/20 px-6 h-11 transition-all hover:-translate-y-0.5">
                <Plus className="w-4 h-4 mr-2" /> New Complaint
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden">
              <DialogHeader className="p-6 pb-4 bg-slate-50 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100">
                  <MessageSquareWarning className="w-6 h-6" />
                </div>
                <DialogTitle className="text-xl font-bold text-slate-800">File a New Complaint</DialogTitle>
              </DialogHeader>
              <div className="p-6 pt-2">
                <ComplaintForm onSuccess={() => {
                  setIsFormOpen(false);
                  fetchComplaints();
                }} />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <ListSkeleton rows={6} />
      ) : (
        <Card className="rounded-3xl border-0 shadow-lg shadow-slate-200/50 bg-white overflow-hidden">
          <CardContent className="p-0">
            {complaints.length > 0 ? (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr>
                      <th className="p-4 pl-6 font-semibold text-slate-600">Complaint Details</th>
                      <th className="p-4 font-semibold text-slate-600">Category</th>
                      <th className="p-4 font-semibold text-slate-600">Priority</th>
                      <th className="p-4 font-semibold text-slate-600">Status</th>
                      <th className="p-4 font-semibold text-slate-600">Date Logged</th>
                      {isAdminOrCommittee && <th className="p-4 pr-6 font-semibold text-slate-600 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <AnimatePresence>
                      {complaints.map((complaint, index) => (
                        <motion.tr 
                          key={complaint.id} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="p-4 pl-6">
                            <p className="font-bold text-slate-800 text-sm group-hover:text-rose-600 transition-colors">{complaint.title}</p>
                            <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1 max-w-[250px]">{complaint.description}</p>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="capitalize text-slate-600 font-semibold bg-white">
                              {complaint.category.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 capitalize text-sm font-semibold text-slate-700">
                              {getPriorityIcon(complaint.priority)}
                              {complaint.priority}
                            </div>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(complaint.status)}
                          </td>
                          <td className="p-4 text-sm font-medium text-slate-600">
                            {new Date(complaint.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })}
                          </td>
                          {isAdminOrCommittee && (
                            <td className="p-4 pr-6 text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 font-semibold rounded-lg"
                                onClick={() => {
                                  setSelectedComplaint(complaint);
                                  setNewStatus(complaint.status);
                                  setComment('');
                                  setStatusUpdateOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" /> Update
                              </Button>
                            </td>
                          )}
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 flex flex-col items-center justify-center text-center">
                <Inbox className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No complaints found</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">
                  {user?.role === 'resident' 
                    ? "You haven't filed any complaints yet."
                    : "There are no complaints registered in the system."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
        <DialogContent className="rounded-3xl p-6 max-w-md">
          <DialogHeader className="mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Edit className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-800">Update Complaint Status</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <form onSubmit={handleStatusUpdate} className="space-y-5">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Complaint Title</Label>
                <div className="font-bold text-slate-800 text-base mt-1">{selectedComplaint.title}</div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-11 focus:ring-blue-500">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Comment / Resolution Note (Required)</Label>
                <textarea 
                  className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Explain why the status is changing or describe the resolution..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="ghost" className="rounded-xl hover:bg-slate-100" onClick={() => setStatusUpdateOpen(false)} disabled={isUpdating}>Cancel</Button>
                <Button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6" disabled={isUpdating}>
                  {isUpdating ? 'Updating...' : 'Update Status'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
