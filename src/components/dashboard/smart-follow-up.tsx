"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Bell,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getJobApplications,
  createJobApplication,
  updateJobApplication,
  deleteJobApplication,
} from "@/lib/api";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "waiting_to_hear_back", label: "Waiting to hear back", color: "amber" },
  { value: "ghosted", label: "Ghosted", color: "slate" },
  { value: "interview_called", label: "Interview called", color: "blue" },
  { value: "shortlisted", label: "Shortlisted", color: "emerald" },
  { value: "rejected", label: "Rejected", color: "red" },
  { value: "applied", label: "Applied", color: "amber" },
  { value: "interviewing", label: "Interviewing", color: "blue" },
  { value: "offer", label: "Offer", color: "emerald" },
  { value: "withdrawn", label: "Withdrawn", color: "slate" },
] as const;

const STATUS_COLORS: Record<string, { border: string; bg: string; badge: string }> = {
  rejected: { border: "border-l-4 border-l-red-500", bg: "bg-red-500/5", badge: "bg-red-500/20 text-red-700 border-red-500/30" },
  ghosted: { border: "border-l-4 border-l-slate-500", bg: "bg-slate-500/5", badge: "bg-slate-500/20 text-slate-700 border-slate-500/30" },
  withdrawn: { border: "border-l-4 border-l-slate-500", bg: "bg-slate-500/5", badge: "bg-slate-500/20 text-slate-700 border-slate-500/30" },
  waiting_to_hear_back: { border: "border-l-4 border-l-amber-500", bg: "bg-amber-500/5", badge: "bg-amber-500/20 text-amber-700 border-amber-500/30" },
  applied: { border: "border-l-4 border-l-amber-500", bg: "bg-amber-500/5", badge: "bg-amber-500/20 text-amber-700 border-amber-500/30" },
  interview_called: { border: "border-l-4 border-l-blue-500", bg: "bg-blue-500/5", badge: "bg-blue-500/20 text-blue-700 border-blue-500/30" },
  interviewing: { border: "border-l-4 border-l-blue-500", bg: "bg-blue-500/5", badge: "bg-blue-500/20 text-blue-700 border-blue-500/30" },
  shortlisted: { border: "border-l-4 border-l-emerald-500", bg: "bg-emerald-500/5", badge: "bg-emerald-500/20 text-emerald-700 border-emerald-500/30" },
  offer: { border: "border-l-4 border-l-emerald-500", bg: "bg-emerald-500/5", badge: "bg-emerald-500/20 text-emerald-700 border-emerald-500/30" },
};

function getStatusStyle(status: string) {
  return STATUS_COLORS[status] ?? STATUS_COLORS.applied;
}

function getStatusLabel(status: string) {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status.replace(/_/g, " ");
}

interface JobApplication {
  id: string;
  company: string;
  role: string;
  applied_at: string;
  status: string;
  optimal_follow_up_at: string | null;
  follow_up_sent: boolean;
  notes: string | null;
  job_url: string | null;
}

type FollowUpStatus = "now" | "soon" | "upcoming";

