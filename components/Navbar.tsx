import Link from "next/link";
import { Button } from "@/components/ui/button";
import { validateRequest } from "@/lib/auth/lucia";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Wallet, LayoutDashboard, FileText, LogOut, Menu, Github } from "lucide-react";

export async function Navbar() {
  const { user } = await validateRequest();

  const NavItems = () => (
    <>
      <Link href="/dashboard">
        <Button variant="ghost" className="w-full justify-start">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
      </Link>
      <Link href="/invoices">
        <Button variant="ghost" className="w-full justify-start">
          <FileText className="mr-2 h-4 w-4" />
          Invoices
        </Button>
      </Link>
      <form action="/api/auth/logout" method="post">
        <Button variant="ghost" type="submit" className="w-full justify-start">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </form>
    </>
  );

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Wallet className="h-6 w-6 text-primary" />
          <span className="text-2xl font-bold">PayStuff</span>
        </Link>
        <div className="flex items-center">
          {user ? (
            <>
              <div className="hidden md:flex md:space-x-2">
                <NavItems />
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                  <nav className="flex flex-col space-y-4">
                    <NavItems />
                  </nav>
                </SheetContent>
              </Sheet>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-2 rounded-full">
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>{user?.githubId}</DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <form action="/api/auth/logout" method="post">
                      <button type="submit" className="w-full text-left">Logout</button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/api/auth/login">
              <Button>
                <Github className="mr-2 h-4 w-4" />
                Sign in with GitHub
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}