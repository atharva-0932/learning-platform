"use client";

import { useState, useTransition } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateTargetRole } from "@/actions/profile-actions";
import { toast } from "sonner";

interface UpdateTargetRoleFormProps {
  userId: string;
  currentRole: string;
  onSuccess?: (newRole: string) => void;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
  triggerLabel?: string;
  children?: React.ReactNode;
}

export function UpdateTargetRoleForm({
  userId,
  currentRole,
  onSuccess,
  variant = "outline",
  size = "sm",
  triggerLabel,
  children,
}: UpdateTargetRoleFormProps) {
  const label = triggerLabel ?? (currentRole ? "Update Role" : "Set Target Role");
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(currentRole);
  const [isPending, startTransition] = useTransition();

  const handleOpenChange = (next: boolean) => {
    if (next) setRole(currentRole);
    setOpen(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = role.trim();
    if (!trimmed || trimmed === currentRole) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      const result = await updateTargetRole(userId, trimmed);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Target role updated", {
          description: `Your target role is now: ${trimmed}`,
        });
        setOpen(false);
        onSuccess?.(trimmed);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant={variant} size={size}>
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            {label}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Update Target Role</DialogTitle>
            <DialogDescription>
              Change your target role. The roadmap and interview will update accordingly.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="target-role">Target Role</Label>
              <Input
                id="target-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
                disabled={isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !role.trim()}>
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
