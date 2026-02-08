"use client";

import { useEffect, useState } from "react";
import { ResumeUploadForm } from "@/components/dashboard/resume-upload-form";
import { ProfileDataView } from "@/components/dashboard/profile-data-view";

export function DashboardContent({ user, profileData }: { user: any, profileData?: any }) {
  const [mounted, setMounted] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(!profileData);
  const userName = user?.email?.split('@')[0] || "User";

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`p-6 lg:p-10 max-w-[1400px] mx-auto transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Welcome back, <span className="text-primary">{userName}</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          {profileData
            ? "Here's your complete profile overview"
            : "Let's get started by uploading your resume"
          }
        </p>
      </div>

      {/* Main Content Area */}
      <div className="w-full">
        {/* Show existing profile data or upload form */}
        {!showUploadForm && profileData ? (
          <ProfileDataView
            profileData={profileData}
            onUploadAnother={() => setShowUploadForm(true)}
          />
        ) : (
          <div className="max-w-2xl mx-auto">
            <ResumeUploadForm
              userId={user.id}
              onSuccess={() => setShowUploadForm(false)}
            />
          </div>
        )}
      </div>

    </div>
  );
}
