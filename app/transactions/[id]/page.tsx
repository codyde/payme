"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PencilIcon, CheckIcon, TrashIcon, PlusIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  business: string;
  date: string;
  status: string;
  invoiceId?: string;
}

interface Invoice {
  id: string;
  name: string;
}

export default function TransactionDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await fetch(`/api/transactions/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch transaction');
        }
        const data = await response.json();
        setTransaction(data);
      } catch (error) {
        console.error('Error fetching transaction:', error);
        toast({
          title: "Error",
          description: "Failed to load transaction details",
          variant: "destructive",
        });
      }
    };

    const fetchInvoices = async () => {
      try {
        const response = await fetch('/api/invoices');
        if (!response.ok) {
          throw new Error('Failed to fetch invoices');
        }
        const data = await response.json();
        setInvoices(data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        toast({
          title: "Error",
          description: "Failed to load invoices",
          variant: "destructive",
        });
      }
    };

    if (id) {
      fetchTransaction();
      fetchInvoices();
    }
  }, [id, toast]);

  const handleEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const handleSave = async () => {
    if (!editingField || !transaction) return;

    try {
      const updatedTransaction = { ...transaction, [editingField]: editValue };
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [editingField]: editValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }

      setTransaction(updatedTransaction);
      setEditingField(null);
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
      router.push('/transactions'); // Redirect to transactions list
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  const handleAddToInvoice = async () => {
    if (!selectedInvoice) return;

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: selectedInvoice }),
      });

      if (!response.ok) {
        throw new Error('Failed to add transaction to invoice');
      }

      setTransaction(prev => prev ? { ...prev, invoiceId: selectedInvoice } : null);
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Transaction added to invoice successfully",
      });
    } catch (error) {
      console.error('Error adding transaction to invoice:', error);
      toast({
        title: "Error",
        description: "Failed to add transaction to invoice",
        variant: "destructive",
      });
    }
  };

  if (!transaction) return <div>Loading...</div>;

  const renderField = (label: string, field: keyof Transaction) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      {editingField === field ? (
        <div className="flex items-center space-x-2">
          {field === 'date' ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !editValue && "text-muted-foreground"
                  )}
                >
                  {editValue ? format(new Date(editValue), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={editValue ? new Date(editValue) : undefined}
                  onSelect={(date) => setEditValue(date ? date.toISOString() : '')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          ) : (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-48"
            />
          )}
          <Button onClick={handleSave} size="sm" variant="ghost">
            <CheckIcon className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold">
            {field === 'amount' ? formatCurrency(transaction[field] as number) : transaction[field]}
          </span>
          <Button onClick={() => handleEdit(field, String(transaction[field]))} size="sm" variant="ghost">
            <PencilIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Transaction Details</CardTitle>
        <Badge variant={transaction.status === 'completed' ? 'secondary' : 'default'}>
          {transaction.status}
        </Badge>
      </CardHeader>
      <CardContent>
        {renderField("Description", "description")}
        {renderField("Amount", "amount")}
        {renderField("Business", "business")}
        {renderField("Date", "date")}
        {transaction.invoiceId && renderField("Invoice ID", "invoiceId")}
        <div className="mt-6 space-y-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add to Invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add to Invoice</DialogTitle>
              </DialogHeader>
              <Select onValueChange={setSelectedInvoice}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an invoice" />
                </SelectTrigger>
                <SelectContent>
                  {invoices.map((invoice) => (
                    <SelectItem key={invoice.id} value={invoice.id}>
                      {invoice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddToInvoice}>Add to Invoice</Button>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" onClick={handleDelete} className="w-full">
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete Transaction
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}