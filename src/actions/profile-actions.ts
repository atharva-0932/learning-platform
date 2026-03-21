"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateTargetRole(userId: string, targetRole: string) {
  const trimmed = targetRole.trim();
  if (!trimmed) {
    return { error: "Target role is required" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return { error: "Unauthorized" };
  }

  const goals = { target_role: trimmed };

  const { data: existing } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", userId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("profiles")
      .update({
        goals,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Update target role error:", error);
      return { error: "Failed to update target role" };
    }
  } else {
    const { error } = await supabase.from("profiles").insert({
      user_id: userId,
      goals,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Insert profile error:", error);
      return { error: "Failed to update target role" };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/career");
  revalidatePath("/dashboard/interview");
  return { success: true };
}
