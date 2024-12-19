"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MoreHorizontal, Plus, Trash, Edit, FileText, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  business: string;
  status: string;
  invoiceId?: string;
  invoiceName?: string;
}

interface TransactionsTableProps {
    userId: string;
    invoiceId?: string | null;
    actions?: boolean;
    status?: boolean;
  }

interface Invoice {
  id: string;
  name: string;
}

export default function TransactionsTable({ userId, invoiceId, actions}: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<keyof Transaction>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState<{
    description: string;
    amount: string;
    business: string;
    date: Date;
    invoiceId: string | null;
  }>({
    description: '',
    amount: '',
    business: '',
    date: new Date(),
    invoiceId: null,
  });

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      let url = `/api/transactions?userId=${userId}`;
      if (invoiceId) {
        url = `/api/invoices/${invoiceId}/transactions`;
      }
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await res.json();
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, invoiceId, toast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSort = useCallback((column: keyof Transaction) => {
    setSortColumn(column);
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  }, []);

  const handleDeleteTransaction = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTransactions(prev => prev.filter(t => t.id !== id));
        toast({
          title: "Success",
          description: "Transaction deleted successfully",
        });
      } else {
        throw new Error("Failed to delete transaction");
      }
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      toast({
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const filteredAndSortedTransactions = useMemo(() => {
    return transactions
      .filter(transaction => 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.business.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        // @ts-ignore
        if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1;
        // @ts-ignore
        if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
  }, [transactions, searchTerm, sortColumn, sortDirection]);

  const totalAmount = useMemo(() => {
    return filteredAndSortedTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [filteredAndSortedTransactions]);

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch('/api/invoices');
      if (!res.ok) {
        throw new Error('Failed to fetch invoices');
      }
      const data = await res.json();
      setInvoices(data);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      toast({
        title: "Error",
        description: "Failed to fetch invoices. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleAddToInvoice = async () => {
    if (!selectedInvoice || !selectedTransactionId) return;

    try {
      const response = await fetch(`/api/transactions/${selectedTransactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: selectedInvoice }),
      });

      if (!response.ok) {
        throw new Error('Failed to add transaction to invoice');
      }

      // Update the local state
      setTransactions(prev => prev.map(t => 
        t.id === selectedTransactionId ? { ...t, invoiceId: selectedInvoice, invoiceName: invoices.find(i => i.id === selectedInvoice)?.name } : t
      ));
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

  const handleAddTransaction = async () => {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTransaction),
    });

    if (response.ok) {
      const addedTransaction = await response.json();
      setTransactions([...transactions, addedTransaction]);
      setIsAddTransactionDialogOpen(false);
      setNewTransaction({ description: '', amount: '', business: '', date: new Date(), invoiceId: null });
      router.refresh();
    } else {
      console.error('Failed to add transaction');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {invoiceId ? "Invoice Transactions" : "Transactions"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          {!invoiceId && (
            <Dialog open={isAddTransactionDialogOpen} onOpenChange={setIsAddTransactionDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Transaction</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Transaction</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="business" className="text-right">Business</Label>
                    <Input
                      id="business"
                      value={newTransaction.business}
                      onChange={(e) => setNewTransaction({...newTransaction, business: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Input
                      id="description"
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">Date</Label>
                    <Calendar
                      mode="single"
                      selected={newTransaction.date}
                      onSelect={(date) => setNewTransaction({...newTransaction, date: date || new Date()})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="invoice" className="text-right">Invoice</Label>
                    <Select
                      onValueChange={(value) => setNewTransaction({...newTransaction, invoiceId: value || null})}
                      value={newTransaction.invoiceId || undefined}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an invoice" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {invoices.map((invoice) => (
                          <SelectItem key={invoice.id} value={invoice.id}>{invoice.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleAddTransaction}>Add Transaction</Button>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  <Button variant="ghost" onClick={() => handleSort("date")}>Date</Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("description")}>Description</Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("amount")}>Amount</Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("business")}>Business</Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("invoiceName")}>Invoice</Button>
                </TableHead>
                {actions && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="whitespace-nowrap">
                    <Link href={`/transactions/${transaction.id}`} className="hover:underline">
                      {formatDate(transaction.date)}
                    </Link>
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell>{transaction.business}</TableCell>
                  <TableCell>
                    {transaction.invoiceId ? (
                      <Link href={`/invoices/${transaction.invoiceId}`} className="hover:underline">
                        {transaction.invoiceId}
                      </Link>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTransactionId(transaction.id);
                          setIsDialogOpen(true);
                        }}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add to Invoice
                      </Button>
                    )}
                  </TableCell>
                  {actions && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/transactions/${transaction.id}`)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          {!transaction.invoiceId && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedTransactionId(transaction.id);
                              setIsDialogOpen(true);
                            }}>
                              <FileText className="mr-2 h-4 w-4" /> Add to Invoice
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDeleteTransaction(transaction.id)}>
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Showing {filteredAndSortedTransactions.length} of {transactions.length} transactions
          </p>
        
        </div>
        {isLoading ? (
          <div className="text-center py-4">Loading transactions...</div>
        ) : (
          <>
            {/* ... existing table JSX ... */}
          </>
        )}
      </CardContent>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Invoice</DialogTitle>
          </DialogHeader>
          <Select
  onValueChange={(value) => setNewTransaction({...newTransaction, invoiceId: value})}
  value={newTransaction.invoiceId || undefined}
>
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
    </Card>
  );
}
