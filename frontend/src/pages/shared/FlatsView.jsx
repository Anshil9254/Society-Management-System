import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Building2, Home, Users, Plus, Trash2, ArrowLeft, 
  UserPlus, Info, Shield, Mail, Phone, CalendarDays, Key, UserCheck2, ArrowUpRight, Edit
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function FlatsView() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [flatError, setFlatError] = useState(null);

  // Modals state
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [isEditBlockOpen, setIsEditBlockOpen] = useState(false);
  const [isAddFlatOpen, setIsAddFlatOpen] = useState(false);
  const [isAddFamilyOpen, setIsAddFamilyOpen] = useState(false);
  const [isAssignLeaderOpen, setIsAssignLeaderOpen] = useState(false);

  // Loading states for submissions
  const [isCreatingBlock, setIsCreatingBlock] = useState(false);
  const [isEditingBlock, setIsEditingBlock] = useState(false);
  const [isCreatingFlat, setIsCreatingFlat] = useState(false);
  const [isAddingFamily, setIsAddingFamily] = useState(false);
  const [isAssigningLeader, setIsAssigningLeader] = useState(false);

  // Form states
  const [newBlock, setNewBlock] = useState({ name: '', floorCount: '' });
  const [editBlock, setEditBlock] = useState({ id: '', name: '', floorCount: '' });
  const [newFlat, setNewFlat] = useState({ flatNumber: '', type: '2BHK', squareFeet: '' });
  const [newFamily, setNewFamily] = useState({ fullName: '', relation: 'Spouse', age: '' });
  const [newLeader, setNewLeader] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    moveInDate: new Date().toISOString().split('T')[0],
    isOwner: true
  });

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      setFlatError(null);
      if (isAdmin) {
        const res = await api.get('/blocks');
        const data = res.data || [];
        setBlocks(data);
        
        // Update selected block & flat references
        if (selectedBlock) {
          const updatedBlock = data.find(b => b.id === selectedBlock.id);
          setSelectedBlock(updatedBlock || null);
          if (selectedFlat && updatedBlock) {
            const updatedFlat = updatedBlock.flats?.find(f => f.id === selectedFlat.id);
            setSelectedFlat(updatedFlat || null);
          }
        }
      } else {
        const res = await api.get('/blocks/my-flat');
        const flat = res.data;
        if (flat) {
          setSelectedFlat(flat);
          setSelectedBlock(flat.block || null);
        }
      }
    } catch (err) {
      if (isAdmin) {
        toast.error('Failed to fetch society wings');
      } else {
        setFlatError(err.response?.data?.message || 'No flat is assigned to your profile yet.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  const handleCreateBlock = async (e) => {
    e.preventDefault();
    if (!newBlock.name || !newBlock.floorCount) {
      return toast.error('Please fill all fields');
    }
    try {
      setIsCreatingBlock(true);
      await api.post('/blocks', newBlock);
      toast.success('Wing created successfully');
      setIsAddBlockOpen(false);
      setNewBlock({ name: '', floorCount: '' });
      fetchBlocks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create wing');
    } finally {
      setIsCreatingBlock(false);
    }
  };

  const handleUpdateBlock = async (e) => {
    e.preventDefault();
    if (!editBlock.name || !editBlock.floorCount) {
      return toast.error('Please fill all fields');
    }
    try {
      setIsEditingBlock(true);
      await api.put(`/blocks/${editBlock.id}`, { name: editBlock.name, floorCount: editBlock.floorCount });
      toast.success('Wing updated successfully');
      setIsEditBlockOpen(false);
      setEditBlock({ id: '', name: '', floorCount: '' });
      fetchBlocks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update wing');
    } finally {
      setIsEditingBlock(false);
    }
  };

  const handleDeleteBlock = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this Wing? All associated flats and residents will also be removed. This cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/blocks/${id}`);
      toast.success('Wing deleted successfully');
      fetchBlocks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete wing');
    }
  };

  const handleCreateFlat = async (e) => {
    e.preventDefault();
    if (!newFlat.flatNumber || !newFlat.squareFeet) {
      return toast.error('Please fill all fields');
    }
    try {
      setIsCreatingFlat(true);
      await api.post(`/blocks/${selectedBlock.id}/flats`, newFlat);
      toast.success('Flat added successfully');
      setIsAddFlatOpen(false);
      setNewFlat({ flatNumber: '', type: '2BHK', squareFeet: '' });
      fetchBlocks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add flat');
    } finally {
      setIsCreatingFlat(false);
    }
  };

  const handleAddFamily = async (e) => {
    e.preventDefault();
    if (!newFamily.fullName || !newFamily.age) {
      return toast.error('Please fill all fields');
    }
    try {
      setIsAddingFamily(true);
      await api.post(`/blocks/flats/${selectedFlat.id}/family`, newFamily);
      toast.success('Family member added successfully');
      setIsAddFamilyOpen(false);
      setNewFamily({ fullName: '', relation: 'Spouse', age: '' });
      fetchBlocks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add family member');
    } finally {
      setIsAddingFamily(false);
    }
  };

  const handleDeleteFamily = async (id) => {
    try {
      await api.delete(`/blocks/family/${id}`);
      toast.success('Family member removed');
      fetchBlocks();
    } catch (err) {
      toast.error('Failed to remove family member');
    }
  };

  const handleAssignLeader = async (e) => {
    e.preventDefault();
    if (!newLeader.fullName || !newLeader.email || !newLeader.password) {
      return toast.error('Please fill all required fields');
    }
    try {
      setIsAssigningLeader(true);
      await api.post(`/blocks/flats/${selectedFlat.id}/resident`, newLeader);
      toast.success('Flat leader assigned successfully!');
      setIsAssignLeaderOpen(false);
      setNewLeader({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        moveInDate: new Date().toISOString().split('T')[0],
        isOwner: true
      });
      fetchBlocks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign flat leader');
    } finally {
      setIsAssigningLeader(false);
    }
  };

  const handleRemoveLeader = async (residentId) => {
    if (!window.confirm('Are you sure you want to remove the Flat Leader? This will delete their user account and portal access.')) {
      return;
    }
    try {
      await api.delete(`/blocks/flats/${selectedFlat.id}/resident/${residentId}`);
      toast.success('Flat leader removed successfully');
      fetchBlocks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove flat leader');
    }
  };

  if (loading && !selectedFlat) {
    return <div className="p-8 text-center text-slate-500">Loading Flat details...</div>;
  }

  if (flatError) {
    return (
      <div className="p-8 text-center bg-white border border-slate-100 shadow-sm rounded-2xl max-w-md mx-auto my-12 space-y-4">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">No Flat Assigned</h3>
        <p className="text-sm text-slate-500">{flatError}</p>
      </div>
    );
  }

  // LEVEL 1: Wings / Blocks List View (Admin only)
  if (isAdmin && !selectedBlock) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Society Wings</h2>
            <p className="text-slate-500 mt-1">Manage blocks, flats, and residents</p>
          </div>
          <Button onClick={() => setIsAddBlockOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-100 transition-all py-6 px-5 font-semibold">
            <Plus className="w-5 h-5" /> Add Wing
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blocks.map((block) => (
            <Card 
              key={block.id} 
              className="border-none shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 bg-white hover:-translate-y-1 rounded-2xl overflow-hidden"
              onClick={() => setSelectedBlock(block)}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Building2 className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-slate-800">{block.name}</CardTitle>
                  <CardDescription className="text-slate-400 mt-0.5">{block.floorCount} Floors</CardDescription>
                </div>
                {isAdmin && (
                  <div className="flex flex-col gap-1 items-end z-10">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditBlock({ id: block.id, name: block.name, floorCount: block.floorCount });
                        setIsEditBlockOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0"
                      onClick={(e) => handleDeleteBlock(block.id, e)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-2 pb-5 border-t border-slate-50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Total Registered Flats</span>
                  <span className="font-bold text-slate-800 text-lg bg-slate-50 px-3 py-1 rounded-lg">
                    {block.flats?.length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {blocks.length === 0 && (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50 text-slate-400">
              No Wings found. Click 'Add Wing' to create one.
            </div>
          )}
        </div>

        {/* Add Block Modal */}
        <Dialog open={isAddBlockOpen} onOpenChange={setIsAddBlockOpen}>
          <DialogContent className="rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800">Add New Wing / Block</DialogTitle>
              <DialogDescription>Setup a new block in the society to assign flats.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBlock} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="blockName" className="text-sm font-semibold text-slate-700">Wing Name (e.g. Block A, Wing B)</Label>
                <Input 
                  id="blockName" 
                  value={newBlock.name} 
                  onChange={(e) => setNewBlock({ ...newBlock, name: e.target.value })} 
                  placeholder="Block A"
                  className="rounded-xl border-slate-200 focus-visible:ring-blue-100 focus-visible:border-blue-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floorCount" className="text-sm font-semibold text-slate-700">Total Floors</Label>
                <Input 
                  id="floorCount" 
                  type="number"
                  value={newBlock.floorCount} 
                  onChange={(e) => setNewBlock({ ...newBlock, floorCount: e.target.value })} 
                  placeholder="10"
                  className="rounded-xl border-slate-200 focus-visible:ring-blue-100 focus-visible:border-blue-400"
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => setIsAddBlockOpen(false)} disabled={isCreatingBlock}>Cancel</Button>
                <Button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white" disabled={isCreatingBlock}>
                  {isCreatingBlock ? 'Creating...' : 'Create Wing'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Block Modal */}
        <Dialog open={isEditBlockOpen} onOpenChange={setIsEditBlockOpen}>
          <DialogContent className="rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800">Edit Wing / Block</DialogTitle>
              <DialogDescription>Update block details.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateBlock} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="editBlockName" className="text-sm font-semibold text-slate-700">Wing Name</Label>
                <Input 
                  id="editBlockName" 
                  value={editBlock.name} 
                  onChange={(e) => setEditBlock({ ...editBlock, name: e.target.value })} 
                  placeholder="Block A"
                  className="rounded-xl border-slate-200 focus-visible:ring-blue-100 focus-visible:border-blue-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editFloorCount" className="text-sm font-semibold text-slate-700">Total Floors</Label>
                <Input 
                  id="editFloorCount" 
                  type="number"
                  value={editBlock.floorCount} 
                  onChange={(e) => setEditBlock({ ...editBlock, floorCount: e.target.value })} 
                  placeholder="10"
                  className="rounded-xl border-slate-200 focus-visible:ring-blue-100 focus-visible:border-blue-400"
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => setIsEditBlockOpen(false)} disabled={isEditingBlock}>Cancel</Button>
                <Button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white" disabled={isEditingBlock}>
                  {isEditingBlock ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // LEVEL 2: Flats Grid View within selected Block (Admin only)
  if (isAdmin && selectedBlock && !selectedFlat) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="hover:bg-slate-100 rounded-xl px-4 py-2" onClick={() => setSelectedBlock(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Wings
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{selectedBlock.name} - Flats</h2>
            <p className="text-slate-500 mt-1">Manage flats under this wing</p>
          </div>
          <Button onClick={() => setIsAddFlatOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-100 py-6 px-5 font-semibold">
            <Plus className="w-4 h-4" /> Add Flat
          </Button>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {selectedBlock.flats?.map((flat) => {
            const hasLeader = flat.residents && flat.residents.length > 0;
            return (
              <Card 
                key={flat.id} 
                className="border-none shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all rounded-2xl overflow-hidden bg-white group"
                onClick={() => setSelectedFlat(flat)}
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex justify-between items-start">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${hasLeader ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                      <Home className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 border-none font-semibold px-2 py-0.5">{flat.type}</Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-800 mt-3 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                    Flat {flat.flatNumber}
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <p className="text-xs text-slate-400">
                    {flat.squareFeet ? `${flat.squareFeet} Sqft` : 'N/A sqft'}
                  </p>
                  <div className="mt-4 flex flex-col gap-1.5 border-t border-slate-50 pt-3">
                    <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1.5">
                      <UserCheck2 className="w-3.5 h-3.5 text-slate-400" />
                      {hasLeader ? (
                        <span className="text-emerald-600 font-semibold">{flat.residents[0].fullName}</span>
                      ) : (
                        <span className="text-slate-400 italic">No Leader assigned</span>
                      )}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {flat.familyMembers?.length || 0} family members
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {selectedBlock.flats?.length === 0 && (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50 text-slate-400">
              No flats found in this Wing. Click 'Add Flat' to create one.
            </div>
          )}
        </div>

        {/* Add Flat Modal */}
        <Dialog open={isAddFlatOpen} onOpenChange={setIsAddFlatOpen}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Add Flat to {selectedBlock.name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateFlat} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="flatNumber">Flat Number (e.g. A-101, A-202)</Label>
                <Input 
                  id="flatNumber" 
                  value={newFlat.flatNumber} 
                  onChange={(e) => setNewFlat({ ...newFlat, flatNumber: e.target.value })} 
                  placeholder="A-101"
                  className="rounded-xl border-slate-200 focus-visible:ring-blue-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flatType">Flat Type</Label>
                <Select 
                  value={newFlat.type} 
                  onValueChange={(val) => setNewFlat({ ...newFlat, type: val })}
                >
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1BHK">1 BHK</SelectItem>
                    <SelectItem value="2BHK">2 BHK</SelectItem>
                    <SelectItem value="3BHK">3 BHK</SelectItem>
                    <SelectItem value="4BHK">4 BHK</SelectItem>
                    <SelectItem value="Penthouse">Penthouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="squareFeet">Square Feet</Label>
                <Input 
                  id="squareFeet" 
                  type="number"
                  value={newFlat.squareFeet} 
                  onChange={(e) => setNewFlat({ ...newFlat, squareFeet: e.target.value })} 
                  placeholder="1200"
                  className="rounded-xl border-slate-200 focus-visible:ring-blue-100"
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => setIsAddFlatOpen(false)} disabled={isCreatingFlat}>Cancel</Button>
                <Button type="submit" className="rounded-xl bg-blue-600 text-white" disabled={isCreatingFlat}>
                  {isCreatingFlat ? 'Creating...' : 'Create Flat'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // LEVEL 3: Dedicated Flat Details Page (Shown directly for non-admins)
  return (
    <div className="space-y-6">
      {isAdmin && (
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="hover:bg-slate-100 rounded-xl px-4 py-2" onClick={() => setSelectedFlat(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Flats
          </Button>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Flat {selectedFlat.flatNumber}</h2>
            <Badge className="bg-blue-100 text-blue-800 border-none hover:bg-blue-100 rounded-lg px-2.5 py-1 font-semibold">{selectedFlat.type}</Badge>
          </div>
          <p className="text-slate-500 mt-1">Detailed flat resident and family members setup for Wing: <strong className="text-slate-700">{selectedBlock?.name || 'N/A'}</strong></p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Flat & Leader Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* General Specs */}
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Info className="w-4.5 h-4.5 text-slate-400" /> Flat Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Area size</span>
                  <span className="text-sm font-bold text-slate-700">{selectedFlat.squareFeet || 'N/A'} Sqft</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">BHK configuration</span>
                  <span className="text-sm font-bold text-slate-700">{selectedFlat.type}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flat Leader Info */}
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-4.5 h-4.5 text-slate-400" /> Flat Leader (Resident Access)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedFlat.residents && selectedFlat.residents.length > 0 ? (
                (() => {
                  const leader = selectedFlat.residents[0];
                  return (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-base font-bold text-slate-800">{leader.fullName}</p>
                          <Badge className={`mt-1 border-none font-semibold ${leader.isOwner ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}>
                            {leader.isOwner ? 'Owner' : 'Tenant'}
                          </Badge>
                        </div>
                        {isAdmin && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                            onClick={() => handleRemoveLeader(leader.id)}
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2.5 text-sm text-slate-600 pl-1">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span>{leader.user?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{leader.user?.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CalendarDays className="w-4 h-4 text-slate-400" />
                          <span>Moved in: {new Date(leader.moveInDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="p-5 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 bg-white space-y-3">
                  <p className="text-xs">No resident account has been assigned to this flat yet.</p>
                  {isAdmin && (
                    <Button 
                      size="sm" 
                      onClick={() => setIsAssignLeaderOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 mx-auto"
                    >
                      <UserPlus className="w-4 h-4" /> Assign Flat Leader
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Family Members Registry */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Family Registry</CardTitle>
                <CardDescription>Members currently staying in this flat</CardDescription>
              </div>
              {isAdmin && (
                <Button 
                  size="sm" 
                  onClick={() => setIsAddFamilyOpen(true)} 
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 py-4 px-3.5 h-auto shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Family Member
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-600 text-xs px-6 py-4">Name</TableHead>
                      <TableHead className="font-semibold text-slate-600 text-xs px-6 py-4">Relation to Leader</TableHead>
                      <TableHead className="font-semibold text-slate-600 text-xs px-6 py-4">Age</TableHead>
                      {isAdmin && <TableHead className="text-right font-semibold text-slate-600 text-xs px-6 py-4">Action</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedFlat.familyMembers?.map((member) => (
                      <TableRow key={member.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium text-slate-850 text-sm px-6 py-4">{member.fullName}</TableCell>
                        <TableCell className="text-slate-600 text-sm px-6 py-4">
                          <Badge variant="outline" className="border-slate-200 text-slate-600 font-normal px-2.5 py-0.5 bg-slate-50">
                            {member.relation}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm px-6 py-4">{member.age} yrs</TableCell>
                        {isAdmin && (
                          <TableCell className="text-right px-6 py-4">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                              onClick={() => handleDeleteFamily(member.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    {(!selectedFlat.familyMembers || selectedFlat.familyMembers.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 4 : 3} className="text-center py-10 text-slate-400 text-xs font-medium">
                          No family members registered yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Family Member Modal */}
      <Dialog open={isAddFamilyOpen} onOpenChange={setIsAddFamilyOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add Family Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddFamily} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                value={newFamily.fullName} 
                onChange={(e) => setNewFamily({ ...newFamily, fullName: e.target.value })} 
                placeholder="Jane Doe"
                className="rounded-xl border-slate-200 focus-visible:ring-blue-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relation">Relation to Family Leader</Label>
              <Select 
                value={newFamily.relation} 
                onValueChange={(val) => setNewFamily({ ...newFamily, relation: val })}
              >
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="Select relation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Spouse">Spouse</SelectItem>
                  <SelectItem value="Child">Child</SelectItem>
                  <SelectItem value="Parent">Parent</SelectItem>
                  <SelectItem value="Sibling">Sibling</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input 
                id="age" 
                type="number"
                value={newFamily.age} 
                onChange={(e) => setNewFamily({ ...newFamily, age: e.target.value })} 
                placeholder="25"
                className="rounded-xl border-slate-200 focus-visible:ring-blue-100"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setIsAddFamilyOpen(false)} disabled={isAddingFamily}>Cancel</Button>
              <Button type="submit" className="rounded-xl bg-blue-600 text-white" disabled={isAddingFamily}>
                {isAddingFamily ? 'Adding...' : 'Add Member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Flat Leader Modal */}
      <Dialog open={isAssignLeaderOpen} onOpenChange={setIsAssignLeaderOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Assign Flat Leader</DialogTitle>
            <DialogDescription>
              Create a resident user account. This will grant them login access to the portal by default.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignLeader} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="resName">Full Name</Label>
              <Input 
                id="resName" 
                value={newLeader.fullName} 
                onChange={(e) => setNewLeader({ ...newLeader, fullName: e.target.value })} 
                placeholder="John Doe"
                className="rounded-xl border-slate-200 focus-visible:ring-blue-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resEmail">Email Address</Label>
                <Input 
                  id="resEmail" 
                  type="email"
                  value={newLeader.email} 
                  onChange={(e) => setNewLeader({ ...newLeader, email: e.target.value })} 
                  placeholder="john@society.com"
                  className="rounded-xl border-slate-200 focus-visible:ring-blue-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resPass">Password</Label>
                <Input 
                  id="resPass" 
                  type="password"
                  value={newLeader.password} 
                  onChange={(e) => setNewLeader({ ...newLeader, password: e.target.value })} 
                  placeholder="********"
                  className="rounded-xl border-slate-200 focus-visible:ring-blue-100"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resPhone">Phone Number</Label>
              <Input 
                id="resPhone" 
                value={newLeader.phone} 
                onChange={(e) => setNewLeader({ ...newLeader, phone: e.target.value })} 
                placeholder="9876543210"
                className="rounded-xl border-slate-200 focus-visible:ring-blue-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="moveIn">Move-in Date</Label>
                <Input 
                  id="moveIn" 
                  type="date"
                  value={newLeader.moveInDate} 
                  onChange={(e) => setNewLeader({ ...newLeader, moveInDate: e.target.value })} 
                  className="rounded-xl border-slate-200 focus-visible:ring-blue-100"
                />
              </div>
              <div className="flex items-center gap-2.5 pt-8 pl-2">
                <Checkbox 
                  id="isOwner" 
                  checked={newLeader.isOwner}
                  onCheckedChange={(checked) => setNewLeader({ ...newLeader, isOwner: !!checked })}
                  className="rounded border-slate-300"
                />
                <Label htmlFor="isOwner" className="text-sm font-semibold text-slate-700 cursor-pointer">
                  Is Owner
                </Label>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setIsAssignLeaderOpen(false)} disabled={isAssigningLeader}>Cancel</Button>
              <Button type="submit" className="rounded-xl bg-blue-600 text-white" disabled={isAssigningLeader}>
                {isAssigningLeader ? 'Assigning...' : 'Assign Leader'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
