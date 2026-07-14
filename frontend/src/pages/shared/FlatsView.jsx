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
  UserPlus, Info, Shield, Mail, Phone, CalendarDays, Key, UserCheck2, ArrowUpRight, Edit, User, AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { GridSkeleton } from '@/components/ui/LoadingSkeletons';

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
        const flat = res.data?.data || res.data;
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

  if (loading && !selectedFlat && !selectedBlock && isAdmin) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm border border-indigo-100/50">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Society Wings</h2>
              <p className="text-sm text-slate-500 font-medium">Manage blocks, flats, and residents</p>
            </div>
          </div>
          <Button disabled className="bg-indigo-600 text-white rounded-xl shadow-md px-6 h-11 opacity-70">
            <Plus className="w-4 h-4 mr-2" /> Add Wing
          </Button>
        </div>
        <GridSkeleton count={3} />
      </div>
    );
  }

  if (flatError) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="p-8 text-center bg-white border border-slate-100 shadow-sm rounded-3xl max-w-md mx-auto my-12 space-y-4"
      >
        <Building2 className="w-14 h-14 text-slate-300 mx-auto" />
        <h3 className="text-xl font-bold text-slate-800">No Flat Assigned</h3>
        <p className="text-sm text-slate-500">{flatError}</p>
      </motion.div>
    );
  }

  // LEVEL 1: Wings / Blocks List View (Admin only)
  if (isAdmin && !selectedBlock) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm border border-indigo-100/50">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Society Wings</h2>
              <p className="text-sm text-slate-500 font-medium">Manage blocks, flats, and residents</p>
            </div>
          </div>
          <Button onClick={() => setIsAddBlockOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 px-6 h-11 transition-all hover:-translate-y-0.5">
            <Plus className="w-4 h-4 mr-2" /> Add Wing
          </Button>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {blocks.map((block, index) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="border-0 shadow-sm cursor-pointer hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 bg-white hover:-translate-y-1.5 rounded-3xl overflow-hidden group"
                  onClick={() => setSelectedBlock(block)}
                >
                  <CardHeader className="flex flex-row items-center gap-4 pb-4 pt-6 px-6">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50/80 group-hover:bg-indigo-600 flex items-center justify-center text-indigo-600 group-hover:text-white shrink-0 transition-colors duration-300">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{block.name}</CardTitle>
                      <CardDescription className="text-slate-400 mt-0.5 font-medium">{block.floorCount} Floors</CardDescription>
                    </div>
                    <div className="flex flex-col gap-1 items-end z-10">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg shrink-0 transition-colors"
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
                        className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0 transition-colors"
                        onClick={(e) => handleDeleteBlock(block.id, e)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 pb-6 px-6 border-t border-slate-50 mt-2 bg-slate-50/30">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-semibold flex items-center gap-2">
                        <Home className="w-4 h-4" /> Registered Flats
                      </span>
                      <span className="font-bold text-slate-800 text-lg bg-white px-3 py-1 rounded-xl shadow-sm border border-slate-100">
                        {block.flats?.length || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {blocks.length === 0 && !loading && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <Building2 className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-500">No Wings found.</p>
              <p className="text-sm text-slate-400 mt-1">Click 'Add Wing' to create one.</p>
            </div>
          )}
        </div>

        {/* Add Block Modal */}
        <Dialog open={isAddBlockOpen} onOpenChange={setIsAddBlockOpen}>
          <DialogContent className="rounded-3xl max-w-md p-6">
            <DialogHeader className="mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Plus className="w-6 h-6" />
              </div>
              <DialogTitle className="text-xl font-bold text-slate-800">Add New Wing</DialogTitle>
              <DialogDescription className="text-slate-500">Setup a new block in the society to assign flats.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="blockName" className="text-sm font-bold text-slate-700">Wing Name</Label>
                <Input 
                  id="blockName" 
                  value={newBlock.name} 
                  onChange={(e) => setNewBlock({ ...newBlock, name: e.target.value })} 
                  placeholder="e.g. Block A, Wing B"
                  className="rounded-xl border-slate-200 focus-visible:ring-indigo-500 bg-slate-50 h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floorCount" className="text-sm font-bold text-slate-700">Total Floors</Label>
                <Input 
                  id="floorCount" 
                  type="number"
                  value={newBlock.floorCount} 
                  onChange={(e) => setNewBlock({ ...newBlock, floorCount: e.target.value })} 
                  placeholder="e.g. 10"
                  className="rounded-xl border-slate-200 focus-visible:ring-indigo-500 bg-slate-50 h-11"
                />
              </div>
              <DialogFooter className="pt-6">
                <Button type="button" variant="ghost" className="rounded-xl hover:bg-slate-100" onClick={() => setIsAddBlockOpen(false)} disabled={isCreatingBlock}>Cancel</Button>
                <Button type="submit" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-8" disabled={isCreatingBlock}>
                  {isCreatingBlock ? 'Creating...' : 'Create Wing'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Block Modal */}
        <Dialog open={isEditBlockOpen} onOpenChange={setIsEditBlockOpen}>
          <DialogContent className="rounded-3xl max-w-md p-6">
            <DialogHeader className="mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Edit className="w-6 h-6" />
              </div>
              <DialogTitle className="text-xl font-bold text-slate-800">Edit Wing</DialogTitle>
              <DialogDescription className="text-slate-500">Update block details.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateBlock} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editBlockName" className="text-sm font-bold text-slate-700">Wing Name</Label>
                <Input 
                  id="editBlockName" 
                  value={editBlock.name} 
                  onChange={(e) => setEditBlock({ ...editBlock, name: e.target.value })} 
                  className="rounded-xl border-slate-200 focus-visible:ring-blue-500 bg-slate-50 h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editFloorCount" className="text-sm font-bold text-slate-700">Total Floors</Label>
                <Input 
                  id="editFloorCount" 
                  type="number"
                  value={editBlock.floorCount} 
                  onChange={(e) => setEditBlock({ ...editBlock, floorCount: e.target.value })} 
                  className="rounded-xl border-slate-200 focus-visible:ring-blue-500 bg-slate-50 h-11"
                />
              </div>
              <DialogFooter className="pt-6">
                <Button type="button" variant="ghost" className="rounded-xl hover:bg-slate-100" onClick={() => setIsEditBlockOpen(false)} disabled={isEditingBlock}>Cancel</Button>
                <Button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-8" disabled={isEditingBlock}>
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
      <div className="space-y-6 pb-12">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="hover:bg-slate-100 rounded-xl px-4 py-2 font-semibold text-slate-500" onClick={() => setSelectedBlock(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Wings
          </Button>
        </motion.div>

        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{selectedBlock.name} Flats</h2>
              <p className="text-sm text-slate-500 font-medium mt-0.5">Manage flats under this wing</p>
            </div>
          </div>
          <Button onClick={() => setIsAddFlatOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 px-6 h-11 transition-all hover:-translate-y-0.5">
            <Plus className="w-4 h-4 mr-2" /> Add Flat
          </Button>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {selectedBlock.flats?.map((flat, index) => {
              const hasLeader = flat.residents && flat.residents.length > 0;
              return (
                <motion.div
                  key={flat.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className="border-0 shadow-sm shadow-slate-200/50 cursor-pointer hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all duration-300 rounded-3xl overflow-hidden bg-white group"
                    onClick={() => setSelectedFlat(flat)}
                  >
                    <CardHeader className="p-6 pb-4">
                      <div className="flex justify-between items-start">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-300 ${hasLeader ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'}`}>
                          <Home className="w-6 h-6" />
                        </div>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none font-bold px-3 py-1 shadow-sm rounded-lg">
                          {flat.type}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-bold text-slate-800 mt-4 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                        Flat {flat.flatNumber}
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <p className="text-sm font-medium text-slate-400 flex items-center gap-2">
                        {flat.squareFeet ? `${flat.squareFeet} Sqft Area` : 'Area not specified'}
                      </p>
                      <div className="mt-5 flex flex-col gap-2.5 bg-slate-50/80 p-4 rounded-2xl border border-slate-100/50">
                        <div className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                          <UserCheck2 className="w-4 h-4 text-slate-400" />
                          {hasLeader ? (
                            <span className="text-emerald-700 truncate">{flat.residents[0].fullName}</span>
                          ) : (
                            <span className="text-slate-400 italic">No Leader assigned</span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          {flat.familyMembers?.length || 0} family members
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {selectedBlock.flats?.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <Home className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-500">No flats found in this Wing.</p>
              <p className="text-sm text-slate-400 mt-1">Click 'Add Flat' to create one.</p>
            </div>
          )}
        </div>

        {/* Add Flat Modal */}
        <Dialog open={isAddFlatOpen} onOpenChange={setIsAddFlatOpen}>
          <DialogContent className="rounded-3xl max-w-md p-6">
            <DialogHeader className="mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Home className="w-6 h-6" />
              </div>
              <DialogTitle className="text-xl font-bold text-slate-800">Add Flat to {selectedBlock.name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateFlat} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="flatNumber" className="text-sm font-bold text-slate-700">Flat Number</Label>
                <Input 
                  id="flatNumber" 
                  value={newFlat.flatNumber} 
                  onChange={(e) => setNewFlat({ ...newFlat, flatNumber: e.target.value })} 
                  placeholder="e.g. A-101"
                  className="rounded-xl border-slate-200 focus-visible:ring-blue-500 bg-slate-50 h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flatType" className="text-sm font-bold text-slate-700">Flat Type</Label>
                <Select 
                  value={newFlat.type} 
                  onValueChange={(val) => setNewFlat({ ...newFlat, type: val })}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-11 focus:ring-blue-500">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="1BHK">1 BHK</SelectItem>
                    <SelectItem value="2BHK">2 BHK</SelectItem>
                    <SelectItem value="3BHK">3 BHK</SelectItem>
                    <SelectItem value="4BHK">4 BHK</SelectItem>
                    <SelectItem value="Penthouse">Penthouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="squareFeet" className="text-sm font-bold text-slate-700">Square Feet Area</Label>
                <Input 
                  id="squareFeet" 
                  type="number"
                  value={newFlat.squareFeet} 
                  onChange={(e) => setNewFlat({ ...newFlat, squareFeet: e.target.value })} 
                  placeholder="e.g. 1200"
                  className="rounded-xl border-slate-200 focus-visible:ring-blue-500 bg-slate-50 h-11"
                />
              </div>
              <DialogFooter className="pt-6">
                <Button type="button" variant="ghost" className="rounded-xl hover:bg-slate-100" onClick={() => setIsAddFlatOpen(false)} disabled={isCreatingFlat}>Cancel</Button>
                <Button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-8" disabled={isCreatingFlat}>
                  {isCreatingFlat ? 'Creating...' : 'Create Flat'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // LEVEL 3: Dedicated Flat Details Page (Shown directly for non-admins, and on click for admins)
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
      {isAdmin && (
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="hover:bg-slate-100 rounded-xl px-4 py-2 font-semibold text-slate-500" onClick={() => setSelectedFlat(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Flats
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Home className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Flat {selectedFlat.flatNumber}</h2>
              <Badge className="bg-indigo-100 text-indigo-700 border-none hover:bg-indigo-200 rounded-lg px-3 py-1 font-bold shadow-sm">{selectedFlat.type}</Badge>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Wing: <span className="text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded-md ml-1">{selectedBlock?.name || 'N/A'}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Flat & Leader Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* General Specs */}
          <Card className="border-0 shadow-sm shadow-slate-200/50 bg-white rounded-3xl overflow-hidden">
            <CardHeader className="pb-4 bg-slate-50/50 border-b border-slate-100/60">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" /> Flat Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs text-slate-500 block font-semibold mb-1 uppercase tracking-wider">Area size</span>
                  <span className="text-lg font-bold text-slate-800">{selectedFlat.squareFeet || 'N/A'} <span className="text-sm text-slate-500 font-medium">Sqft</span></span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs text-slate-500 block font-semibold mb-1 uppercase tracking-wider">Config</span>
                  <span className="text-lg font-bold text-slate-800">{selectedFlat.type}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flat Leader Info */}
          <Card className="border-0 shadow-sm shadow-slate-200/50 bg-white rounded-3xl overflow-hidden">
            <CardHeader className="pb-4 bg-emerald-50/30 border-b border-emerald-100/50">
              <CardTitle className="text-base font-bold text-emerald-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" /> Primary Resident (Leader)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {selectedFlat.residents && selectedFlat.residents.length > 0 ? (
                (() => {
                  const leader = selectedFlat.residents[0];
                  return (
                    <div className="space-y-5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-200 to-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200 text-emerald-700 font-bold text-lg shadow-sm">
                            {leader.fullName.substring(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-base font-bold text-slate-800">{leader.fullName}</p>
                            <Badge className={`mt-0.5 border-none font-bold shadow-sm ${leader.isOwner ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                              {leader.isOwner ? 'Owner' : 'Tenant'}
                            </Badge>
                          </div>
                        </div>
                        {isAdmin && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            onClick={() => handleRemoveLeader(leader.id)}
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-medium text-slate-600">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                            <Mail className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="truncate">{leader.user?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                            <Phone className="w-4 h-4 text-slate-400" />
                          </div>
                          <span>{leader.user?.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                            <CalendarDays className="w-4 h-4 text-slate-400" />
                          </div>
                          <span>Moved in: <span className="font-bold text-slate-700">{new Date(leader.moveInDate).toLocaleDateString()}</span></span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 bg-slate-50/50 flex flex-col items-center justify-center gap-3">
                  <UserPlus className="w-10 h-10 text-slate-300 opacity-50" />
                  <p className="text-sm font-medium">No primary resident assigned yet.</p>
                  {isAdmin && (
                    <Button 
                      onClick={() => setIsAssignLeaderOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 px-6 mt-2"
                    >
                      Assign Leader
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Family Members Registry */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm shadow-slate-200/50 bg-white rounded-3xl overflow-hidden h-full">
            <CardHeader className="pb-4 bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between px-6 pt-6">
              <div>
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" /> Family Registry
                </CardTitle>
                <CardDescription className="font-medium mt-1">Members currently staying in this flat</CardDescription>
              </div>
              {isAdmin && (
                <Button 
                  onClick={() => setIsAddFamilyOpen(true)} 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-600/20"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Member
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow className="hover:bg-transparent border-b-slate-100">
                      <TableHead className="font-semibold text-slate-600 h-12 pl-6">Name</TableHead>
                      <TableHead className="font-semibold text-slate-600 h-12">Relation</TableHead>
                      <TableHead className="font-semibold text-slate-600 h-12">Age</TableHead>
                      {isAdmin && <TableHead className="text-right font-semibold text-slate-600 h-12 pr-6">Action</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {selectedFlat.familyMembers?.map((member, index) => (
                        <motion.tr 
                          key={member.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-slate-50/80 border-b border-slate-50 transition-colors group"
                        >
                          <TableCell className="pl-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200">
                                <User className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-slate-800">{member.fullName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge variant="secondary" className="bg-white border border-slate-200 text-slate-600 font-bold px-3 py-1 shadow-sm">
                              {member.relation}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-600 font-medium py-4">
                            {member.age} yrs
                          </TableCell>
                          {isAdmin && (
                            <TableCell className="text-right pr-6 py-4">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                onClick={() => handleDeleteFamily(member.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          )}
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                    {(!selectedFlat.familyMembers || selectedFlat.familyMembers.length === 0) && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={isAdmin ? 4 : 3} className="text-center py-16 h-full">
                          <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                            <Users className="w-12 h-12 opacity-20" />
                            <p className="font-medium text-slate-500">No family members registered yet.</p>
                          </div>
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
        <DialogContent className="rounded-3xl p-6 max-w-md">
          <DialogHeader className="mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <UserPlus className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-800">Add Family Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddFamily} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-bold text-slate-700">Full Name</Label>
              <Input 
                id="fullName" 
                value={newFamily.fullName} 
                onChange={(e) => setNewFamily({ ...newFamily, fullName: e.target.value })} 
                placeholder="e.g. Jane Doe"
                className="rounded-xl border-slate-200 focus-visible:ring-blue-500 bg-slate-50 h-11"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="relation" className="text-sm font-bold text-slate-700">Relation</Label>
                <Select 
                  value={newFamily.relation} 
                  onValueChange={(val) => setNewFamily({ ...newFamily, relation: val })}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-11 focus:ring-blue-500">
                    <SelectValue placeholder="Select relation" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Spouse">Spouse</SelectItem>
                    <SelectItem value="Child">Child</SelectItem>
                    <SelectItem value="Parent">Parent</SelectItem>
                    <SelectItem value="Sibling">Sibling</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-bold text-slate-700">Age</Label>
                <Input 
                  id="age" 
                  type="number"
                  value={newFamily.age} 
                  onChange={(e) => setNewFamily({ ...newFamily, age: e.target.value })} 
                  placeholder="e.g. 25"
                  className="rounded-xl border-slate-200 focus-visible:ring-blue-500 bg-slate-50 h-11"
                />
              </div>
            </div>
            <DialogFooter className="pt-6">
              <Button type="button" variant="ghost" className="rounded-xl hover:bg-slate-100" onClick={() => setIsAddFamilyOpen(false)} disabled={isAddingFamily}>Cancel</Button>
              <Button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-8" disabled={isAddingFamily}>
                {isAddingFamily ? 'Adding...' : 'Add Member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Flat Leader Modal */}
      <Dialog open={isAssignLeaderOpen} onOpenChange={setIsAssignLeaderOpen}>
        <DialogContent className="rounded-3xl max-w-lg p-6">
          <DialogHeader className="mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-800">Assign Primary Resident</DialogTitle>
            <DialogDescription className="font-medium text-slate-500">
              Create a resident account to grant them login access to the portal.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignLeader} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resName" className="text-sm font-bold text-slate-700">Full Name</Label>
              <Input 
                id="resName" 
                value={newLeader.fullName} 
                onChange={(e) => setNewLeader({ ...newLeader, fullName: e.target.value })} 
                placeholder="e.g. John Doe"
                className="rounded-xl border-slate-200 focus-visible:ring-emerald-500 bg-slate-50 h-11"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resEmail" className="text-sm font-bold text-slate-700">Email Address</Label>
                <Input 
                  id="resEmail" 
                  type="email"
                  value={newLeader.email} 
                  onChange={(e) => setNewLeader({ ...newLeader, email: e.target.value })} 
                  placeholder="john@example.com"
                  className="rounded-xl border-slate-200 focus-visible:ring-emerald-500 bg-slate-50 h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resPass" className="text-sm font-bold text-slate-700">Password</Label>
                <Input 
                  id="resPass" 
                  type="password"
                  value={newLeader.password} 
                  onChange={(e) => setNewLeader({ ...newLeader, password: e.target.value })} 
                  placeholder="••••••••"
                  className="rounded-xl border-slate-200 focus-visible:ring-emerald-500 bg-slate-50 h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resPhone" className="text-sm font-bold text-slate-700">Phone Number</Label>
              <Input 
                id="resPhone" 
                value={newLeader.phone} 
                onChange={(e) => setNewLeader({ ...newLeader, phone: e.target.value })} 
                placeholder="e.g. 9876543210"
                className="rounded-xl border-slate-200 focus-visible:ring-emerald-500 bg-slate-50 h-11"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="space-y-2">
                <Label htmlFor="moveIn" className="text-sm font-bold text-slate-700">Move-in Date</Label>
                <Input 
                  id="moveIn" 
                  type="date"
                  value={newLeader.moveInDate} 
                  onChange={(e) => setNewLeader({ ...newLeader, moveInDate: e.target.value })} 
                  className="rounded-xl border-slate-200 focus-visible:ring-emerald-500 bg-slate-50 h-11"
                />
              </div>
              <div className="flex items-center gap-3 pt-6 px-2">
                <Checkbox 
                  id="isOwner" 
                  checked={newLeader.isOwner}
                  onCheckedChange={(checked) => setNewLeader({ ...newLeader, isOwner: !!checked })}
                  className="rounded-md border-slate-300 w-5 h-5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
                <Label htmlFor="isOwner" className="text-sm font-bold text-slate-700 cursor-pointer">
                  Is Owner
                </Label>
              </div>
            </div>
            <DialogFooter className="pt-6">
              <Button type="button" variant="ghost" className="rounded-xl hover:bg-slate-100" onClick={() => setIsAssignLeaderOpen(false)} disabled={isAssigningLeader}>Cancel</Button>
              <Button type="submit" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-8" disabled={isAssigningLeader}>
                {isAssigningLeader ? 'Assigning...' : 'Assign Leader'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
