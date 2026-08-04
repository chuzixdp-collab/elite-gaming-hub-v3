'use client';
import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Ban, CheckCircle2, Trash2, Users as UsersIcon } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: string;
  ffUid: string | null;
  ffNickname: string | null;
}

export function AdminUsersView() {
  const navigate = useNavigation((s) => s.navigate);
  const { user, hydrate, hydrated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (hydrated && (!user || user.role !== 'ADMIN')) {
      navigate('login');
      return;
    }
    if (user?.role === 'ADMIN') fetchUsers();
  }, [hydrated, user, navigate, page, search, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' });
      if (search) params.set('search', search);
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (u: User) => {
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !u.isActive }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(u.isActive ? 'User disabled' : 'User enabled');
      fetchUsers();
    } catch {
      toast.error('Failed to update user');
    }
  };

  const toggleRole = async (u: User) => {
    const newRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`Role changed to ${newRole}`);
      fetchUsers();
    } catch {
      toast.error('Failed to update role');
    }
  };

  const deleteUser = async (u: User) => {
    if (!confirm(`Delete user ${u.email}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const totalPages = Math.ceil(total / 20);

  if (!hydrated || !user) return null;

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-2"><UsersIcon className="w-7 h-7 text-[#F5C518]" /> Manage Users</h1>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input placeholder="Search by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="bg-[#141414] border-[#27272A] text-white pl-10" />
          </div>
          <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-44 bg-[#141414] border-[#27272A] text-white">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent className="bg-[#141414] border-[#27272A]">
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="USER">Users</SelectItem>
              <SelectItem value="ADMIN">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-[#141414] border-[#27272A] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black/50 border-b border-[#27272A]">
                <tr>
                  <th className="text-left p-3 text-zinc-400 font-medium">User</th>
                  <th className="text-left p-3 text-zinc-400 font-medium">Role</th>
                  <th className="text-left p-3 text-zinc-400 font-medium hidden md:table-cell">FF UID</th>
                  <th className="text-left p-3 text-zinc-400 font-medium hidden md:table-cell">Joined</th>
                  <th className="text-left p-3 text-zinc-400 font-medium">Status</th>
                  <th className="text-right p-3 text-zinc-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b border-[#27272A]/50"><td colSpan={6} className="p-3"><Skeleton className="h-10 bg-[#0F0F0F]" /></td></tr>
                  ))
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-zinc-500">No users found.</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-b border-[#27272A]/50 hover:bg-white/5">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F5C518] to-[#DC2626] flex items-center justify-center text-black font-bold text-xs shrink-0">
                            {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" /> : (u.name?.charAt(0) || u.email.charAt(0))}
                          </div>
                          <div className="min-w-0">
                            <div className="text-white font-medium truncate">{u.name || 'Unnamed'}</div>
                            <div className="text-xs text-zinc-500 truncate">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className={u.role === 'ADMIN' ? 'border-amber-500/50 text-amber-400' : 'border-zinc-600 text-zinc-400'}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="p-3 text-zinc-300 font-mono text-xs hidden md:table-cell">{u.ffUid || '—'}</td>
                      <td className="p-3 text-zinc-400 text-xs hidden md:table-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={u.isActive ? 'border-emerald-500/50 text-emerald-400' : 'border-red-500/50 text-red-400'}>
                          {u.isActive ? 'Active' : 'Disabled'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => toggleRole(u)} title="Toggle admin role" className="h-8 w-8 text-amber-400 hover:bg-amber-500/10">
                            <UsersIcon className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => toggleActive(u)} title={u.isActive ? 'Disable user' : 'Enable user'} className={`h-8 w-8 ${u.isActive ? 'text-red-400 hover:bg-red-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}>
                            {u.isActive ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          </Button>
                          {u.id !== user.id && (
                            <Button size="icon" variant="ghost" onClick={() => deleteUser(u)} title="Delete user" className="h-8 w-8 text-red-400 hover:bg-red-500/10">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-zinc-400">Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)} className="bg-transparent border-[#27272A] text-zinc-300">Prev</Button>
              <span className="text-sm text-zinc-400 self-center px-2">{page} / {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="bg-transparent border-[#27272A] text-zinc-300">Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
