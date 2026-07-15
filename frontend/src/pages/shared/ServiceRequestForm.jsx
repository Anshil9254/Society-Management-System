import React, { useState, useRef } from 'react';
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
import { ImagePlus, X, Upload } from 'lucide-react';

const validTypes = ['plumber', 'electrician', 'carpenter', 'cleaning', 'other'];

export default function ServiceRequestForm({ open, onOpenChange, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [serviceType, setServiceType] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [notes, setNotes] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const validate = () => {
    const errs = {};
    if (!serviceType) errs.serviceType = 'Service type is required';
    if (!preferredDate) errs.preferredDate = 'Preferred date is required';
    return errs;
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const reset = () => {
    setServiceType('');
    setPreferredDate('');
    setNotes('');
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const normalized = serviceType.trim().toLowerCase();
      const formData = new FormData();
      formData.append('serviceType', validTypes.includes(normalized) ? normalized : 'other');
      formData.append('preferredDate', new Date(preferredDate).toISOString());
      if (notes) formData.append('notes', notes);
      if (imageFile) formData.append('image', imageFile);

      await api.post('/service-requests', formData);
      toast.success('Service request submitted successfully');
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) reset();
      onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[460px] rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 bg-slate-50 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-800">New Service Request</DialogTitle>
          <DialogDescription className="text-slate-500">
            Request maintenance or services like plumbing, electrical, etc.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 p-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type</Label>
            <select
              id="serviceType"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select a service...</option>
              <option value="plumber">Plumber</option>
              <option value="electrician">Electrician</option>
              <option value="carpenter">Carpenter</option>
              <option value="cleaning">Cleaning</option>
              <option value="other">Other</option>
            </select>
            {errors.serviceType && <p className="text-sm text-destructive">{errors.serviceType}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredDate">Preferred Date &amp; Time</Label>
            <Input
              id="preferredDate"
              type="datetime-local"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="rounded-xl"
            />
            {errors.preferredDate && <p className="text-sm text-destructive">{errors.preferredDate}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <textarea
              id="notes"
              className="flex min-h-[80px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Any details to help the technician..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <ImagePlus className="w-4 h-4 text-slate-500" />
              Attach Photo <span className="text-slate-400 font-normal text-xs">(optional)</span>
            </Label>

            {imagePreview ? (
              <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-rose-500 hover:bg-rose-50 rounded-full p-2 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
                  <p className="text-white text-xs font-medium truncate px-1">{imageFile?.name}</p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 hover:border-orange-300 bg-slate-50 hover:bg-orange-50/50 rounded-2xl p-5 flex flex-col items-center gap-2 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:border-orange-200 group-hover:shadow-orange-100 transition-all">
                  <Upload className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-600 group-hover:text-orange-600 transition-colors">
                    Click to upload photo
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">JPEG, PNG, WEBP up to 5MB</p>
                </div>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-6 shadow-md shadow-orange-600/20"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
