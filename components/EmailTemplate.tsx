import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Link,
  Tailwind,
} from "@react-email/components";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Transaction {
    id: number;
    date: Date;
    description: string;
    business: string;
    amount: number;
    invoiceId: string | null;
    userId: string;
    status: string;
    notes: string | null;
  }

interface Invoice {
  name: string;
  person: string;
  total: number;
  transactions: Transaction[];
  email: string;
}

interface InvoiceEmailProps {
  invoice: Invoice;
}

export default function EmailTemplate({ invoice }: InvoiceEmailProps) {
  return (
    <Html>
      <Tailwind>
        <Head>
          <title>Invoice Email</title>
          <style>{`
              @media (min-width: 768px) {
                .md\\:grid-cols-2 {
                  grid-template-columns: repeat(2, minmax(0, 1fr));
                }
              }
            `}</style>
        </Head>
        <Preview>
          Hey {invoice.person}, here's that invoice I mentioned 💸
        </Preview>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto my-10 max-w-2xl p-4">
            <Card className="border-none shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
                <CardTitle className="text-2xl font-bold text-black">
                  Hey {invoice.person}! 👋
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <Text className="mb-4 text-gray-700">
                  Hi! Mind taking a look at the below and shooting me some money
                  for it? Thanks!
                </Text>
                <Card className="mb-6 bg-gray-50 border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      Invoice: {invoice.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <Badge
                      variant="outline"
                      className="text-2xl font-bold text-green-600 p-2 bg-white"
                    >
                      Total: $
                      {typeof invoice.total === "number"
                        ? invoice.total.toFixed(2)
                        : "0.00"}
                    </Badge>
                  </CardContent>
                </Card>
                <Heading className="mb-4 text-xl font-semibold text-gray-800">
                  Here's what it's for:
                </Heading>
                {invoice.transactions.length > 0 ? (
                  <table className="w-full mb-4 border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left p-2 bg-gray-100 border border-gray-200">
                          Date
                        </th>
                        <th className="text-left p-2 bg-gray-100 border border-gray-200">
                          Description
                        </th>
                        <th className="text-right p-2 bg-gray-100 border border-gray-200">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.transactions.map((transaction, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                            <td className="text-left p-2 border border-gray-200">
                            {transaction.date instanceof Date 
    ? `${transaction.date.getMonth() + 1}/${transaction.date.getDate()}/${transaction.date.getFullYear()}`
    : new Date(transaction.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                            </td>
                          <td className="text-left p-2 border border-gray-200">
                            {transaction.description}
                          </td>
                          <td className="text-right p-2 border border-gray-200">
                            $
                            {typeof transaction.amount === "number"
                              ? transaction.amount.toFixed(2)
                              : "0.00"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <Text className="text-gray-500 italic">
                    No transactions found.
                  </Text>
                )}
              </CardContent>
              <CardFooter className="bg-gray-50 p-6">
                <Text className="mt-6 text-sm text-gray-600 text-center">
                  P.S. This is an automated email, but feel free to hit me up
                  directly if you need anything!
                </Text>
              </CardFooter>
            </Card>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
