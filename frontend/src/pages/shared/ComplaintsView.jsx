import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ComplaintForm from './ComplaintForm';

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
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div>Loading complaints...</div>;

  const isAdminOrCommittee = user.role === 'admin' || user.role === 'committee_member';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Complaints</h2>
        {user.role === 'resident' && (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>New Complaint</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>File a New Complaint</DialogTitle>
              </DialogHeader>
              <ComplaintForm onSuccess={() => {
                setIsFormOpen(false);
                fetchComplaints();
              }} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {complaints.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-4 font-medium">Title</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Priority</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Date</th>
                    {isAdminOrCommittee && <th className="p-4 font-medium">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-muted/50">
                      <td className="p-4">
                        <p className="font-semibold">{complaint.title}</p>
                        <p className="text-xs text-muted-foreground">{complaint.description.substring(0, 50)}...</p>
                      </td>
                      <td className="p-4 capitalize">{complaint.category}</td>
                      <td className="p-4 capitalize">{complaint.priority}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(complaint.status)}`}>
                          {complaint.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                      {isAdminOrCommittee && (
                        <td className="p-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setNewStatus(complaint.status);
                              setComment('');
                              setStatusUpdateOpen(true);
                            }}
                          >
                            Update
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No complaints found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Complaint Status</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <form onSubmit={handleStatusUpdate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Complaint</Label>
                <div className="font-medium">{selectedComplaint.title}</div>
              </div>
              
              <div className="space-y-2">
                <Label>New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Comment (Required)</Label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Explain why the status is changing..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setStatusUpdateOpen(false)}>Cancel</Button>
                <Button type="submit">Update Status</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
