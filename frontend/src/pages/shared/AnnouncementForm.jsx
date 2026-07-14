import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const announcementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  content: z.string().min(10, "Content must be at least 10 characters"),
  targetAudience: z.enum(['all', 'residents', 'committee']),
  isPinned: z.boolean().optional(),
});

export default function AnnouncementForm({ open, onOpenChange, onSuccess, initialData = null }) {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '',
      content: '',
      targetAudience: 'all',
      isPinned: false,
    }
  });

  useEffect(() => {
    if (initialData && open) {
      reset({
        title: initialData.title,
        content: initialData.content,
        targetAudience: initialData.targetAudience || 'all',
        isPinned: initialData.isPinned || false,
      });
    } else if (open) {
      reset({
        title: '',
        content: '',
        targetAudience: 'all',
        isPinned: false,
      });
    }
  }, [initialData, open, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (initialData) {
        await api.patch(`/announcements/${initialData.id}`, data);
        toast.success("Announcement updated successfully");
      } else {
        await api.post('/announcements', data);
        toast.success("Announcement created successfully");
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error(err.message || "Failed to save announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the details of the announcement.' : 'Create a new announcement for the society.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <textarea 
              id="content" 
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              {...register("content")} 
            />
            {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience</Label>
            <select
              id="targetAudience"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              {...register("targetAudience")}
            >
              <option value="all">Everyone</option>
              <option value="residents">Residents Only</option>
              <option value="committee">Committee Only</option>
            </select>
            {errors.targetAudience && <p className="text-sm text-destructive">{errors.targetAudience.message}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="isPinned" 
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              {...register("isPinned")} 
            />
            <Label htmlFor="isPinned" className="font-normal cursor-pointer">Pin this announcement to top</Label>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : (initialData ? "Update" : "Publish")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
