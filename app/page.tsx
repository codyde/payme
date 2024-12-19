import { validateRequest } from "@/lib/auth/lucia";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Users, Receipt, CreditCard, ArrowRight } from "lucide-react";

export default async function Home() {
  const { user } = await validateRequest();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <div className="bg-primary/10 p-4 rounded-full mb-6">
            <Wallet className="h-20 w-20 text-primary" />
          </div>
          <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
            Welcome to PayStuff
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            Split bills, track expenses, and manage shared costs with friends and family - all in one place!
          </p>
          {user ? (
            <Link href="/dashboard">
              <Button size="lg" className="group">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          ) : (
            <Link href="/api/auth/login">
              <Button size="lg" className="group">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 mr-2 text-primary" />
                Split Bills Easily
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Divide expenses fairly among friends after dinners, trips, or any shared activity. No more awkward money talks!
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="h-6 w-6 mr-2 text-primary" />
                Track Family Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Keep tabs on shared household bills and expenses. Ensure everyone contributes their fair share each month.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-6 w-6 mr-2 text-primary" />
                Seamless Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Send and receive payments with ease. Integrate with popular payment methods for quick settlements.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center bg-primary/5 p-8 rounded-lg shadow-sm">
          <h2 className="text-3xl font-bold mb-4">Ready to simplify your shared expenses?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of friends and families who are making bill-splitting and expense tracking a breeze with PayStuff.
          </p>
          <Button size="lg" variant="outline" className="group">
            Learn More
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}