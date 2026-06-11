import { HelpCircle, ShieldAlert, Book, MessageSquare, Phone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuthStore } from '@/store/authStore'

export default function SupportPage() {
  const user = useAuthStore(s => s.user)

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="h-8 w-8 text-primary" />
          Reporter Support Center
        </h1>
        <p className="text-muted-foreground">
          Welcome {user?.name.split(' ')[0]}. Find guides on how to report incidents and what happens after you submit a report.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Book className="h-5 w-5 text-blue-400" /> Reporting Guide
            </CardTitle>
            <CardDescription>Step-by-step instructions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p><strong>1. Identify the Incident:</strong> Ensure that you and others are safe before reporting. If there is an immediate emergency (e.g., active fire, severe injury), call emergency services first.</p>
            <p><strong>2. Create a Report:</strong> Click the "+ New Incident" button on the sidebar. Fill in the incident title, description, location, and severity.</p>
            <p><strong>3. Immediate Actions:</strong> If you took any immediate action (like evacuating an area or shutting down a system), document it in the second step of the form.</p>
            <p><strong>4. Submit:</strong> Once submitted, the Incident Management team will instantly receive a notification and begin triage.</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HelpCircle className="h-5 w-5 text-green-400" /> What Happens Next?
            </CardTitle>
            <CardDescription>The incident lifecycle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <ul className="space-y-3">
              <li className="flex gap-2">
                <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 font-bold text-xs">1</span>
                <span><strong>Triage:</strong> The Incident Manager reviews your report and assigns an Investigator.</span>
              </li>
              <li className="flex gap-2">
                <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 font-bold text-xs">2</span>
                <span><strong>Investigation:</strong> The investigator may reach out to you for more details. They will uncover root causes and apply controls.</span>
              </li>
              <li className="flex gap-2">
                <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 font-bold text-xs">3</span>
                <span><strong>Resolution:</strong> The issue is fixed, and the incident is marked as Closed. You can track this progress in your Dashboard.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <Phone className="h-5 w-5" /> Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-card rounded-lg border border-border/50 text-center">
                <p className="font-semibold text-foreground">IT Helpdesk</p>
                <p className="text-sm text-muted-foreground mt-1">Ext: 5001</p>
                <p className="text-xs text-primary mt-1 cursor-pointer">it-support@ims.com</p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border/50 text-center">
                <p className="font-semibold text-foreground">Facilities & Maintenance</p>
                <p className="text-sm text-muted-foreground mt-1">Ext: 5002</p>
                <p className="text-xs text-primary mt-1 cursor-pointer">facilities@ims.com</p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border/50 text-center">
                <p className="font-semibold text-foreground">Security Desk</p>
                <p className="text-sm text-muted-foreground mt-1">Ext: 5009 (24/7)</p>
                <p className="text-xs text-primary mt-1 cursor-pointer">security@ims.com</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