function getFollowUpStatus(optimalAt: string | null, followUpSent: boolean): FollowUpStatus | null {
  if (!optimalAt || followUpSent) return null;
  const now = new Date();
  const optimal = new Date(optimalAt);
  const diffDays = Math.ceil((optimal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "now";
  if (diffDays <= 2) return "soon";
  return "upcoming";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelative(iso: string) {
  const now = new Date();
  const d = new Date(iso);
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return `In ${diffDays} days`;
}

export function SmartFollowUp({ userId }: { userId: string }) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    company: "",
    role: "",
    applied_at: new Date().toISOString().slice(0, 10),
    status: "waiting_to_hear_back" as string,
    notes: "",
    job_url: "",
  });

  const fetchApplications = async () => {
    try {
      const data = await getJobApplications(userId);
      setApplications(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [userId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim()) {
      toast.error("Company and role are required");
      return;
    }
    setSubmitting(true);
    try {
      await createJobApplication(userId, {
        company: form.company.trim(),
        role: form.role.trim(),
        applied_at: form.applied_at ? `${form.applied_at}T12:00:00Z` : undefined,
        status: form.status || "waiting_to_hear_back",
        notes: form.notes.trim() || undefined,
        job_url: form.job_url.trim() || undefined,
      });
      toast.success("Application added! Optimal follow-up in 5 days.");
      setForm({ company: "", role: "", applied_at: new Date().toISOString().slice(0, 10), status: "waiting_to_hear_back", notes: "", job_url: "" });
      setShowForm(false);
      fetchApplications();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkFollowUpSent = async (app: JobApplication) => {
    try {
      await updateJobApplication(userId, app.id, { follow_up_sent: true });
      toast.success(`Marked follow-up sent for ${app.company}`);
      fetchApplications();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleStatusChange = async (app: JobApplication, newStatus: string) => {
    try {
      await updateJobApplication(userId, app.id, { status: newStatus });
      toast.success(`Status updated to ${getStatusLabel(newStatus)}`);
      fetchApplications();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this application?")) return;
    try {
      await deleteJobApplication(userId, id);
      toast.success("Application removed");
      fetchApplications();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const dueNow = applications.filter(
    (a) => getFollowUpStatus(a.optimal_follow_up_at, a.follow_up_sent) === "now"
  );
  const dueSoon = applications.filter(
    (a) => getFollowUpStatus(a.optimal_follow_up_at, a.follow_up_sent) === "soon"
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-primary" />
            Smart Follow-Up
          </h2>
          <p className="text-muted-foreground mt-1">
            Track where you applied and the optimal time to send a follow-up (typically 5–7 days).
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Add Application
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">New Application</CardTitle>
            <CardDescription>We&apos;ll set optimal follow-up to 5 days from your apply date.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  placeholder="e.g. Acme Inc"
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  placeholder="e.g. Software Engineer"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="applied_at">Applied Date</Label>
                <Input
                  id="applied_at"
                  type="date"
                  value={form.applied_at}
                  onChange={(e) => setForm((f) => ({ ...f, applied_at: e.target.value }))}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="job_url">Job URL</Label>
                <Input
                  id="job_url"
                  type="url"
                  placeholder="https://..."
                  value={form.job_url}
                  onChange={(e) => setForm((f) => ({ ...f, job_url: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Optional notes"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {submitting ? " Adding..." : " Add"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {(dueNow.length > 0 || dueSoon.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {dueNow.length > 0 && (
            <Card className="border-amber-500/50 bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-600" />
                  Follow Up Now
                </CardTitle>
                <CardDescription>Optimal time to reach out has arrived.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {dueNow.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/80 border"
                  >
                    <div>
                      <p className="font-medium">{app.company}</p>
                      <p className="text-sm text-muted-foreground">{app.role}</p>
                    </div>
                    <Button size="sm" onClick={() => handleMarkFollowUpSent(app)}>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Mark Sent
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {dueSoon.length > 0 && (
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Coming Up (1–2 days)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dueSoon.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-lg bg-background/80 border">
                    <div>
                      <p className="font-medium">{app.company}</p>
                      <p className="text-sm text-muted-foreground">{app.role}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {app.optimal_follow_up_at && formatRelative(app.optimal_follow_up_at)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Applications</CardTitle>
          <CardDescription>
            {applications.length === 0
              ? "No applications yet. Add one to start tracking."
              : `${applications.length} application${applications.length === 1 ? "" : "s"} tracked`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">Track your job applications and never miss a follow-up.</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Application
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                const status = getFollowUpStatus(app.optimal_follow_up_at, app.follow_up_sent);
                const style = getStatusStyle(app.status);
                return (
                  <div
                    key={app.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border ${style.border} ${style.bg} hover:opacity-90 transition-colors`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{app.company}</p>
                        <Select value={app.status} onValueChange={(v) => handleStatusChange(app, v)}>
                          <SelectTrigger size="sm" className={`w-auto min-w-[140px] text-xs ${style.badge}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {app.follow_up_sent && (
                          <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Follow-up sent
                          </Badge>
                        )}
                        {status === "now" && !app.follow_up_sent && (
                          <Badge className="bg-amber-500 text-amber-950 text-xs">
                            <Bell className="w-3 h-3 mr-1" />
                            Follow up now
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{app.role}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Applied {formatDate(app.applied_at)}
                        </span>
                        {app.optimal_follow_up_at && !app.follow_up_sent && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Follow-up {formatRelative(app.optimal_follow_up_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {app.job_url && (
                        <a
                          href={app.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-muted"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {!app.follow_up_sent && status === "now" && (
                        <Button size="sm" variant="outline" onClick={() => handleMarkFollowUpSent(app)}>
                          Mark Sent
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(app.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
