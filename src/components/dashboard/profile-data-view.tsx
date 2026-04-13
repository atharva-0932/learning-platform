"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { CheckCircle, FileText, Sparkles, GraduationCap, Briefcase, Target } from "lucide-react";

/** Matches `--primary` (#8b5cf6) + violet-400 for glow menu item halos */
const PROFILE_TAB_GLOW =
    "radial-gradient(circle, rgba(139,92,246,0.24) 0%, rgba(167,139,250,0.12) 48%, rgba(139,92,246,0) 100%)";

interface ProfileDataViewProps {
    profileData: {
        bio?: string;
        skills?: string[];
        education?: any[];
        experience?: any[];
        targetRole?: string;
    };
    onUploadAnother: () => void;
}

export function ProfileDataView({ profileData, onUploadAnother }: ProfileDataViewProps) {
    const stats = {
        skills: profileData.skills?.length || 0,
        education: profileData.education?.length || 0,
        experience: profileData.experience?.length || 0
    };

    const defaultTabId = useMemo(() => {
        if (stats.skills) return "skills";
        if (stats.experience) return "experience";
        if (stats.education) return "education";
        return "skills";
    }, [stats.skills, stats.experience, stats.education]);

    const profileTabs = useMemo(
        () => [
            {
                id: "skills",
                label: "Skills",
                icon: Sparkles,
                gradient: PROFILE_TAB_GLOW,
                iconColor: "text-primary",
                iconHoverClass: "group-hover:text-primary",
                content: (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-5 text-primary" aria-hidden />
                            <h3 className="text-lg font-semibold text-foreground">
                                Skills &amp; expertise
                            </h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Technical and professional capabilities from your resume.
                        </p>
                        {profileData.skills && profileData.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {profileData.skills.map((skill: string, idx: number) => (
                                    <Badge
                                        key={idx}
                                        variant="secondary"
                                        className="px-3 py-1.5 text-sm font-medium hover:bg-primary/15"
                                    >
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                                No skills extracted yet. Update your resume to sync skills here.
                            </p>
                        )}
                    </div>
                ),
            },
            {
                id: "experience",
                label: "Experience",
                icon: Briefcase,
                gradient: PROFILE_TAB_GLOW,
                iconColor: "text-primary",
                iconHoverClass: "group-hover:text-primary",
                content: (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Briefcase className="size-5 text-primary" aria-hidden />
                            <h3 className="text-lg font-semibold text-foreground">Work experience</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Roles and impact from your profile.
                        </p>
                        {profileData.experience && profileData.experience.length > 0 ? (
                            <div className="space-y-4 pt-1">
                                {profileData.experience.map((exp: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="relative border-l-2 border-primary/35 pb-4 pl-6 last:pb-0"
                                    >
                                        <div className="absolute -left-[9px] top-0 size-4 rounded-full border-4 border-background bg-primary" />
                                        <p className="mb-1 text-base font-semibold text-foreground">{exp.role}</p>
                                        <p className="mb-1 text-sm text-muted-foreground">{exp.company}</p>
                                        {exp.duration && (
                                            <p className="mb-2 text-xs font-medium text-muted-foreground">
                                                {exp.duration}
                                            </p>
                                        )}
                                        {exp.description && (
                                            <p className="text-sm leading-relaxed text-muted-foreground">
                                                {exp.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                                No experience entries on file. They will appear here when your resume includes work
                                history.
                            </p>
                        )}
                    </div>
                ),
            },
            {
                id: "education",
                label: "Education",
                icon: GraduationCap,
                gradient: PROFILE_TAB_GLOW,
                iconColor: "text-primary",
                iconHoverClass: "group-hover:text-primary",
                content: (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="size-5 text-primary" aria-hidden />
                            <h3 className="text-lg font-semibold text-foreground">Education</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Degrees and institutions we parsed from your resume.
                        </p>
                        {profileData.education && profileData.education.length > 0 ? (
                            <div className="space-y-4 pt-1">
                                {profileData.education.map((edu: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="relative border-l-2 border-primary/35 pb-4 pl-6 last:pb-0"
                                    >
                                        <div className="absolute -left-[9px] top-0 size-4 rounded-full border-4 border-background bg-primary" />
                                        <p className="mb-1 text-base font-semibold text-foreground">{edu.degree}</p>
                                        <p className="mb-1 text-sm text-muted-foreground">{edu.institution}</p>
                                        {edu.year && (
                                            <p className="text-xs font-medium text-muted-foreground">{edu.year}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                                No education entries yet. Add them by uploading a resume with your academic background.
                            </p>
                        )}
                    </div>
                ),
            },
        ],
        [profileData.skills, profileData.experience, profileData.education],
    );

    return (
        <div className="w-full space-y-8">
            {/* Profile Active banner */}
            <div className="flex flex-col gap-5 rounded-2xl border border-border/60 bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
                        <CheckCircle className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-foreground">Profile Active</h2>
                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-500">
                                Synced
                            </span>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Your resume has been analysed and synced
                        </p>
                        {profileData.targetRole && (
                            <div className="mt-1.5 flex items-center gap-1.5">
                                <Target className="h-3.5 w-3.5 text-primary" />
                                <span className="text-sm font-semibold text-primary">{profileData.targetRole}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-6 sm:flex-shrink-0">
                    {[
                        { icon: Sparkles, label: "Skills", value: stats.skills },
                        { icon: GraduationCap, label: "Education", value: stats.education },
                        { icon: Briefcase, label: "Experience", value: stats.experience },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="text-center">
                            <p className="text-2xl font-extrabold tracking-tight text-foreground">{value}</p>
                            <p className="text-xs text-muted-foreground">{label}</p>
                        </div>
                    ))}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onUploadAnother}
                        className="ml-2 font-medium"
                    >
                        Update
                    </Button>
                </div>
            </div>

            {/* Bio Section - Full Width */}
            {profileData.bio && (
                <Card className="border-l-4 border-l-primary">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <FileText className="w-5 h-5 text-primary" />
                            Professional Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base text-muted-foreground leading-relaxed">{profileData.bio}</p>
                    </CardContent>
                </Card>
            )}

            {/* Skills, experience & education — tabbed */}
            <AnimatedTabs
                key={`${stats.skills}-${stats.education}-${stats.experience}`}
                layoutGroupId="profile-overview-tabs"
                defaultTab={defaultTabId}
                tabs={profileTabs}
                variant="gooey"
            />
        </div>
    );
}
