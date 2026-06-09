import { useState, FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { User, Lock, Save, Loader2 } from 'lucide-react'
import { usersApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Button }  from '@/components/ui/button'
import { Input }   from '@/components/ui/input'
import { Label }   from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast }   from '@/components/ui/toaster'
import { roleClass, roleLabel } from '@/lib/utils'

export default function ProfilePage() {
  const { user, setAuth, token } = useAuthStore()

  const [name,        setName]       = useState(user?.name ?? '')
  const [email,       setEmail]      = useState(user?.email ?? '')
  const [currentPw,   setCurrentPw]  = useState('')
  const [newPw,       setNewPw]      = useState('')
  const [confirmPw,   setConfirmPw]  = useState('')

  const profileMut = useMutation({
    mutationFn: () => usersApi.updateMe({ name, email }),
    onSuccess:  (res) => {
      if (token) setAuth(token, res.data.data)
      toast({ title: 'Profile updated', variant: 'success' })
    },
    onError: (e: any) => toast({ title: e.response?.data?.error ?? 'Failed', variant: 'destructive' }),
  })

  const pwMut = useMutation({
    mutationFn: () => usersApi.changePass({ currentPassword: currentPw, newPassword: newPw }),
    onSuccess:  () => {
      toast({ title: 'Password changed', variant: 'success' })
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    },
    onError: (e: any) => toast({ title: e.response?.data?.error ?? 'Failed', variant: 'destructive' }),
  })

  const handlePwSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (newPw !== confirmPw) { toast({ title: 'Passwords do not match', variant: 'destructive' }); return }
    if (newPw.length < 6)    { toast({ title: 'New password must be ≥ 6 characters', variant: 'destructive' }); return }
    pwMut.mutate()
  }

  const badgeColor = roleClass(user?.role ?? 'investigator')
  const badgeLabel = roleLabel(user?.role ?? 'investigator')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings</p>
      </div>

      {/* Avatar card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 border border-primary/30 text-3xl font-bold text-primary">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <span className={`mt-2 inline-block text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${badgeColor}`}>
                {badgeLabel}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); profileMut.mutate() }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pname">Full Name</Label>
                <Input id="pname" value={name} onChange={e => setName(e.target.value)} required minLength={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pemail">Email</Label>
                <Input id="pemail" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={profileMut.isPending} className="gap-1.5">
                {profileMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePwSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpw">Current Password</Label>
              <Input id="cpw" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="npw">New Password</Label>
                <Input id="npw" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpw2">Confirm Password</Label>
                <Input id="cpw2" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required />
              </div>
            </div>
            {newPw && confirmPw && newPw !== confirmPw && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
            <div className="flex justify-end">
              <Button type="submit" size="sm" variant="outline" disabled={!currentPw || !newPw || pwMut.isPending} className="gap-1.5">
                {pwMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
