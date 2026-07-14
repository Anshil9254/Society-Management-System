import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Pencil, Trash2, Megaphone, Pin, Calendar, Users, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import AnnouncementForm from './AnnouncementForm';
import { motion, AnimatePresence } from 'framer-motion';
import { ListSkeleton } from '@/components/ui/LoadingSkeletons';

export default function AnnouncementsView() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const canManage = user?.role === 'admin' || user?.role === 'committee_member';

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      setAnnouncements(res.data?.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    
    try {
      await api.delete(`/announcements/${id}`);
      toast.success("Announcement deleted successfully");
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.message || "Failed to delete announcement");
    }
  };

  const handleEdit = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsFormOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedAnnouncement(null);
    setIsFormOpen(true);
  };

  const getAudienceBadge = (audience) => {
    switch (audience) {
      case 'all': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-bold shadow-sm">All Residents</Badge>;
      case 'owners': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none font-bold shadow-sm">Owners Only</Badge>;
      case 'tenants': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none font-bold shadow-sm">Tenants Only</Badge>;
      default: return <Badge variant="outline" className="font-bold shadow-sm capitalize">{audience}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 shadow-sm border border-violet-100/50">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Announcements</h2>
            <p className="text-sm text-slate-500 font-medium">Society notices and important updates</p>
          </div>
        </div>
        {canManage && (
          <Button onClick={handleCreateNew} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md shadow-violet-600/20 px-6 h-11 transition-all hover:-translate-y-0.5">
            <PlusCircle className="w-4 h-4 mr-2" /> New Announcement
          </Button>
        )}
      </div>

      {loading ? (
        <ListSkeleton rows={5} />
      ) : (
        <Card className="rounded-3xl border-0 shadow-lg shadow-slate-200/50 bg-white overflow-hidden">
          <CardContent className="p-0">
            {announcements.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-center bg-slate-50/50">
                <Megaphone className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No announcements</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">
                  {canManage 
                    ? "Create your first announcement to notify society members." 
                    : "There are no active announcements at this time."}
                </p>
                {canManage && (
                  <Button onClick={handleCreateNew} className="mt-6 bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md shadow-violet-600/20 px-6 h-11 transition-all">
                    Create Announcement
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-slate-600 h-14 pl-6">Notice Details</TableHead>
                      <TableHead className="font-semibold text-slate-600 h-14">Target Audience</TableHead>
                      <TableHead className="font-semibold text-slate-600 h-14">Published Date</TableHead>
                      <TableHead className="font-semibold text-slate-600 h-14 text-center">Status</TableHead>
                      {canManage && <TableHead className="font-semibold text-slate-600 h-14 text-right pr-6">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-50">
                    <AnimatePresence>
                      {announcements.map((item, index) => (
                        <motion.tr 
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`group transition-colors ${item.isPinned ? 'bg-indigo-50/30 hover:bg-indigo-50/60' : 'hover:bg-slate-50/80'}`}
                        >
                          <TableCell className="pl-6 py-4 max-w-md">
                            <div className="flex items-start gap-3">
                              {item.isPinned && (
                                <div className="mt-1 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                  <Pin className="w-3.5 h-3.5" />
                                </div>
                              )}
                              <div>
                                <h4 className={`font-bold text-base transition-colors ${item.isPinned ? 'text-indigo-900 group-hover:text-indigo-700' : 'text-slate-800 group-hover:text-violet-700'}`}>
                                  {item.title}
                                </h4>
                                <p className="text-sm text-slate-500 font-medium mt-1 line-clamp-2 pr-4">
                                  {item.content}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-slate-400" />
                              {getAudienceBadge(item.targetAudience)}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 font-medium text-slate-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              {format(new Date(item.createdAt), 'MMM d, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            {item.isPinned ? (
                              <Badge className="bg-indigo-100 text-indigo-700 border-none font-bold shadow-sm">Pinned</Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-600 border-none font-bold shadow-sm">Standard</Badge>
                            )}
                          </TableCell>
                          {canManage && (
                            <TableCell className="py-4 pr-6 text-right">
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  onClick={() => handleEdit(item)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <AnnouncementForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        onSuccess={fetchAnnouncements}
        initialData={selectedAnnouncement}
      />
    </div>
  );
}
