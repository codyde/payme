'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { getInvoices, updateInvoice, deleteInvoice, completeInvoice } from "@/lib/api";
import { Pencil, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";

// import useUserDataStore from "@/lib/auth/userState";

interface Invoice {
  id: string;
  name: string;
  email: string;
  billablePerson: string; // Changed from personName
  description: string; // Added this field
  status: 'unpaid' | 'paid'; // Changed from 'pending' | 'completed'
  createdAt: string;
  totalAmount: number; // Changed from total
}

function CreateInvoiceDialog() {
  const { register, handleSubmit, reset, control, setValue } = useForm();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create invoice");

      const invoice = await response.json();
      toast({
        title: "Invoice created",
        description: `Invoice ${invoice.id} has been successfully created.`,
      });
      setOpen(false);
      reset();
      getInvoices(); // Refresh the invoice list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    }
  };



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Invoice</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Invoice Name</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register("description", { required: true })} />
          </div>
          <div>
            <Label htmlFor="billablePerson">Person's Name</Label>
            <Input id="billablePerson" {...register("billablePerson", { required: true })} />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" {...register("email", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    setValue("dueDate", newDate);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button type="submit">Create Invoice</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [editingInvoice, setEditingInvoice] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const { toast } = useToast();
  // const { fetchUser, userData } = useUserDataStore();

  useEffect(() => {
      fetchInvoices();
  }, []); // Add user as a dependency

  async function fetchInvoices() {
    try {
      const response = await fetch('/api/invoices');
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      const fetchedInvoices = await response.json();
      setInvoices(fetchedInvoices);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch invoices');
      setLoading(false);
    }
  }

  async function handleUpdateInvoice(id: string) {
    try {
      await updateInvoice(id, { name: editedName, email: editedEmail });
      setInvoices(invoices.map(invoice => 
        invoice.id === id ? { ...invoice, name: editedName, email: editedEmail } : invoice
      ));
      setEditingInvoice(null);
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteInvoice(id: string) {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }

      setInvoices(invoices.filter(invoice => invoice.id !== id));
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    }
  }

  async function handleCompleteInvoice(id: string) {
    try {
      await completeInvoice(id);
      setInvoices(invoices.map(invoice => 
        invoice.id === id ? { ...invoice, status: 'paid' } : invoice
      ));
      toast({
        title: "Success",
        description: "Invoice marked as complete",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to complete invoice",
        variant: "destructive",
      });
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const filteredInvoices = invoices.filter(invoice => 
    activeTab === 'pending' ? invoice.status === 'unpaid' : invoice.status === 'paid'
  );

  async function handleSendEmail(e: any, invoiceId: string) {
    e.preventDefault()
    
    try {
      // send email to the invoice email address
      const response = await fetch(`/api/send?email=${invoiceId}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      console.log(response)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email",  
      });
    }
    return
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <CreateInvoiceDialog />
      </div>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'pending' | 'completed')}>
        <TabsList>
          <TabsTrigger value="pending">Unpaid</TabsTrigger>
          <TabsTrigger value="completed">Paid</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInvoices.map((invoice: Invoice) => (
              <Card key={invoice.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {editingInvoice === invoice.id ? (
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="mr-2"
                      />
                    ) : (
                      invoice.name
                    )}
                    {editingInvoice === invoice.id ? (
                      <div>
                        <Button variant="ghost" size="sm" onClick={() => handleUpdateInvoice(invoice.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingInvoice(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditingInvoice(invoice.id);
                        setEditedName(invoice.name);
                        setEditedEmail(invoice.email);
                      }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {invoice.billablePerson} - {invoice.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">${invoice.totalAmount}</p>
                  <p className="text-xs text-gray-500">Created: {new Date(invoice.createdAt).toLocaleDateString()}</p>
                  <div className="mt-4 space-x-2 flex flex-row">
                  <Button onClick={(e) => handleSendEmail(e, invoice.id)} className="bg-green-500" size="sm">Request Payment</Button>

                    <Link href={`/invoices/${invoice.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                    {activeTab === 'pending' && (
                      <Button variant="outline" size="sm" onClick={() => handleCompleteInvoice(invoice.id)}>Mark as Paid</Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteInvoice(invoice.id)}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Invoices;