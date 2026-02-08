"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, Sparkles, GraduationCap, Briefcase, Target, BookOpen, Mic, ArrowRight } from "lucide-react";

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

            {/* Skills Section - Full Width */}
            {profileData.skills && profileData.skills.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Sparkles className="w-5 h-5 text-primary" />
                            Skills & Expertise
                        </CardTitle>
                        <CardDescription>Your technical and professional capabilities</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            {profileData.skills.map((skill: string, idx: number) => (
                                <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="px-4 py-2 text-sm font-medium hover:bg-primary/20 transition-colors"
                                >
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Education & Experience - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Education */}
                {profileData.education && profileData.education.length > 0 && (
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-primary" />
                                Education
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {profileData.education.map((edu: any, idx: number) => (
                                    <div key={idx} className="relative pl-6 pb-4 border-l-2 border-primary/30 last:pb-0">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background"></div>
                                        <p className="font-semibold text-base mb-1">{edu.degree}</p>
                                        <p className="text-sm text-muted-foreground mb-1">{edu.institution}</p>
                                        {edu.year && (
                                            <p className="text-xs text-muted-foreground font-medium">{edu.year}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Experience */}
                {profileData.experience && profileData.experience.length > 0 && (
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-primary" />
                                Experience
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {profileData.experience.map((exp: any, idx: number) => (
                                    <div key={idx} className="relative pl-6 pb-4 border-l-2 border-primary/30 last:pb-0">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background"></div>
                                        <p className="font-semibold text-base mb-1">{exp.role}</p>
                                        <p className="text-sm text-muted-foreground mb-1">{exp.company}</p>
                                        {exp.duration && (
                                            <p className="text-xs text-muted-foreground font-medium mb-2">{exp.duration}</p>
                                        )}
                                        {exp.description && (
                                            <p className="text-sm text-muted-foreground">{exp.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Quick Actions - Modern Card Grid */}
            <div>
                <h3 className="text-xl font-semibold mb-4">Continue Your Journey</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                    <a href="/dashboard/learning" className="group">
                        <Card className="h-full border-2 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl group-hover:scale-110 transition-transform">
                                        <BookOpen className="w-7 h-7 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">Learning Paths</h4>
                                        <p className="text-xs text-muted-foreground">Upskill yourself</p>
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
