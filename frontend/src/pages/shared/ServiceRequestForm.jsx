import React, { useState } from 'react';
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

const requestSchema = z.object({
  serviceType: z.string().min(3, "Service type is required"),
  preferredDate: z.string().min(1, "Preferred date is required"),
  notes: z.string().optional(),
});

export default function ServiceRequestForm({ open, onOpenChange, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      serviceType: '',
      preferredDate: '',
      notes: '',
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const validTypes = ['plumber', 'electrician', 'carpenter', 'cleaning', 'other'];
      const normalizedType = data.serviceType.trim().toLowerCase();
      
      const formattedData = {
        notes: data.notes,
        serviceType: validTypes.includes(normalizedType) ? normalizedType : 'other',
        preferredDate: new Date(data.preferredDate).toISOString()
      };
      
      await api.post('/service-requests', formattedData);
      toast.success("Service request submitted successfully");
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if(!val) reset();
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Service Request</DialogTitle>
          <DialogDescription>
            Request maintenance or services like plumbing, electrical, etc.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type</Label>
            <select
              id="serviceType"
              {...register("serviceType")}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select a service...</option>
              <option value="plumber">Plumber</option>
              <option value="electrician">Electrician</option>
              <option value="carpenter">Carpenter</option>
              <option value="cleaning">Cleaning</option>
              <option value="other">Other</option>
            </select>
            {errors.serviceType && <p className="text-sm text-destructive">{errors.serviceType.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredDate">Preferred Date & Time</Label>
            <Input id="preferredDate" type="datetime-local" {...register("preferredDate")} />
            {errors.preferredDate && <p className="text-sm text-destructive">{errors.preferredDate.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <textarea 
              id="notes" 
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Any details to help the technician..."
              {...register("notes")} 
            />
            {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
