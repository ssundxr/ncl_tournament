"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, AuthProvider } from "@/components/auth/auth-provider";
import Link from "next/link";
import { 
  Trophy, 
  Users, 
  CalendarDays, 
  Swords, 
  LogOut,
  LayoutDashboard
} from "lucide-react";
import { auth } from "@/lib/firebase/client";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";

function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();

  const links = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Tournaments", href: "/admin/tournaments", icon: Trophy },
    { name: "Seasons", href: "/admin/seasons", icon: CalendarDays },
    { name: "Matches", href: "/admin/matches", icon: Swords },
    { name: "Players", href: "/admin/players", icon: Users },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth/login");
  };

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0 shadow-sm">
      <div className="h-16 border-b border-border flex items-center px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-heading font-bold text-foreground tracking-tight transition-transform duration-200 group-hover:scale-[1.02]">NCL</span>
          <span className="font-medium text-muted-foreground text-sm">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(`${link.href}/`));
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium
                ${isActive 
                  ? "bg-secondary text-secondary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-secondary-foreground" : "text-muted-foreground"}`} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-3 mb-2">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold overflow-hidden border border-primary/20">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.email?.charAt(0).toUpperCase() || "A"
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-foreground truncate">{user?.displayName || "Admin User"}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-sm font-medium"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminGuard>
        {children}
      </AdminGuard>
    </AuthProvider>
  );
}
