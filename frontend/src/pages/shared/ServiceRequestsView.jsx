import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  PlusCircle, Wrench, MoreVertical, CalendarClock, User,
  CheckCircle2, Clock, AlertCircle, Image as ImageIcon, ZoomIn, X,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ServiceRequestForm from './ServiceRequestForm';
import { motion, AnimatePresence } from 'framer-motion';
import { ListSkeleton } from '@/components/ui/LoadingSkeletons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const API_BASE = 'http://localhost:5000';

function ImageModal({ src, alt, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-10 w-10 h-10 rounded-full bg-white text-slate-700 hover:text-rose-600 shadow-xl flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <img
          src={src}
          alt={alt}
          className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
        />
        {alt && <p className="text-white/70 text-sm text-center mt-3 font-medium">{alt}</p>}
      </div>
    </div>
  );
}

export default function ServiceRequestsView() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  const isResident = user?.role === 'resident';
  const canManage = user?.role === 'admin' || user?.role === 'committee_member';

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/service-requests');
      setRequests(res.data?.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch service requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/service-requests/${id}/status`, { status: newStatus });
      toast.success('Status updated successfully');
      fetchRequests();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none font-bold shadow-sm px-2.5 py-1">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none font-bold shadow-sm px-2.5 py-1">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-none font-bold shadow-sm px-2.5 py-1">Rejected</Badge>;
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-bold shadow-sm px-2.5 py-1">Completed</Badge>;
      default:
        return <Badge variant="outline" className="font-bold shadow-sm px-2.5 py-1 capitalize">{status.replace('_', ' ')}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'approved': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'rejected': return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return null;
    }
  };

  const getImageSrc = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_BASE}${imageUrl}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Lightbox */}
      {lightboxImg && (
        <ImageModal
          src={lightboxImg.src}
          alt={lightboxImg.alt}
          onClose={() => setLightboxImg(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 shadow-sm border border-orange-100/50">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Service Requests</h2>
            <p className="text-sm text-slate-500 font-medium">Manage maintenance and facility requests</p>
          </div>
        </div>
        {isResident && (
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-md shadow-orange-600/20 px-6 h-11 transition-all hover:-translate-y-0.5 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4 mr-2" /> New Request
          </Button>
        )}
      </div>

      {loading ? (
        <ListSkeleton rows={6} />
      ) : (
        <Card className="rounded-3xl border-0 shadow-lg shadow-slate-200/50 bg-white overflow-hidden">
          <CardContent className="p-0">
            {requests.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-center bg-slate-50/50">
                <Wrench className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No service requests</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">
                  {isResident
                    ? 'Need a repair? Create a new service request.'
                    : 'There are no pending service requests in the system.'}
                </p>
                {isResident && (
                  <Button
                    onClick={() => setIsFormOpen(true)}
                    className="mt-6 bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-md shadow-orange-600/20 px-6 h-11 transition-all"
                  >
                    Create Request
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-slate-600 h-14 pl-6">Service Type</TableHead>
                      {canManage && <TableHead className="font-semibold text-slate-600 h-14">Resident</TableHead>}
                      <TableHead className="font-semibold text-slate-600 h-14">Preferred Schedule</TableHead>
                      <TableHead className="font-semibold text-slate-600 h-14">Notes</TableHead>
                      <TableHead className="font-semibold text-slate-600 h-14">Photo</TableHead>
                      <TableHead className="font-semibold text-slate-600 h-14">Status</TableHead>
                      {canManage && <TableHead className="font-semibold text-slate-600 h-14 text-right pr-6">Action</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-50">
                    <AnimatePresence>
                      {requests.map((item, index) => {
                        const imgSrc = getImageSrc(item.imageUrl);
                        return (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group hover:bg-slate-50/80 transition-colors"
                          >
                            <TableCell className="pl-6 py-4">
                              <div className="font-bold text-slate-800 text-sm group-hover:text-orange-600 transition-colors capitalize">
                                {item.serviceType}
                              </div>
                            </TableCell>

                            {canManage && (
                              <TableCell className="py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200">
                                    <User className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-800 text-sm">{item.resident?.profile?.fullName || 'Unknown'}</div>
                                    <div className="text-xs font-semibold text-slate-500 mt-0.5">
                                      {item.resident?.profile?.flat
                                        ? `Flat ${item.resident.profile.flat.block}-${item.resident.profile.flat.flatNumber}`
                                        : 'No Flat'}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            )}

                            <TableCell className="py-4">
                              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <CalendarClock className="w-4 h-4 text-slate-400" />
                                {item.preferredDate ? format(new Date(item.preferredDate), 'MMM d, yyyy h:mm a') : 'N/A'}
                              </div>
                            </TableCell>

                            <TableCell className="py-4">
                              <p className="max-w-[180px] truncate text-sm font-medium text-slate-500">
                                {item.notes || '-'}
                              </p>
                            </TableCell>

                            {/* Image Thumbnail */}
                            <TableCell className="py-4">
                              {imgSrc ? (
                                <button
                                  type="button"
                                  onClick={() => setLightboxImg({ src: imgSrc, alt: item.serviceType })}
                                  className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:scale-105 transition-all group/img"
                                >
                                  <img
                                    src={imgSrc}
                                    alt={item.serviceType}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-all flex items-center justify-center">
                                    <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                  </div>
                                </button>
                              ) : (
                                <div className="w-14 h-14 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
                                  <ImageIcon className="w-4 h-4 text-slate-300" />
                                </div>
                              )}
                            </TableCell>

                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(item.status)}
                                {getStatusBadge(item.status)}
                              </div>
                            </TableCell>

                            {canManage && (
                              <TableCell className="text-right pr-6 py-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200/50 focus-visible:ring-0">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl shadow-slate-200/50 border-slate-100">
                                    <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Change Status</div>
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'pending')} className="cursor-pointer font-medium text-amber-600 hover:bg-amber-50 hover:text-amber-700 rounded-lg mx-1">
                                      Mark as Pending
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'approved')} className="cursor-pointer font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg mx-1">
                                      Approve Request
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'rejected')} className="cursor-pointer font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg mx-1">
                                      Reject Request
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'completed')} className="cursor-pointer font-medium text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg mx-1">
                                      Mark as Completed
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            )}
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ServiceRequestForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={fetchRequests}
      />
    </div>
  );
}
