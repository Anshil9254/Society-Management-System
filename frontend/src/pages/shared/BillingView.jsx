import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Receipt, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import GenerateBillForm from './GenerateBillForm';

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
      case 'unpaid': return <Badge variant="destructive">Unpaid</Badge>;
      case 'paid': return <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white border-transparent">Paid</Badge>;
      case 'overdue': return <Badge variant="secondary" className="bg-red-900 text-white">Overdue</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Maintenance Billing</h2>
          <p className="text-slate-500 mt-1">
            {isAdmin ? "Manage society maintenance bills and tracking" : "View and pay your flat maintenance bills"}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-100 py-6 px-5 font-semibold">
            <Receipt className="w-5 h-5" /> Generate Bulk Bills
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill Period</TableHead>
                <TableHead>Flat</TableHead>
                <TableHead>Family Leader</TableHead>
                <TableHead>Area (SqFt)</TableHead>
                <TableHead>Rate/SqFt</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                    Loading bills...
                  </TableCell>
                </TableRow>
              ) : bills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                    No bills found.
                  </TableCell>
                </TableRow>
              ) : (
                bills.map((item) => {
                  const rate = item.flat?.squareFeet && item.amount ? (Number(item.amount) / item.flat.squareFeet).toFixed(2) : null;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {format(new Date(item.billingYear, item.billingMonth - 1), 'MMMM yyyy')}
                      </TableCell>
                      <TableCell>
                        {item.flat ? `${item.flat.blockName}-${item.flat.flatNumber} (${item.flat.type})` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {item.flat?.leaderName ? (
                          <span className="font-medium text-slate-800">{item.flat.leaderName}</span>
                        ) : (
                          <span className="text-slate-400 italic">No Leader Assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.flat?.squareFeet ? `${item.flat.squareFeet} Sqft` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {rate ? `₹${rate}/sqft` : 'N/A'}
                      </TableCell>
                      <TableCell className="font-bold text-slate-900">
                        ₹{Number(item.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {item.dueDate ? format(new Date(item.dueDate), 'MMM d, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(item.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        {!isAdmin ? (
                          (item.status === 'pending' || item.status === 'unpaid' || item.status === 'partially_paid' || item.status === 'overdue') ? (
                            <Button size="sm" onClick={() => handlePayBill(item.id)}>Pay Now</Button>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-450 hover:text-red-500 hover:bg-red-50 rounded-xl"
                            onClick={() => handleDeleteBill(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <GenerateBillForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSuccess={fetchBills} 
      />
    </div>
  );
}
