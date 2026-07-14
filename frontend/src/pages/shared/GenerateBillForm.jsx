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

const bulkBillSchema = z.object({
  billingMonth: z.coerce.number().min(1).max(12),
  billingYear: z.coerce.number().min(2020).max(2100),
  dueDate: z.string().min(1, "Due date is required"),
  ratePerSqFt: z.coerce.number().min(0.1, "Rate per SqFt must be positive"),
  blockId: z.string().optional(),
});

export default function GenerateBillForm({ open, onOpenChange, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState([]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(bulkBillSchema),
    defaultValues: {
      billingMonth: new Date().getMonth() + 1,
      billingYear: new Date().getFullYear(),
      dueDate: '',
      ratePerSqFt: 3, 
      blockId: '',
    }
  });

  useEffect(() => {
    if (open) {
      const fetchBlocks = async () => {
        try {
          const res = await api.get('/blocks');
          setBlocks(res.data || []);
        } catch (err) {
          console.error('Failed to fetch wings:', err);
        }
      };
      fetchBlocks();
    }
  }, [open]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // The backend expects due date as ISO string
      const isoDueDate = new Date(data.dueDate).toISOString();

      const payload = {
        billingMonth: data.billingMonth,
        billingYear: data.billingYear,
        dueDate: isoDueDate,
        ratePerSqFt: data.ratePerSqFt,
        blockId: data.blockId || null,
      };

      await api.post('/billing/bulk', payload);
      toast.success("Bulk bills generated successfully");
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error(err.message || "Failed to generate bills");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if(!val) reset();
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Generate Bulk Bills</DialogTitle>
          <DialogDescription>
            Issue maintenance bills to flats in the society based on their square feet area.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingMonth">Month (1-12)</Label>
              <Input id="billingMonth" type="number" min="1" max="12" {...register("billingMonth")} />
              {errors.billingMonth && <p className="text-sm text-destructive">{errors.billingMonth.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingYear">Year</Label>
              <Input id="billingYear" type="number" {...register("billingYear")} />
              {errors.billingYear && <p className="text-sm text-destructive">{errors.billingYear.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="blockId">Select Wing / Block (Optional)</Label>
            <select 
              id="blockId" 
              className="flex h-10 w-full rounded-xl border border-slate-200 focus-visible:ring-blue-100 bg-white px-3 py-2 text-sm"
              {...register("blockId")}
            >
              <option value="">All Wings</option>
              {blocks.map((block) => (
                <option key={block.id} value={block.id}>{block.name}</option>
              ))}
            </select>
            {errors.blockId && <p className="text-sm text-destructive">{errors.blockId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" type="datetime-local" {...register("dueDate")} />
            {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ratePerSqFt">Maintenance Rate per SqFt (₹)</Label>
            <Input id="ratePerSqFt" type="number" step="0.01" {...register("ratePerSqFt")} />
            {errors.ratePerSqFt && <p className="text-sm text-destructive">{errors.ratePerSqFt.message}</p>}
            <p className="text-[10px] text-muted-foreground mt-1">
              Example: For a 1,000 sqft flat, a rate of ₹3/sqft will generate a ₹3,000 bill.
            </p>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl bg-slate-900 text-white hover:bg-slate-800" disabled={loading}>
              {loading ? "Generating..." : "Generate Bills"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
