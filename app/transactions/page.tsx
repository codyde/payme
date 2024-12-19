import TransactionsTable from '@/components/TransactionsTable';

export default function TransactionsPage({ params }: { params: { userId: string } }) {
  return <TransactionsTable userId={params.userId} />;
}