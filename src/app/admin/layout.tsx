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
  Settings, 
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
    <div className="w-64 h-screen bg-[#15151e] border-r border-border flex flex-col fixed left-0 top-0">
      <div className="h-16 border-b border-border flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-black font-heading text-primary uppercase tracking-widest">NFL</span>
          <span className="font-bold text-white uppercase text-sm tracking-wider">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors font-bold uppercase tracking-wide text-sm
                ${isActive ? "bg-primary text-white" : "text-muted-foreground hover:bg-white/5 hover:text-white"}`}
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.email?.charAt(0).toUpperCase() || "A"
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-white truncate">{user?.displayName || "Admin"}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 uppercase tracking-widest font-bold"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
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
        <div className="w-full h-1 bg-primary fixed top-0 z-50 left-64 right-0" />
        <div className="p-8 mt-1">
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
