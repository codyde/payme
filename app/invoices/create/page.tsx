"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function CreateInvoice() {
  const [name, setName] = useState("");
  const [personName, setPersonName] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, personName, email }),
      });

      if (!response.ok) {
        throw new Error("Failed to create invoice");
      }

      const invoice = await response.json();
      toast({
        title: "Invoice created",
        description: `Invoice ${invoice.uniqueIdentifier} has been successfully created.`,
      });
      router.push(`/invoices/${invoice.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Create Invoice</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Invoice Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          placeholder="Person's Name"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit">Create Invoice</Button>
      </form>
    </div>
  );
}