import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Receipt, Trash2, CheckCircle, Clock, AlertTriangle, FileText, Banknote } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import GenerateBillForm from './GenerateBillForm';
import { motion, AnimatePresence } from 'framer-motion';
import { ListSkeleton } from '@/components/ui/LoadingSkeletons';

export default function BillingView() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await api.get('/billing');
      setBills(res.data?.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'unpaid': 
      case 'pending': 
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none font-bold shadow-sm px-2.5 py-1">Pending</Badge>;
      case 'paid': 
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-bold shadow-sm px-2.5 py-1">Paid</Badge>;
      case 'overdue': 
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-none font-bold shadow-sm px-2.5 py-1">Overdue</Badge>;
      case 'partially_paid': 
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none font-bold shadow-sm px-2.5 py-1">Partial</Badge>;
      default: 
        return <Badge variant="outline" className="font-bold shadow-sm px-2.5 py-1">{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'unpaid':
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      default:
        return null;
    }
  };

  const handlePayBill = async (billId) => {
    try {
      setLoading(true);
      await api.post(`/billing/${billId}/pay`, { paymentMode: 'upi' });
      toast.success('Payment successful!');
      fetchBills(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Payment failed');
      setLoading(false);
    }
  };

  const handleDeleteBill = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;
    try {
      setLoading(true);
      await api.delete(`/billing/${id}`);
      toast.success("Bill deleted successfully");
      fetchBills();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete bill");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 shadow-sm border border-teal-100/50">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Maintenance Billing</h2>
            <p className="text-sm text-slate-500 font-medium">
              {isAdmin ? "Manage society maintenance bills and tracking" : "View and pay your flat maintenance bills"}
            </p>
          </div>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsFormOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-600/20 px-6 h-11 transition-all hover:-translate-y-0.5 whitespace-nowrap">
            <Receipt className="w-4 h-4 mr-2" /> Generate Bulk Bills
          </Button>
        )}
      </div>

      {loading ? (
        <ListSkeleton rows={8} />
      ) : (
        <Card className="rounded-3xl border-0 shadow-lg shadow-slate-200/50 bg-white overflow-hidden">
          <CardContent className="p-0">
            {bills.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-center bg-slate-50/50">
                <FileText className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No bills found</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">
                  {isAdmin 
                    ? "Generate maintenance bills for society flats to get started." 
                    : "You do not have any maintenance bills yet."}
                </p>
                {isAdmin && (
                  <Button onClick={() => setIsFormOpen(true)} className="mt-6 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-600/20 px-6 h-11 transition-all">
                    Generate Bills Now
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-slate-600 h-14 pl-6">Bill Period</TableHead>
                      <TableHead className="font-semibold text-slate-600 h-14">Flat</TableHead>
                      <TableHead className="font-semibold text-slate-600 h-14">Resident</TableHead>
                      <TableHead className="font-semibold text-slate-600 h-14 text-right">Amount</TableHead>
                      <TableHead className="font-semibold text-slate-600 h-14">Status</TableHead>
                      <TableHead className="font-semibold text-slate-600 h-14">Due Date</TableHead>
                      <TableHead className="font-semibold text-slate-600 h-14 text-right pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-50">
                    <AnimatePresence>
                      {bills.map((item, index) => {
                        const rate = item.flat?.squareFeet && item.amount ? (Number(item.amount) / item.flat.squareFeet).toFixed(2) : null;
                        return (
                          <motion.tr 
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group hover:bg-slate-50/80 transition-colors"
                          >
                            <TableCell className="pl-6 py-4">
                              <div className="font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                                {format(new Date(item.billingYear, item.billingMonth - 1), 'MMMM yyyy')}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              {item.flat ? (
                                <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200/60 shadow-sm">
                                  {`${item.flat.blockName}-${item.flat.flatNumber}`}
                                </div>
                              ) : (
                                <span className="text-slate-400">N/A</span>
                              )}
                            </TableCell>
                            <TableCell className="py-4">
                              {item.flat?.leaderName ? (
                                <span className="font-semibold text-slate-700">{item.flat.leaderName}</span>
                              ) : (
                                <span className="text-slate-400 italic text-sm">No Leader</span>
                              )}
                            </TableCell>
                            <TableCell className="py-4 text-right">
                              <div className="font-bold text-slate-900 text-lg">
                                ₹{Number(item.amount).toLocaleString()}
                              </div>
                              {rate && (
                                <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                                  ₹{rate}/sqft • {item.flat.squareFeet} sqft
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(item.status)}
                                {getStatusBadge(item.status)}
                              </div>
                            </TableCell>
                            <TableCell className="py-4 font-medium text-slate-600 text-sm">
                              {item.dueDate ? format(new Date(item.dueDate), 'MMM d, yyyy') : 'N/A'}
                            </TableCell>
                            <TableCell className="py-4 pr-6 text-right">
                              {!isAdmin ? (
                                (item.status === 'pending' || item.status === 'unpaid' || item.status === 'partially_paid' || item.status === 'overdue') ? (
                                  <Button 
                                    size="sm" 
                                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm hover:-translate-y-0.5 transition-transform"
                                    onClick={() => handlePayBill(item.id)}
                                  >
                                    <Banknote className="w-4 h-4 mr-1.5" /> Pay Now
                                  </Button>
                                ) : (
                                  <span className="text-slate-400 text-sm font-semibold flex items-center justify-end gap-1.5">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Settled
                                  </span>
                                )
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                  onClick={() => handleDeleteBill(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </TableCell>
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

      <GenerateBillForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSuccess={fetchBills} 
      />
    </div>
  );
}
