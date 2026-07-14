import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import AnnouncementForm from './AnnouncementForm';

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Announcements</h2>
        {canManage && (
          <Button onClick={handleCreateNew} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            New Announcement
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                {canManage && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={canManage ? 5 : 4} className="text-center h-24 text-muted-foreground">
                    Loading announcements...
                  </TableCell>
                </TableRow>
              ) : announcements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManage ? 5 : 4} className="text-center h-24 text-muted-foreground">
                    No announcements found.
                  </TableCell>
                </TableRow>
              ) : (
                announcements.map((item) => (
                  <TableRow key={item.id} className={item.isPinned ? "bg-muted/50" : ""}>
                    <TableCell>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">{item.content}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {item.targetAudience}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.isPinned && <Badge variant="secondary">Pinned</Badge>}
                    </TableCell>
                    <TableCell>{format(new Date(item.createdAt), 'MMM d, yyyy')}</TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AnnouncementForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        onSuccess={fetchAnnouncements}
        initialData={selectedAnnouncement}
      />
    </div>
  );
}
