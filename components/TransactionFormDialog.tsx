"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TransactionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Invoice {
  id: number;
  name: string;
}

export default function TransactionFormDialog({ isOpen, onClose }: TransactionFormDialogProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [business, setBusiness] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("new");
  const [newInvoiceName, setNewInvoiceName] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchInvoices();
    }
  }, [isOpen]);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          amount: parseFloat(amount),
          business,
          date,
          notes,
          invoiceId: selectedInvoiceId === "new" ? null : selectedInvoiceId,
          newInvoiceName: selectedInvoiceId === "new" ? newInvoiceName : null,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Transaction added successfully",
        });
        onClose();
      } else {
        throw new Error("Failed to add transaction");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business">Business</Label>
            <Input id="business" value={business} onChange={(e) => setBusiness(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice">Invoice</Label>
            <Select value={selectedInvoiceId} onValueChange={setSelectedInvoiceId}>
              <SelectTrigger id="invoice">
                <SelectValue placeholder="Select Invoice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Create New Invoice</SelectItem>
                {invoices.map((invoice) => (
                  <SelectItem key={invoice.id} value={invoice.id.toString()}>
                    {invoice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedInvoiceId === "new" && (
            <div className="space-y-2">
              <Label htmlFor="newInvoiceName">New Invoice Name</Label>
              <Input
                id="newInvoiceName"
                value={newInvoiceName}
                onChange={(e) => setNewInvoiceName(e.target.value)}
                required
              />
            </div>
          )}
          <Button type="submit">Add Transaction</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}