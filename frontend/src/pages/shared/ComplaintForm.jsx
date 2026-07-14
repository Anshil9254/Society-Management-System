import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '../../lib/api';

export default function ComplaintForm({ onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('low');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await api.post('/complaints', {
        title,
        description,
        category,
        priority
      });
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
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
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

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={loading || !category}>
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </Button>
      </div>
    </form>
  );
}
