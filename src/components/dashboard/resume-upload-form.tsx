"use client";

import { useState, useTransition } from "react";
import { Upload, FileText, Loader2, CheckCircle, Sparkles, GraduationCap, Briefcase, Target, BookOpen, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { parseResume, syncProfile, getCareerAssessment } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ResumeUploadFormProps {
    userId: string;
    onSuccess?: () => void;
}

export function ResumeUploadForm({ userId, onSuccess }: ResumeUploadFormProps) {
    const [role, setRole] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isSuccess, setIsSuccess] = useState(false);
    const [parsedStats, setParsedStats] = useState<{
        skills: number;
        education: number;
        experience: number;
        fullData?: any;
    } | null>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === "application/pdf") {
                setFile(selectedFile);
                setIsSuccess(false); // Reset success state on new file
            } else {
                toast.error("Invalid file type", {
                    description: "Please upload a PDF file.",
                });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file || !role) {
            toast.error("Missing fields", {
                description: "Please provide both a target role and a resume.",
            });
            return;
        }

        startTransition(async () => {
            try {
                // 1. Parse Resume
                const parsedData = await parseResume(file);

                if (parsedData.error) {
                    toast.error("Parsing Error", { description: parsedData.error });
                    return;
                }

                // 2. Sync to Database
                await syncProfile(userId, {
                    bio: parsedData.bio,
                    education: parsedData.education,
                    experience: parsedData.experience,
                    goals: { target_role: role },
                    resume_text: parsedData.raw_text
                }, parsedData.skills || []);

                // 3. Trigger Career Assessment
                await getCareerAssessment(userId, role, parsedData.raw_text);

                // 4. Success State
                setParsedStats({
                    skills: parsedData.skills?.length || 0,
                    education: parsedData.education?.length || 0,
                    experience: parsedData.experience?.length || 0,
                    fullData: parsedData
                });
                setIsSuccess(true);
                toast.success("Profile & Career Assessment Ready", {
                    description: `Successfully analyzed resume and generated career insights for ${role}.`,
                });

                router.refresh();
                if (onSuccess) onSuccess();

            } catch (error) {
                console.error(error);
                toast.error("Error", {
                    description: "Failed to process resume. Please try again.",
                });
            }
        });
    };

    if (isSuccess && parsedStats) {
        return (
            <div className="w-full space-y-6">
                {/* Success Header */}
                <Card className="w-full border-emerald-500/50 bg-emerald-500/5">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-emerald-900">Profile Synced Successfully!</h3>
                            <p className="text-sm text-emerald-700">Your resume has been analyzed and your profile updated.</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                            <div className="p-2 bg-background rounded border">
                                <span className="block font-bold text-lg">{parsedStats.skills}</span>
                                <span className="text-muted-foreground text-xs">Skills</span>
                            </div>
                            <div className="p-2 bg-background rounded border">
                                <span className="block font-bold text-lg">{parsedStats.education}</span>
                                <span className="text-muted-foreground text-xs">Education</span>
                            </div>
                            <div className="p-2 bg-background rounded border">
                                <span className="block font-bold text-lg">{parsedStats.experience}</span>
                                <span className="text-muted-foreground text-xs">Experience</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Detailed Extracted Data */}
                {parsedStats.fullData && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Extracted Information</CardTitle>
                            <CardDescription>Review the data we extracted from your resume</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Bio */}
                            {parsedStats.fullData.bio && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-primary" />
                                        Professional Summary
                                    </h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{parsedStats.fullData.bio}</p>
                                </div>
                            )}

                            {/* Skills */}
                            {parsedStats.fullData.skills && parsedStats.fullData.skills.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                        Skills ({parsedStats.fullData.skills.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {parsedStats.fullData.skills.map((skill: string, idx: number) => (
                                            <Badge key={idx} variant="secondary" className="px-3 py-1">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Education */}
                            {parsedStats.fullData.education && parsedStats.fullData.education.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4 text-primary" />
                                        Education
                                    </h4>
                                    <div className="space-y-3">
                                        {parsedStats.fullData.education.map((edu: any, idx: number) => (
                                            <div key={idx} className="border-l-2 border-primary/30 pl-4 py-2">
                                                <p className="font-medium text-sm">{edu.degree}</p>
                                                <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                                {edu.year && <p className="text-xs text-muted-foreground">{edu.year}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Experience */}
                            {parsedStats.fullData.experience && parsedStats.fullData.experience.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-primary" />
                                        Experience
                                    </h4>
                                    <div className="space-y-3">
                                        {parsedStats.fullData.experience.map((exp: any, idx: number) => (
                                            <div key={idx} className="border-l-2 border-primary/30 pl-4 py-2">
                                                <p className="font-medium text-sm">{exp.role}</p>
                                                <p className="text-sm text-muted-foreground">{exp.company}</p>
                                                {exp.duration && <p className="text-xs text-muted-foreground mb-1">{exp.duration}</p>}
                                                {exp.description && <p className="text-xs text-muted-foreground">{exp.description}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Navigation Cards */}
                <Card>
                    <CardHeader>
                        <CardTitle>What's Next?</CardTitle>
                        <CardDescription>Continue your journey with these features</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <a href="/dashboard/career" className="block group">
                                <div className="border rounded-lg p-4 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                            <Target className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm mb-1">Career Recommender</h4>
                                            <p className="text-xs text-muted-foreground">Get personalized career path recommendations</p>
                                        </div>
                                    </div>
                                </div>
                            </a>

                            <a href="/dashboard/resume" className="block group">
                                <div className="border rounded-lg p-4 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                            <FileText className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm mb-1">Resume Builder</h4>
                                            <p className="text-xs text-muted-foreground">Create and optimize your resume</p>
                                        </div>
                                    </div>
                                </div>
                            </a>

                            <a href="/dashboard/learning" className="block group">
                                <div className="border rounded-lg p-4 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                            <BookOpen className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm mb-1">Learning Academy</h4>
                                            <p className="text-xs text-muted-foreground">Upskill with curated learning paths</p>
                                        </div>
                                    </div>
                                </div>
                            </a>

                            <a href="/dashboard/interview" className="block group">
                                <div className="border rounded-lg p-4 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                            <Mic className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm mb-1">Mock Interview</h4>
                                            <p className="text-xs text-muted-foreground">Practice with AI-powered interviews</p>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </CardContent>
                </Card>

                {/* Upload Another Button */}
                <Button
                    variant="outline"
                    onClick={() => { setIsSuccess(false); setFile(null); setRole(""); setParsedStats(null); }}
                    className="w-full"
                >
                    Upload Another Resume
                </Button>
            </div>
        );
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Resume Action Center</CardTitle>
                <CardDescription>
                    Enter your target role and upload your resume to auto-sync your profile.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="role">Target Role</Label>
                        <Input
                            id="role"
                            placeholder="e.g. Senior Frontend Engineer"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            disabled={isPending}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="resume">Resume (PDF)</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                id="resume"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                disabled={isPending}
                                className="cursor-pointer"
                            />
                        </div>
                        {file && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                                <FileText className="w-4 h-4" />
                                {file.name}
                            </p>
                        )}
                    </div>

                    <Button type="submit" disabled={isPending || !file || !role} className="w-full">
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing & Syncing...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Sync Profile
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
