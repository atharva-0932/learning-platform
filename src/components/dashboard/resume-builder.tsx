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
    Award
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
            experience: [...data.experience, { role: "", company: "", duration: "", description: "" }]
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
            projects: [...data.projects, { name: "", description: "", link: "" }]
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

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full max-w-[1600px] mx-auto">
            {/* Left Side: Editor */}
            <div className="flex flex-col h-full bg-background border rounded-2xl overflow-hidden shadow-sm">
                <CardHeader className="border-b px-6 py-4 bg-muted/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Resume Editor</CardTitle>
                            <CardDescription>Customize your professional details</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Save
                            </Button>
                            <Button size="sm" onClick={handleExport} disabled={isExporting}>
                                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                                Export PDF
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <div ref={editorRef} className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
                    {/* Personal Info */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-2 text-primary">
                            <User className="w-5 h-5" />
                            <h3 className="font-bold uppercase text-sm tracking-widest">Personal Info</h3>
                        </div>
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    value={data.fullName}
                                    onChange={(e) => setData({ ...data, fullName: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Professional Summary</Label>
                                <Textarea
                                    id="bio"
                                    value={data.bio}
                                    onChange={(e) => setData({ ...data, bio: e.target.value })}
                                    placeholder="Brief summary of your expertise..."
                                    className="min-h-[100px] resize-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Experience */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-primary">
                                <Briefcase className="w-5 h-5" />
                                <h3 className="font-bold uppercase text-sm tracking-widest">Work Experience</h3>
                            </div>
                            <Button variant="ghost" size="sm" onClick={addExperience} className="h-8 text-xs">
                                <Plus className="w-3 h-3 mr-1" /> Add
                            </Button>
                        </div>

                        <Accordion type="multiple" defaultValue={["exp-0"]} className="space-y-3">
                            {data.experience.map((exp, idx) => (
                                <AccordionItem key={idx} value={`exp-${idx}`} className="border rounded-xl px-4 bg-muted/10">
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <div className="flex items-center gap-3 text-left">
                                            <span className="font-medium">{exp.role || "New Position"}</span>
                                            {exp.company && <span className="text-xs text-muted-foreground mr-2">at {exp.company}</span>}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 pb-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Role</Label>
                                                <Input value={exp.role} onChange={(e) => updateExperience(idx, "role", e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Company</Label>
                                                <Input value={exp.company} onChange={(e) => updateExperience(idx, "company", e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Duration</Label>
                                            <Input value={exp.duration} onChange={(e) => updateExperience(idx, "duration", e.target.value)} placeholder="e.g. Jan 2020 - Present" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Textarea
                                                value={exp.description}
                                                onChange={(e) => updateExperience(idx, "description", e.target.value)}
                                                className="min-h-[80px]"
                                            />
                                        </div>
                                        <Button variant="destructive" size="sm" onClick={() => removeExperience(idx)} className="w-full">
                                            <Trash2 className="w-3 h-3 mr-2" /> Remove Position
                                        </Button>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </section>

                    {/* Education */}
                    <section className="space-y-4 pb-8">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-primary">
                                <GraduationCap className="w-5 h-5" />
                                <h3 className="font-bold uppercase text-sm tracking-widest">Education</h3>
                            </div>
                            <Button variant="ghost" size="sm" onClick={addEducation} className="h-8 text-xs">
                                <Plus className="w-3 h-3 mr-1" /> Add
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {data.education.map((edu, idx) => (
                                <div key={idx} className="relative p-4 border rounded-xl bg-muted/10 space-y-4">
                                    <button
                                        onClick={() => removeEducation(idx)}
                                        className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Degree/Certificate</Label>
                                            <Input value={edu.degree} onChange={(e) => updateEducation(idx, "degree", e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Institution</Label>
                                            <Input value={edu.institution} onChange={(e) => updateEducation(idx, "institution", e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="w-full md:w-1/2 space-y-2">
                                        <Label>Year</Label>
                                        <Input value={edu.year} onChange={(e) => updateEducation(idx, "year", e.target.value)} placeholder="2023" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Projects Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-primary">
                                <Lightbulb className="w-5 h-5" />
                                <h3 className="font-bold uppercase text-sm tracking-widest">Projects</h3>
                            </div>
                            <Button variant="ghost" size="sm" onClick={addProject} className="h-8 text-xs">
                                <Plus className="w-3 h-3 mr-1" /> Add
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {data.projects.map((proj, idx) => (
                                <div key={idx} className="relative p-4 border rounded-xl bg-muted/10 space-y-4">
                                    <button onClick={() => removeProject(idx)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Project Name</Label>
                                            <Input value={proj.name} onChange={(e) => updateProject(idx, "name", e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Link (Optional)</Label>
                                            <Input value={proj.link} onChange={(e) => updateProject(idx, "link", e.target.value)} placeholder="https://..." />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea value={proj.description} onChange={(e) => updateProject(idx, "description", e.target.value)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Achievements Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-primary">
                                <Trophy className="w-5 h-5" />
                                <h3 className="font-bold uppercase text-sm tracking-widest">Achievements</h3>
                            </div>
                            <Button variant="ghost" size="sm" onClick={addAchievement} className="h-8 text-xs">
                                <Plus className="w-3 h-3 mr-1" /> Add
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {data.achievements.map((ach, idx) => (
                                <div key={idx} className="relative p-4 border rounded-xl bg-muted/10 space-y-4">
                                    <button onClick={() => removeAchievement(idx)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="space-y-2">
                                        <Label>Achievement Title</Label>
                                        <Input value={ach.title} onChange={(e) => updateAchievement(idx, "title", e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea value={ach.description} onChange={(e) => updateAchievement(idx, "description", e.target.value)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Certifications Section */}
                    <section className="space-y-4 pb-8">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-primary">
                                <Award className="w-5 h-5" />
                                <h3 className="font-bold uppercase text-sm tracking-widest">Certifications</h3>
                            </div>
                            <Button variant="ghost" size="sm" onClick={addCertification} className="h-8 text-xs">
                                <Plus className="w-3 h-3 mr-1" /> Add
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {data.certifications.map((cert, idx) => (
                                <div key={idx} className="relative p-4 border rounded-xl bg-muted/10 space-y-4">
                                    <button onClick={() => removeCertification(idx)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Certification Name</Label>
                                            <Input value={cert.name} onChange={(e) => updateCertification(idx, "name", e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Issuer</Label>
                                            <Input value={cert.issuer} onChange={(e) => updateCertification(idx, "issuer", e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="w-full md:w-1/2 space-y-2">
                                        <Label>Year</Label>
                                        <Input value={cert.year} onChange={(e) => updateCertification(idx, "year", e.target.value)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Right Side: Sticky Preview */}
            <div className="xl:sticky xl:top-8 self-start h-[calc(100vh-120px)] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Document View</span>
                    </div>
                </div>

                <div ref={containerRef} className="flex-1 overflow-auto bg-muted/40 rounded-2xl p-4 md:p-8 flex justify-center scrollbar-thin shadow-inner">
                    {/* Centering Wrapper */}
                    <div
                        className="flex justify-center"
                        style={{
                            width: `${A4_WIDTH * scale}px`,
                            height: `${A4_HEIGHT * scale}px`,
                            minHeight: "fit-content"
                        }}
                    >
                        <div
                            className="h-fit origin-top transition-transform duration-200 shadow-2xl"
                            style={{ transform: `scale(${scale})` }}
                        >
                            {/* Jake's Template Style (Single Column) */}
                            <div
                                ref={previewRef}
                                className="bg-white text-black w-[794px] min-h-[1123px] h-fit p-12 font-serif flex flex-col gap-5 text-[14px]"
                                style={{ fontFamily: "'Times New Roman', Times, serif", lineHeight: "1.2" }}
                            >
                                {/* Header */}
                                <div className="text-center space-y-1">
                                    <h1 className="text-4xl font-bold uppercase tracking-tight">{data.fullName || "Your Name"}</h1>
                                    <div className="flex justify-center gap-3 text-[12px] opacity-80">
                                        <span>City, Country</span>
                                        <span>|</span>
                                        <span>email@example.com</span>
                                        <span>|</span>
                                        <span>linkedin.com/in/profile</span>
                                    </div>
                                </div>

                                {/* Summary */}
                                {data.bio && (
                                    <section>
                                        <h2 className="text-[16px] font-bold uppercase border-b border-black mb-2">Professional Summary</h2>
                                        <p className="text-justify leading-snug">{data.bio}</p>
                                    </section>
                                )}

                                {/* Experience */}
                                {data.experience.length > 0 && (
                                    <section>
                                        <h2 className="text-[16px] font-bold uppercase border-b border-black mb-3">Experience</h2>
                                        <div className="space-y-4">
                                            {data.experience.map((exp, i) => (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between items-baseline font-bold">
                                                        <span>{exp.company || "Company Name"}</span>
                                                        <span className="text-[13px]">{exp.duration || "Dates"}</span>
                                                    </div>
                                                    <div className="flex justify-between items-baseline italic">
                                                        <span>{exp.role || "Job Title"}</span>
                                                        <span className="text-[12px] not-italic opacity-80">Location</span>
                                                    </div>
                                                    <p className="text-[13.5px] leading-tight text-justify">{exp.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Projects */}
                                {data.projects.length > 0 && (
                                    <section>
                                        <h2 className="text-[16px] font-bold uppercase border-b border-black mb-3">Projects</h2>
                                        <div className="space-y-4">
                                            {data.projects.map((proj, i) => (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between items-baseline font-bold">
                                                        <div className="flex gap-2 items-center">
                                                            <span>{proj.name}</span>
                                                            {proj.link && <span className="text-[11px] font-normal underline opacity-60">Link</span>}
                                                        </div>
                                                        <span className="text-[13px]">Date</span>
                                                    </div>
                                                    <p className="text-[13.5px] leading-tight text-justify italic">{proj.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Education */}
                                {data.education.length > 0 && (
                                    <section>
                                        <h2 className="text-[16px] font-bold uppercase border-b border-black mb-3">Education</h2>
                                        <div className="space-y-4">
                                            {data.education.map((edu, i) => (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between items-baseline font-bold">
                                                        <span>{edu.institution || "University Name"}</span>
                                                        <span className="text-[13px]">{edu.year || "Dates"}</span>
                                                    </div>
                                                    <div className="italic text-[13.5px]">{edu.degree || "Degree Name"}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Technical Skills */}
                                {data.skills.length > 0 && (
                                    <section>
                                        <h2 className="text-[16px] font-bold uppercase border-b border-black mb-2">Technical Skills</h2>
                                        <div className="text-[13.5px] leading-relaxed">
                                            <span className="font-bold">Core Competencies: </span>
                                            {data.skills.join(", ")}
                                        </div>
                                    </section>
                                )}

                                {/* Certifications & Awards */}
                                {(data.certifications.length > 0 || data.achievements.length > 0) && (
                                    <section>
                                        <h2 className="text-[16px] font-bold uppercase border-b border-black mb-2">Certifications & Awards</h2>
                                        <ul className="list-disc list-inside space-y-1 text-[13px]">
                                            {data.certifications.map((cert, i) => (
                                                <li key={i}><span className="font-bold">{cert.name}</span> — {cert.issuer}</li>
                                            ))}
                                            {data.achievements.map((ach, i) => (
                                                <li key={i}><span className="font-bold">{ach.title}</span>: {ach.description}</li>
                                            ))}
                                        </ul>
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
