import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Shield, Loader2, UserCheck, UserX } from 'lucide-react'
import { usersApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast }  from '@/components/ui/toaster'
import { formatDate } from '@/lib/utils'
import type { User } from '@/types'

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [role,     setRole]     = useState('staff')

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn:  () => usersApi.list(),
  })

  const users: User[] = data?.data.data ?? []

  const createMut = useMutation({
    mutationFn: () => usersApi.create({ name, email, password, role: role as any }),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({ title: 'User created', variant: 'success' })
      setShowForm(false); setName(''); setEmail(''); setPassword(''); setRole('staff')
    },
    onError: (e: any) => toast({ title: e.response?.data?.error ?? 'Failed', variant: 'destructive' }),
  })

  const roleMut = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) => usersApi.updateRole(id, role),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast({ title: 'Role updated', variant: 'success' }) },
    onError:    () => toast({ title: 'Failed', variant: 'destructive' }),
  })

  const roleColor = (r: string) =>
    r === 'admin'   ? 'text-red-400 bg-red-500/10 border-red-500/25' :
    r === 'manager' ? 'text-orange-400 bg-orange-500/10 border-orange-500/25' :
                      'text-blue-400 bg-blue-500/10 border-blue-500/25'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">{users.length} registered users</p>
        </div>
        <Button onClick={() => setShowForm(v => !v)} size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add User
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/25 animate-fade-in">
          <CardHeader><CardTitle className="text-base">Create New User</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@company.com" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={() => createMut.mutate()} disabled={!name || !email || !password || createMut.isPending}>
                {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create User'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-0 px-0">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <Select
                        value={u.role}
                        onValueChange={role => roleMut.mutate({ id: u.id, role })}
                      >
                        <SelectTrigger className={`h-7 w-[110px] text-xs border font-medium ${roleColor(u.role)}`}>
                          <Shield className="h-3 w-3" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive
                        ? <span className="flex items-center gap-1 text-xs text-green-400"><UserCheck className="h-3 w-3" /> Active</span>
                        : <span className="flex items-center gap-1 text-xs text-muted-foreground"><UserX className="h-3 w-3" /> Inactive</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">#{u.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
