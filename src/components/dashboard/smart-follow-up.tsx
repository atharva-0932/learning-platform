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
  Pencil,
  TrendingUp,
  XCircle,
  Trophy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import { FollowUpButton } from "@/components/dashboard/follow-up-button";

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

const STATUS_BADGE: Record<string, string> = {
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
  ghosted: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  withdrawn: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  waiting_to_hear_back: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  applied: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  interview_called: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  interviewing: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  shortlisted: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  offer: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

function getStatusBadge(status: string) {
  return STATUS_BADGE[status] ?? STATUS_BADGE.applied;
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
  recruiter_email: string | null;
  last_follow_up_at: string | null;
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

const ACTIVE_STATUSES = new Set(["applied", "waiting_to_hear_back", "interview_called", "interviewing", "shortlisted"]);
const CLOSED_STATUSES = new Set(["rejected", "withdrawn", "ghosted", "offer"]);

function RecruiterEmailField({
  app,
  userId,
  onUpdate,
}: {
  app: JobApplication;
  userId: string;
  onUpdate: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(app.recruiter_email || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = value.trim();
    if (trimmed === (app.recruiter_email || "")) { setEditing(false); return; }
    setSaving(true);
    try {
      await updateJobApplication(userId, app.id, { recruiter_email: trimmed });
      toast.success("Recruiter email updated");
      onUpdate();
      setEditing(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="mt-1 flex items-center gap-1">
        <Input
          type="email"
          placeholder="recruiter@company.com"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
          className="h-6 text-xs"
          autoFocus
          disabled={saving}
        />
      </div>
    );
  }

  return (
    <button type="button" onClick={() => setEditing(true)} className="mt-1 text-left text-xs text-muted-foreground hover:text-foreground transition-colors">
      {app.recruiter_email ? (
        <span className="flex items-center gap-1">
          <span className="truncate max-w-[140px]">{app.recruiter_email}</span>
          <Pencil className="w-2.5 h-2.5 opacity-50 flex-shrink-0" />
        </span>
      ) : (
        <span className="flex items-center gap-1 text-primary/60">
          <Plus className="w-2.5 h-2.5" />
          Add recruiter email
        </span>
      )}
    </button>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatRelative(iso: string) {
  const now = new Date();
  const d = new Date(iso);
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return `In ${diffDays}d`;
}

interface KanbanCardProps {
  app: JobApplication;
  userId: string;
  onStatusChange: (app: JobApplication, status: string) => void;
  onMarkFollowUpSent: (app: JobApplication) => void;
  onDelete: (id: string) => void;
  onUpdate: () => void;
}

function KanbanCard({ app, userId, onStatusChange, onMarkFollowUpSent, onDelete, onUpdate }: KanbanCardProps) {
  const followUpStatus = getFollowUpStatus(app.optimal_follow_up_at, app.follow_up_sent);
  const badgeCls = getStatusBadge(app.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group rounded-xl border border-border/60 bg-card p-4 hover:border-border transition-all"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-sm font-semibold text-foreground leading-tight">{app.company}</p>
        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {app.job_url && (
            <a href={app.job_url} target="_blank" rel="noopener noreferrer"
              className="rounded p-1 hover:bg-muted text-muted-foreground">
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <button type="button" onClick={() => onDelete(app.id)}
            className="rounded p-1 hover:bg-destructive/10 text-destructive">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-2 truncate">{app.role}</p>

      {/* Status select */}
      <Select value={app.status} onValueChange={(v) => onStatusChange(app, v)}>
        <SelectTrigger size="sm" className={`h-6 w-full text-[10px] border ${badgeCls} mb-2`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Recruiter email */}
      <RecruiterEmailField app={app} userId={userId} onUpdate={onUpdate} />

      {/* Dates + follow-up */}
      <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-2.5 w-2.5" />
          {formatDate(app.applied_at)}
        </span>
        {app.optimal_follow_up_at && !app.follow_up_sent && (
          <span className={`flex items-center gap-1 ${followUpStatus === "now" ? "text-amber-400 font-semibold" : ""}`}>
            <Clock className="h-2.5 w-2.5" />
            {formatRelative(app.optimal_follow_up_at)}
          </span>
        )}
        {app.follow_up_sent && (
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Sent
          </span>
        )}
      </div>

      {/* Follow-up actions */}
      {!app.follow_up_sent && (followUpStatus === "now" || followUpStatus === "soon") && (
        <div className="mt-2 flex gap-1.5">
          <FollowUpButton
            userId={userId}
            jobId={app.id}
            recruiterEmail={app.recruiter_email}
            companyName={app.company}
            jobTitle={app.role}
            onSuccess={onUpdate}
          />
          {followUpStatus === "now" && (
            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2"
              onClick={() => onMarkFollowUpSent(app)}>
              Mark sent
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

const KANBAN_COLUMNS = [
  {
    id: "active",
    label: "Active",
    icon: TrendingUp,
    headerColor: "text-sky-400",
    borderColor: "border-sky-500/30",
    headerBg: "bg-sky-500/8",
    dot: "bg-sky-400",
    filter: (app: JobApplication) => ACTIVE_STATUSES.has(app.status),
  },
  {
    id: "followup",
    label: "Follow Up",
    icon: Bell,
    headerColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    headerBg: "bg-amber-500/8",
    dot: "bg-amber-400",
    filter: (app: JobApplication) =>
      !app.follow_up_sent &&
      app.optimal_follow_up_at !== null &&
      (getFollowUpStatus(app.optimal_follow_up_at, app.follow_up_sent) === "now" ||
        getFollowUpStatus(app.optimal_follow_up_at, app.follow_up_sent) === "soon"),
  },
  {
    id: "closed",
    label: "Closed",
    icon: XCircle,
    headerColor: "text-muted-foreground",
    borderColor: "border-border/50",
    headerBg: "bg-muted/20",
    dot: "bg-muted-foreground",
    filter: (app: JobApplication) => CLOSED_STATUSES.has(app.status),
  },
];

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
    recruiter_email: "",
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

  useEffect(() => { fetchApplications(); }, [userId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim()) { toast.error("Company and role are required"); return; }
    setSubmitting(true);
    try {
      await createJobApplication(userId, {
        company: form.company.trim(),
        role: form.role.trim(),
        applied_at: form.applied_at ? `${form.applied_at}T12:00:00Z` : undefined,
        status: form.status || "waiting_to_hear_back",
        notes: form.notes.trim() || undefined,
        job_url: form.job_url.trim() || undefined,
        recruiter_email: form.recruiter_email.trim() || undefined,
      });
      toast.success("Application added! Optimal follow-up in 5 days.");
      setForm({ company: "", role: "", applied_at: new Date().toISOString().slice(0, 10), status: "waiting_to_hear_back", notes: "", job_url: "", recruiter_email: "" });
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
    } catch (err: any) { toast.error(err.message); }
  };

  const handleStatusChange = async (app: JobApplication, newStatus: string) => {
    try {
      await updateJobApplication(userId, app.id, { status: newStatus });
      toast.success(`Status updated to ${getStatusLabel(newStatus)}`);
      fetchApplications();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this application?")) return;
    try {
      await deleteJobApplication(userId, id);
      toast.success("Application removed");
      fetchApplications();
    } catch (err: any) { toast.error(err.message); }
  };

  const dueNow = applications.filter((a) => getFollowUpStatus(a.optimal_follow_up_at, a.follow_up_sent) === "now");
  const dueSoon = applications.filter((a) => getFollowUpStatus(a.optimal_follow_up_at, a.follow_up_sent) === "soon");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-foreground">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            Smart Follow-Up
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track applications and follow up at exactly the right time.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="shrink-0 gap-2">
          <Plus className="h-4 w-4" />
          Add Application
        </Button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <Card className="border-primary/30 bg-card">
              <CardHeader>
                <CardTitle className="text-base">New Application</CardTitle>
                <CardDescription>We&apos;ll set optimal follow-up to 5 days from your apply date.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="company">Company *</Label>
                    <Input id="company" placeholder="e.g. Acme Inc" value={form.company}
                      onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <Input id="role" placeholder="e.g. Software Engineer" value={form.role}
                      onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="applied_at">Applied Date</Label>
                    <Input id="applied_at" type="date" value={form.applied_at}
                      onChange={(e) => setForm((f) => ({ ...f, applied_at: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="job_url">Job URL</Label>
                    <Input id="job_url" type="url" placeholder="https://..." value={form.job_url}
                      onChange={(e) => setForm((f) => ({ ...f, job_url: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="recruiter_email">Recruiter Email</Label>
                    <Input id="recruiter_email" type="email" placeholder="recruiter@company.com"
                      value={form.recruiter_email}
                      onChange={(e) => setForm((f) => ({ ...f, recruiter_email: e.target.value }))} />
                    <p className="mt-1 text-xs text-muted-foreground">Required for automated follow-up emails</p>
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input id="notes" placeholder="Optional notes" value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2 flex gap-2">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      {submitting ? " Adding..." : " Add"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Urgent follow-up alerts */}
      {(dueNow.length > 0 || dueSoon.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {dueNow.length > 0 && (
            <div className="rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                <Bell className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-400">Follow Up Now</span>
                <span className="ml-auto rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                  {dueNow.length}
                </span>
              </div>
              <div className="space-y-2">
                {dueNow.map((app) => (
                  <div key={app.id} className="flex items-center justify-between gap-2 rounded-lg border border-amber-500/20 bg-background/60 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{app.company}</p>
                      <p className="text-xs text-muted-foreground truncate">{app.role}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <FollowUpButton userId={userId} jobId={app.id} recruiterEmail={app.recruiter_email}
                        companyName={app.company} jobTitle={app.role} onSuccess={fetchApplications} />
                      <Button size="sm" variant="ghost" className="h-7 text-xs"
                        onClick={() => handleMarkFollowUpSent(app)}>
                        <CheckCircle2 className="h-3 w-3 mr-1" />Mark sent
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {dueSoon.length > 0 && (
            <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/8 to-blue-500/3 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-400">Coming Up</span>
                <span className="ml-auto rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                  {dueSoon.length}
                </span>
              </div>
              <div className="space-y-2">
                {dueSoon.map((app) => (
                  <div key={app.id} className="flex items-center justify-between gap-2 rounded-lg border border-blue-500/15 bg-background/60 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{app.company}</p>
                      <p className="text-xs text-muted-foreground">{app.role}</p>
                    </div>
                    <span className="text-xs text-blue-400 flex-shrink-0">
                      {app.optimal_follow_up_at && formatRelative(app.optimal_follow_up_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Kanban board */}
      {applications.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Briefcase className="h-7 w-7 text-primary" />
          </div>
          <p className="mb-1 text-base font-semibold text-foreground">No applications yet</p>
          <p className="mb-5 text-sm text-muted-foreground">Track your job applications and never miss a follow-up.</p>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Your First Application
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              {applications.length} Application{applications.length !== 1 ? "s" : ""} Tracked
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {KANBAN_COLUMNS.map((col) => {
              const colApps = applications.filter(col.filter);
              return (
                <div key={col.id} className={`rounded-2xl border ${col.borderColor} ${col.headerBg} p-1`}>
                  {/* Column header */}
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <span className={`h-2 w-2 flex-shrink-0 rounded-full ${col.dot}`} />
                    <col.icon className={`h-4 w-4 ${col.headerColor}`} />
                    <span className={`text-sm font-semibold ${col.headerColor}`}>{col.label}</span>
                    <span className="ml-auto rounded-full bg-background/60 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                      {colApps.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2 px-2 pb-3">
                    <AnimatePresence>
                      {colApps.length === 0 ? (
                        <p className="py-6 text-center text-xs text-muted-foreground/60">No applications here</p>
                      ) : (
                        colApps.map((app) => (
                          <KanbanCard
                            key={app.id}
                            app={app}
                            userId={userId}
                            onStatusChange={handleStatusChange}
                            onMarkFollowUpSent={handleMarkFollowUpSent}
                            onDelete={handleDelete}
                            onUpdate={fetchApplications}
                          />
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
