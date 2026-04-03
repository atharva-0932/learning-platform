"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { CheckCircle, FileText, Sparkles, GraduationCap, Briefcase, Target, Mic, ArrowRight } from "lucide-react";

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
            {/* Hero Header with Stats */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-primary/5 to-blue-500/10 border border-emerald-500/20 p-8">
                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <CheckCircle className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground mb-1">Profile Active</h2>
                                <p className="text-muted-foreground">Your resume has been analyzed and synced</p>
                                {profileData.targetRole && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <Target className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-medium text-primary">{profileData.targetRole}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={onUploadAnother}
                            className="bg-background/50 backdrop-blur-sm"
                        >
                            Update Resume
                        </Button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-background/80 backdrop-blur-sm rounded-xl p-5 border border-border/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-sm text-muted-foreground">Skills</span>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{stats.skills}</p>
                        </div>
                        <div className="bg-background/80 backdrop-blur-sm rounded-xl p-5 border border-border/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <GraduationCap className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-sm text-muted-foreground">Education</span>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{stats.education}</p>
                        </div>
                        <div className="bg-background/80 backdrop-blur-sm rounded-xl p-5 border border-border/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-sm text-muted-foreground">Experience</span>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{stats.experience}</p>
                        </div>
                    </div>
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
                variant="glow"
            />

            {/* Quick Actions - Modern Card Grid */}
            <div>
                <h3 className="text-xl font-semibold mb-4">Continue Your Journey</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <a href="/dashboard/career" className="group">
                        <Card className="h-full border-2 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl group-hover:scale-110 transition-transform">
                                        <Target className="w-7 h-7 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">Career Paths</h4>
                                        <p className="text-xs text-muted-foreground">Discover opportunities</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            </CardContent>
                        </Card>
                    </a>

                    <a href="/dashboard/resume" className="group">
                        <Card className="h-full border-2 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl group-hover:scale-110 transition-transform">
                                        <FileText className="w-7 h-7 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">Resume Builder</h4>
                                        <p className="text-xs text-muted-foreground">Optimize your resume</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            </CardContent>
                        </Card>
                    </a>

                    <a href="/dashboard/interview" className="group">
                        <Card className="h-full border-2 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl group-hover:scale-110 transition-transform">
                                        <Mic className="w-7 h-7 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">Mock Interview</h4>
                                        <p className="text-xs text-muted-foreground">Practice interviews</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            </CardContent>
                        </Card>
                    </a>
                </div>
            </div>
        </div>
    );
}
