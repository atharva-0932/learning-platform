"use client";

import { useState, useRef, useEffect } from "react";
import {
    FileText,
    Download,
    Plus,
    Trash2,
    Save,
    CheckCircle,
    Briefcase,
    GraduationCap,
    User,
    Loader2,
    Lightbulb,
    Trophy,
    Award,
    Sparkles,
    Layers,
    Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { syncProfile } from "@/lib/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Experience {
    role: string;
    company: string;
    location: string;
    duration: string;
    description: string;
}

interface Education {
    degree: string;
    institution: string;
    year: string;
}

interface Project {
    name: string;
    location?: string;
    duration?: string;
    description: string;
    link?: string;
}

interface Achievement {
    title: string;
    description: string;
}

interface Certification {
    name: string;
    issuer: string;
    year: string;
}

interface ResumeData {
    fullName: string;
    bio: string;
    country: string;
    email: string;
    linkedin: string;
    experience: Experience[];
    education: Education[];
    projects: Project[];
    achievements: Achievement[];
    certifications: Certification[];
    skills: string[];
}

export function ResumeBuilder({ user, initialProfile }: { user: any; initialProfile: any }) {
    const [data, setData] = useState<ResumeData>({
        fullName: initialProfile?.full_name || "",
        bio: initialProfile?.bio || "",
        country: initialProfile?.country || "",
        email: initialProfile?.email || "",
        linkedin: initialProfile?.linkedin_url || "",
        experience: Array.isArray(initialProfile?.experience) ? initialProfile.experience : [],
        education: Array.isArray(initialProfile?.education) ? initialProfile.education : [],
        projects: Array.isArray(initialProfile?.projects) ? initialProfile.projects : [],
        achievements: Array.isArray(initialProfile?.achievements) ? initialProfile.achievements : [],
        certifications: Array.isArray(initialProfile?.certifications) ? initialProfile.certifications : [],
        skills: Array.isArray(initialProfile?.skills) ? initialProfile.skills : []
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [containerWidth, setContainerWidth] = useState(800);
    const previewRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<HTMLDivElement>(null); // Ref for Editor scroll sync

    // A4 Dimensions at 96dpi
    const A4_WIDTH = 794;
    const A4_HEIGHT = 1123;
    const PADDING_OFFSET = 32; // Tighter padding for more space

    // Measure container width for dynamic scaling
    useEffect(() => {
        if (!containerRef.current) return;

        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth);
            }
        };

        const observer = new ResizeObserver(updateWidth);
        observer.observe(containerRef.current);
        updateWidth();

        return () => observer.disconnect();
    }, []);

    // Synced Scrolling Logic
    useEffect(() => {
        const editor = editorRef.current;
        const preview = containerRef.current;
        if (!editor || !preview) return;

        const handleScroll = () => {
            // Calculate scroll percentage of editor
            const scrollPercent = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
            // Apply to preview
            preview.scrollTop = scrollPercent * (preview.scrollHeight - preview.clientHeight);
        };

        editor.addEventListener("scroll", handleScroll);
        return () => editor.removeEventListener("scroll", handleScroll);
    }, []);

    // Aggressive scaling: fill the width minus small margin
    const scale = Math.max((containerWidth - PADDING_OFFSET) / A4_WIDTH, 0.3);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await syncProfile(user.id, {
                full_name: data.fullName,
                bio: data.bio,
                country: data.country,
                email: data.email,
                linkedin_url: data.linkedin,
                education: data.education,
                experience: data.experience,
                projects: data.projects,
                achievements: data.achievements,
                certifications: data.certifications,
            }, data.skills);
            toast.success("Resume Saved", {
                description: "Your changes have been synced to your profile."
            });
        } catch (error) {
            toast.error("Save Failed", {
                description: "Could not sync changes to the database."
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = async () => {
        if (!previewRef.current) return;
        setIsExporting(true);
        try {
            const canvas = await html2canvas(previewRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: 794 // Exact standard A4 width at 96dpi
            } as any);
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Add image and scale to fit perfectly on one page
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${data.fullName.replace(/\s+/g, "_")}_Resume.pdf`);
            toast.success("Resume Downloaded");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Format error", { description: "Failed to generate PDF." });
        } finally {
            setIsExporting(false);
        }
    };

    const addExperience = () => {
        setData({
            ...data,
            experience: [...data.experience, { role: "", company: "", location: "", duration: "", description: "" }]
        });
    };

    const updateExperience = (index: number, field: keyof Experience, value: string) => {
        const newExp = [...data.experience];
        newExp[index] = { ...newExp[index], [field]: value };
        setData({ ...data, experience: newExp });
    };

    const removeExperience = (index: number) => {
        setData({
            ...data,
            experience: data.experience.filter((_, i) => i !== index)
        });
    };

    const addEducation = () => {
        setData({
            ...data,
            education: [...data.education, { degree: "", institution: "", year: "" }]
        });
    };

    const updateEducation = (index: number, field: keyof Education, value: string) => {
        const newEdu = [...data.education];
        newEdu[index] = { ...newEdu[index], [field]: value };
        setData({ ...data, education: newEdu });
    };

    const removeEducation = (index: number) => {
        setData({
            ...data,
            education: data.education.filter((_, i) => i !== index)
        });
    };

    const addProject = () => {
        setData({
            ...data,
            projects: [...data.projects, { name: "", location: "", duration: "", description: "", link: "" }]
        });
    };

    const updateProject = (index: number, field: keyof Project, value: string) => {
        const newProj = [...data.projects];
        newProj[index] = { ...newProj[index], [field]: value };
        setData({ ...data, projects: newProj });
    };

    const removeProject = (index: number) => {
        setData({ ...data, projects: data.projects.filter((_, i) => i !== index) });
    };

    const addAchievement = () => {
        setData({
            ...data,
            achievements: [...data.achievements, { title: "", description: "" }]
        });
    };

    const updateAchievement = (index: number, field: keyof Achievement, value: string) => {
        const newAch = [...data.achievements];
        newAch[index] = { ...newAch[index], [field]: value };
        setData({ ...data, achievements: newAch });
    };

    const removeAchievement = (index: number) => {
        setData({ ...data, achievements: data.achievements.filter((_, i) => i !== index) });
    };

    const addCertification = () => {
        setData({
            ...data,
            certifications: [...data.certifications, { name: "", issuer: "", year: "" }]
        });
    };

    const updateCertification = (index: number, field: keyof Certification, value: string) => {
        const newCert = [...data.certifications];
        newCert[index] = { ...newCert[index], [field]: value };
        setData({ ...data, certifications: newCert });
    };

    const removeCertification = (index: number) => {
        setData({ ...data, certifications: data.certifications.filter((_, i) => i !== index) });
    };

    const addSkill = (skill: string) => {
        if (skill && !data.skills.includes(skill)) {
            setData({ ...data, skills: [...data.skills, skill] });
        }
    };

    const removeSkill = (skill: string) => {
        setData({ ...data, skills: data.skills.filter(s => s !== skill) });
    };

    return (
        <div className="flex flex-col lg:flex-row h-full w-full bg-background overflow-hidden">
            {/* Left Side: Editor Studio */}
            <div className="flex-1 flex flex-col min-w-0 border-r bg-card/50 backdrop-blur-sm relative z-20">
                <header className="flex items-center justify-between px-6 py-4 border-b bg-card/80">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Content Editor
                        </h2>
                        <p className="text-xs text-muted-foreground">Draft your professional story</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="h-8 px-3 text-xs"
                        >
                            {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2 text-primary" />}
                            Sync
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleExport}
                            disabled={isExporting}
                            className="h-8 px-3 text-xs bg-primary hover:bg-primary/90 shadow-sm"
                        >
                            {isExporting ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Download className="w-3 h-3 mr-2" />}
                            Export
                        </Button>
                    </div>
                </header>

                <div
                    ref={editorRef}
                    className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-12 scrollbar-none hover:scrollbar-thin transition-all"
                >
                    {/* Personal Info */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 text-primary/80 group">
                            <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <h3 className="font-bold uppercase text-xs tracking-[0.2em]">Contact Information</h3>
                        </div>
                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-[11px] uppercase tracking-wider text-muted-foreground">Full Name</Label>
                                <Input
                                    id="fullName"
                                    value={data.fullName}
                                    onChange={(e) => setData({ ...data, fullName: e.target.value })}
                                    placeholder="Enter your full name"
                                    className="bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[11px] uppercase tracking-wider text-muted-foreground">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData({ ...data, email: e.target.value })}
                                        placeholder="email@example.com"
                                        className="bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country" className="text-[11px] uppercase tracking-wider text-muted-foreground">Country</Label>
                                    <Input
                                        id="country"
                                        value={data.country}
                                        onChange={(e) => setData({ ...data, country: e.target.value })}
                                        placeholder="City, Country"
                                        className="bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="linkedin" className="text-[11px] uppercase tracking-wider text-muted-foreground">LinkedIn URL</Label>
                                <Input
                                    id="linkedin"
                                    value={data.linkedin}
                                    onChange={(e) => setData({ ...data, linkedin: e.target.value })}
                                    placeholder="linkedin.com/in/profile"
                                    className="bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio" className="text-[11px] uppercase tracking-wider text-muted-foreground">Executive Summary</Label>
                                <Textarea
                                    id="bio"
                                    value={data.bio}
                                    onChange={(e) => setData({ ...data, bio: e.target.value })}
                                    placeholder="Briefly describe your professional value..."
                                    className="min-h-[120px] bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors resize-none leading-relaxed"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Experience */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-primary/80 group">
                                <Briefcase className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold uppercase text-xs tracking-[0.2em]">Work Experience</h3>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addExperience}
                                className="h-7 text-[10px] uppercase tracking-wider bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
                            >
                                <Plus className="w-3 h-3 mr-1" /> Add Role
                            </Button>
                        </div>

                        <Accordion type="multiple" defaultValue={["exp-0"]} className="space-y-4">
                            {data.experience.map((exp, idx) => (
                                <AccordionItem key={idx} value={`exp-${idx}`} className="border rounded-xl px-2 bg-background/30 overflow-hidden">
                                    <AccordionTrigger className="hover:no-underline py-4 px-4 group">
                                        <div className="flex items-center gap-3 text-left">
                                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                <Briefcase className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm leading-tight">{exp.role || "New Position"}</p>
                                                {exp.company && <p className="text-[11px] text-muted-foreground">{exp.company}</p>}
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-5 pb-6 px-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase text-muted-foreground">Job Title</Label>
                                                <Input value={exp.role} onChange={(e) => updateExperience(idx, "role", e.target.value)} className="h-9 text-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase text-muted-foreground">Employer</Label>
                                                <Input value={exp.company} onChange={(e) => updateExperience(idx, "company", e.target.value)} className="h-9 text-sm" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase text-muted-foreground">Period</Label>
                                                <Input value={exp.duration} onChange={(e) => updateExperience(idx, "duration", e.target.value)} placeholder="e.g. Jan 2020 - Present" className="h-9 text-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase text-muted-foreground">Location</Label>
                                                <Input value={exp.location} onChange={(e) => updateExperience(idx, "location", e.target.value)} placeholder="e.g. New York, NY" className="h-9 text-sm" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase text-muted-foreground">Contributions & Achievements</Label>
                                            <Textarea
                                                value={exp.description}
                                                onChange={(e) => updateExperience(idx, "description", e.target.value)}
                                                className="min-h-[100px] text-sm leading-relaxed"
                                                placeholder="What did you accomplish in this role?"
                                            />
                                        </div>
                                        <div className="pt-2">
                                            <Button variant="ghost" size="sm" onClick={() => removeExperience(idx)} className="w-full text-destructive hover:text-destructive hover:bg-destructive/5 text-[11px] uppercase tracking-wider">
                                                <Trash2 className="w-3 h-3 mr-2" /> Delete Entry
                                            </Button>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </section>

                    {/* Education */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-primary/80 group">
                                <GraduationCap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold uppercase text-xs tracking-[0.2em]">Academic History</h3>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addEducation}
                                className="h-7 text-[10px] uppercase tracking-wider bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
                            >
                                <Plus className="w-3 h-3 mr-1" /> Add Degree
                            </Button>
                        </div>
                        <Accordion type="multiple" className="space-y-4">
                            {data.education.map((edu, idx) => (
                                <AccordionItem key={idx} value={`edu-${idx}`} className="border rounded-xl px-2 bg-background/30 overflow-hidden">
                                    <AccordionTrigger className="hover:no-underline py-4 px-4 group">
                                        <div className="flex items-center gap-3 text-left">
                                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                <GraduationCap className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm leading-tight">{edu.degree || "New Degree"}</p>
                                                {edu.institution && <p className="text-[11px] text-muted-foreground">{edu.institution}</p>}
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-5 pb-6 px-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase text-muted-foreground">Degree / Major</Label>
                                                <Input value={edu.degree} onChange={(e) => updateEducation(idx, "degree", e.target.value)} className="h-9 text-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase text-muted-foreground">University / Institution</Label>
                                                <Input value={edu.institution} onChange={(e) => updateEducation(idx, "institution", e.target.value)} className="h-9 text-sm" />
                                            </div>
                                        </div>
                                        <div className="w-full md:w-1/3 space-y-2">
                                            <Label className="text-[10px] uppercase text-muted-foreground">Graduation Year</Label>
                                            <Input value={edu.year} onChange={(e) => updateEducation(idx, "year", e.target.value)} placeholder="2023" className="h-9 text-sm" />
                                        </div>
                                        <div className="pt-2">
                                            <Button variant="ghost" size="sm" onClick={() => removeEducation(idx)} className="w-full text-destructive hover:text-destructive hover:bg-destructive/5 text-[11px] uppercase tracking-wider">
                                                <Trash2 className="w-3 h-3 mr-2" /> Delete Entry
                                            </Button>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </section>

                    {/* Projects */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-primary/80 group">
                                <Layers className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold uppercase text-xs tracking-[0.2em]">Featured Projects</h3>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addProject}
                                className="h-7 text-[10px] uppercase tracking-wider bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
                            >
                                <Plus className="w-3 h-3 mr-1" /> Add Project
                            </Button>
                        </div>

                        <Accordion type="multiple" className="space-y-4">
                            {data.projects.map((project, idx) => (
                                <AccordionItem key={idx} value={`proj-${idx}`} className="border rounded-xl px-2 bg-background/30 overflow-hidden">
                                    <AccordionTrigger className="hover:no-underline py-4 px-4 group">
                                        <div className="flex items-center gap-3 text-left">
                                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                <Layers className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm leading-tight">{project.name || "New Project"}</p>
                                                {project.duration && <p className="text-[11px] text-muted-foreground">{project.duration}</p>}
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-5 pb-6 px-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase text-muted-foreground">Project Name</Label>
                                            <Input value={project.name} onChange={(e) => updateProject(idx, "name", e.target.value)} className="h-9 text-sm" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase text-muted-foreground">Timeline</Label>
                                                <Input value={project.duration} onChange={(e) => updateProject(idx, "duration", e.target.value)} placeholder="e.g. Dec 2023" className="h-9 text-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase text-muted-foreground">Location</Label>
                                                <Input value={project.location} onChange={(e) => updateProject(idx, "location", e.target.value)} placeholder="e.g. Remote" className="h-9 text-sm" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase text-muted-foreground">Description</Label>
                                            <Textarea
                                                value={project.description}
                                                onChange={(e) => updateProject(idx, "description", e.target.value)}
                                                className="min-h-[100px] text-sm leading-relaxed"
                                                placeholder="What did you build? Use new lines for bullets."
                                            />
                                        </div>
                                        <div className="pt-2">
                                            <Button variant="ghost" size="sm" onClick={() => removeProject(idx)} className="w-full text-destructive hover:text-destructive hover:bg-destructive/5 text-[11px] uppercase tracking-wider">
                                                <Trash2 className="w-3 h-3 mr-2" /> Delete Project
                                            </Button>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </section>

                    {/* Skills */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 text-primary/80 group">
                            <Wrench className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <h3 className="font-bold uppercase text-xs tracking-[0.2em]">Technical Skills</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add a skill (e.g. React, Python)"
                                    className="bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-colors"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            const input = e.currentTarget;
                                            addSkill(input.value);
                                            input.value = "";
                                        }
                                    }}
                                />
                                <Button
                                    variant="outline"
                                    className="border-primary/20 hover:bg-primary/5"
                                    onClick={(e) => {
                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                        addSkill(input.value);
                                        input.value = "";
                                    }}
                                >
                                    Add
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {data.skills.map((skill, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-full group hover:border-primary/30 transition-all">
                                        <span className="text-xs font-semibold text-primary/80">{skill}</span>
                                        <button onClick={() => removeSkill(skill)} className="text-muted-foreground hover:text-destructive transition-colors">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Right Side: Virtual Preview Studio */}
            <div className="flex-[1.2] flex flex-col bg-muted/20 relative overflow-hidden group/preview">
                {/* Visual Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

                <div className="flex items-center justify-between px-8 py-4 z-10">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-400/50" />
                            <div className="w-2 h-2 rounded-full bg-yellow-400/50" />
                            <div className="w-2 h-2 rounded-full bg-green-400/50" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Drafting Environment</span>
                    </div>
                </div>

                <div
                    ref={containerRef}
                    className="flex-1 overflow-auto p-4 md:p-12 lg:p-20 scrollbar-none hover:scrollbar-thin transition-all flex flex-col items-center"
                >
                    {/* Centering Wrapper with shadow & scale */}
                    <div
                        className="transition-all duration-500 ease-out"
                        style={{
                            width: `${A4_WIDTH * scale}px`,
                            height: `${A4_HEIGHT * scale}px`,
                            transform: `translateY(0)`
                        }}
                    >
                        <div
                            className="origin-top shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] bg-white rounded-[2px]"
                            style={{ transform: `scale(${scale})` }}
                        >
                            {/* The Actual Document */}
                            <div
                                ref={previewRef}
                                className="bg-white text-black w-[794px] min-h-[1123px] h-fit p-[60px] font-serif flex flex-col gap-6 text-[14px] relative"
                                style={{ fontFamily: "'Times New Roman', Times, serif", lineHeight: "1.4" }}
                            >
                                {/* Header */}
                                <div className="text-center space-y-2">
                                    <h1 className="text-[32px] font-bold uppercase tracking-[0.1em] border-b-2 border-black pb-2 leading-none">{data.fullName || "YOUR NAME"}</h1>
                                    <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium opacity-90">
                                        <span>{data.country || "CITY, COUNTRY"}</span>
                                        <span className="opacity-30">•</span>
                                        <span className="">{data.email || "email@example.com"}</span>
                                        {data.linkedin && (
                                            <>
                                                <span className="opacity-30">•</span>
                                                <span className="">{data.linkedin.replace(/^https?:\/\//, '')}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Summary */}
                                {data.bio && (
                                    <section className="mt-2">
                                        <h2 className="text-[14px] font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <span className="flex-1 h-px bg-black opacity-10"></span>
                                            Executive Summary
                                            <span className="flex-1 h-px bg-black opacity-10"></span>
                                        </h2>
                                        <p className="text-justify leading-relaxed indent-8">{data.bio}</p>
                                    </section>
                                )}

                                {/* Experience */}
                                {data.experience.length > 0 && (
                                    <section>
                                        <h2 className="text-[14px] font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <span className="flex-1 h-px bg-black opacity-10"></span>
                                            Professional Experience
                                            <span className="flex-1 h-px bg-black opacity-10"></span>
                                        </h2>
                                        <div className="space-y-6">
                                            {data.experience.map((exp, i) => (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between items-baseline">
                                                        <span className="font-bold text-[15px]">{exp.company || "CORPORATION NAME"}</span>
                                                        <span className="text-[12px] font-bold">{exp.duration || "DATES"}</span>
                                                    </div>
                                                    <div className="flex justify-between items-baseline italic opacity-90">
                                                        <span className="text-[14px]">{exp.role || "Job Title"}</span>
                                                        <span className="text-[11px] not-italic font-medium uppercase tracking-tighter">{exp.location || "LOCATION"}</span>
                                                    </div>
                                                    <ul className="list-disc pl-5 text-[13px] leading-relaxed mt-1 space-y-0.5">
                                                        {exp.description.split('\n').filter(line => line.trim() !== '').map((line, j) => (
                                                            <li key={j} className="text-justify">{line.trim()}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Projects */}
                                {data.projects.length > 0 && (
                                    <section>
                                        <h2 className="text-[14px] font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <span className="flex-1 h-px bg-black opacity-10"></span>
                                            Key Projects
                                            <span className="flex-1 h-px bg-black opacity-10"></span>
                                        </h2>
                                        <div className="space-y-5">
                                            {data.projects.map((proj, i) => (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between items-baseline">
                                                        <span className="font-bold text-[15px]">{proj.name || "PROJECT NAME"}</span>
                                                        <span className="text-[12px] font-bold">{proj.duration || "DATE"}</span>
                                                    </div>
                                                    {proj.location && (
                                                        <div className="text-[11px] italic opacity-80 mt-[-2px]">{proj.location}</div>
                                                    )}
                                                    <ul className="list-disc pl-5 text-[13px] leading-relaxed mt-1 space-y-0.5">
                                                        {proj.description.split('\n').filter(line => line.trim() !== '').map((line, j) => (
                                                            <li key={j} className="text-justify">{line.trim()}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Education */}
                                {data.education.length > 0 && (
                                    <section>
                                        <h2 className="text-[14px] font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <span className="flex-1 h-px bg-black opacity-10"></span>
                                            Education
                                            <span className="flex-1 h-px bg-black opacity-10"></span>
                                        </h2>
                                        <div className="space-y-4">
                                            {data.education.map((edu, i) => (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between items-baseline font-bold text-[15px]">
                                                        <span>{edu.institution || "UNIVERSITY NAME"}</span>
                                                        <span className="text-[12px]">{edu.year || "YEAR"}</span>
                                                    </div>
                                                    <div className="italic text-[14px] opacity-90">{edu.degree || "Degree Specification"}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Technical Skills */}
                                {data.skills.length > 0 && (
                                    <section>
                                        <h2 className="text-[14px] font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <span className="flex-1 h-px bg-black opacity-10"></span>
                                            Competencies
                                            <span className="flex-1 h-px bg-black opacity-10"></span>
                                        </h2>
                                        <div className="flex flex-wrap gap-x-3 gap-y-2 text-[12px]">
                                            {data.skills.map((skill, i) => (
                                                <div key={i} className="flex items-center gap-1.5">
                                                    <span className="font-bold text-[13px]">•</span>
                                                    <span className="font-medium">{skill}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
