import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, Search, Users } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: "patient" | "therapist" | "admin" | "super_admin";
  created_at: string | null;
}

export default function SuperAdminManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();
  // Auth + super_admin check handled by ProtectedRoute in App.tsx

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("id, email, name, role, created_at")
      .order("email");

    if (error) {
      toast({
        title: "Error loading users",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const toggleSuperAdmin = async (userId: string, currentRole: string) => {
    setUpdating(userId);
    
    const newRole = currentRole === "super_admin" ? "admin" : "super_admin";
    
    const { error } = await supabase
      .from("users")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Role updated",
        description: `User role changed to ${newRole}`,
      });
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole as User["role"] } : u
      ));
    }
    setUpdating(null);
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    (user.name?.toLowerCase().includes(search.toLowerCase()))
  );

  const superAdminCount = users.filter(u => u.role === "super_admin").length;

  // Auth check handled by ProtectedRoute
    <AdminLayout title="Super Admins" description="Grant or revoke super admin access to users">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Super Admin Management</CardTitle>
              <CardDescription>
                Grant or revoke super admin access to users
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Current Super Admins</p>
              <p className="text-2xl font-bold">{superAdminCount}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users Table - Desktop */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading users...</div>
          ) : (
            <>
              <div className="hidden sm:block border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead className="text-right">Super Admin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name || "No name"}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === "super_admin" ? "default" : "secondary"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Switch
                            checked={user.role === "super_admin"}
                            onCheckedChange={() => toggleSuperAdmin(user.id, user.role)}
                            disabled={updating === user.id}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="grid grid-cols-1 gap-3 sm:hidden">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    No users found
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div key={user.id} className="border rounded-xl p-4 bg-card">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{user.name || "No name"}</p>
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <Switch
                          checked={user.role === "super_admin"}
                          onCheckedChange={() => toggleSuperAdmin(user.id, user.role)}
                          disabled={updating === user.id}
                        />
                      </div>
                      <div className="mt-2">
                        <Badge variant={user.role === "super_admin" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
