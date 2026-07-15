import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '../../lib/api';
import { ImagePlus, X, Upload } from 'lucide-react';

export default function ComplaintForm({ onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('low');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('priority', priority);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await api.post('/complaints', formData);

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error creating complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}

      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Short summary of the issue"
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <textarea
          required
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed explanation"
        />
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select required value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="plumbing">Plumbing</SelectItem>
            <SelectItem value="electrical">Electrical</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="housekeeping">Housekeeping</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Priority</Label>
        <Select required value={priority} onValueChange={setPriority}>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
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
              className="w-full h-48 object-cover"
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
            className="w-full border-2 border-dashed border-slate-200 hover:border-rose-300 bg-slate-50 hover:bg-rose-50/50 rounded-2xl p-6 flex flex-col items-center gap-2 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:border-rose-200 group-hover:shadow-rose-100 transition-all">
              <Upload className="w-5 h-5 text-slate-400 group-hover:text-rose-500 transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600 group-hover:text-rose-600 transition-colors">
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

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={loading || !category}
          className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-6 h-11 shadow-md shadow-rose-600/20"
        >
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </Button>
      </div>
    </form>
  );
}
