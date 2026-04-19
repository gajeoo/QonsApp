import { useMutation, useQuery } from "convex/react";
import {
  CheckCircle2,
  Copy,
  Crown,
  Loader2,
  Mail,
  UserPlus,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { FeatureGate } from "@/components/FeatureGate";

function TeamPageInner() {
  const team = useQuery(api.invitations.getMyTeam);
  const invitations = useQuery(api.invitations.listMine);
  const createInvite = useMutation(api.invitations.create);
  const revokeInvite = useMutation(api.invitations.revoke);

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"manager" | "worker">("worker");
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    try {
      const result = await createInvite({ email: inviteEmail.trim(), role: inviteRole });
      if (result.success && result.token) {
        const link = `${window.location.origin}/signup?invite=${result.token}`;
        setInviteLink(link);
        toast.success("Invitation created!");
        setInviteEmail("");
      } else {
        toast.error(result.error || "Failed to create invitation");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to create invitation");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/signup?invite=${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied to clipboard!");
  };

  const pendingInvites = invitations?.filter((i) => i.status === "pending") || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Invite managers and workers to your organization
          </p>
        </div>
        <Dialog open={showInvite} onOpenChange={(o) => { setShowInvite(o); if (!o) setInviteLink(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-teal text-white hover:bg-teal/90">
              <UserPlus className="size-4" /> Invite Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation link. They'll create an account with the assigned role.
              </DialogDescription>
            </DialogHeader>

            {inviteLink ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                  <CheckCircle2 className="size-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-medium text-emerald-800">Invitation Created!</p>
                  <p className="text-xs text-emerald-600 mt-1">Share this link with your team member</p>
                </div>
                <div className="flex gap-2">
                  <Input value={inviteLink} readOnly className="text-xs" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(inviteLink);
                      toast.success("Copied!");
                    }}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
                <DialogFooter>
                  <Button onClick={() => { setShowInvite(false); setInviteLink(null); }}>Done</Button>
                </DialogFooter>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      placeholder="worker@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "manager" | "worker")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="worker">
                          <span className="flex items-center gap-2">
                            <Wrench className="size-3.5 text-green-500" /> Worker — Can clock in, view shifts & assigned jobs
                          </span>
                        </SelectItem>
                        <SelectItem value="manager">
                          <span className="flex items-center gap-2">
                            <Crown className="size-3.5 text-amber-500" /> Manager — Full access, can invite workers
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
                  <Button onClick={handleInvite} disabled={loading}>
                    {loading && <Loader2 className="size-4 animate-spin" />}
                    Send Invitation
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="size-5" /> Team Members ({team?.length ?? 0})
          </CardTitle>
          <CardDescription>Workers and managers in your organization</CardDescription>
        </CardHeader>
        <CardContent>
          {!team || team.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="size-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No team members yet</p>
              <p className="text-sm mt-1">Invite workers and managers to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell className="font-medium">{member.name || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{member.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1 capitalize">
                        {member.role === "manager" ? <Crown className="size-3" /> : <Wrench className="size-3" />}
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.isActive ? "default" : "secondary"}>
                        {member.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="size-5" /> Pending Invitations ({pendingInvites.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvites.map((inv) => (
                  <TableRow key={inv._id}>
                    <TableCell className="font-medium">{inv.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{inv.role}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyLink((invitations?.find((i) => i._id === inv._id) as any)?.token ?? "")}
                      >
                        <Copy className="size-3.5" /> Copy Link
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={async () => {
                          await revokeInvite({ invitationId: inv._id });
                          toast.success("Invitation revoked");
                        }}
                      >
                        <XCircle className="size-3.5" /> Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function TeamPage() {
  return (
    <FeatureGate feature="team_management">
      <TeamPageInner />
    </FeatureGate>
  );
}
