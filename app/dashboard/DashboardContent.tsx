"use client";

import { useState } from "react";
import TransactionsTable from "@/components/TransactionsTable";
import TransactionFormDialog from "@/components/TransactionFormDialog";

interface DashboardContentProps {
  userId: string;
}

export default function DashboardContent({ userId }: DashboardContentProps) {
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <TransactionsTable userId={userId} invoiceId={null} actions={true} />
      <TransactionFormDialog
        isOpen={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
      />
    </div>
  );
}