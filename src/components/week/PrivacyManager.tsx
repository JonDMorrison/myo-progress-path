import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Shield, Video, FileText, Loader2, AlertTriangle } from "lucide-react";
import { deleteVideo } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PrivacyManagerProps {
    patientId: string;
    weekId: string;
    onUpdate?: () => void;
}

export function PrivacyManager({ patientId, weekId, onUpdate }: PrivacyManagerProps) {
    const [uploads, setUploads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        loadUploads();
    }, [patientId, weekId]);

    const loadUploads = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('uploads')
            .select('*')
            .eq('patient_id', patientId)
            .eq('week_id', weekId)
            .order('created_at', { ascending: false });

        if (!error) {
            setUploads(data || []);
        }
        setLoading(false);
    };

    const handleDeleteVideo = async (uploadId: string, fileUrl: string) => {
        const result = await deleteVideo(uploadId, fileUrl);
        if (result.success) {
            toast({
                title: "Video Deleted",
                description: "Your video has been permanently removed from our servers.",
            });
            loadUploads();
            onUpdate?.();
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to delete video.",
                variant: "destructive",
            });
        }
    };

    const handleResetVitals = async () => {
        const { error } = await supabase
            .from('patient_week_progress')
            .update({
                bolt_score: null,
                nasal_breathing_pct: null,
                tongue_on_spot_pct: null,
            })
            .eq('patient_id', patientId)
            .eq('week_id', weekId);

        if (!error) {
            toast({
                title: "Vitals Reset",
                description: "Your biometric data for this week has been cleared.",
            });
            onUpdate?.();
        }
    };

    if (loading && uploads.length === 0) return null;

    return (
        <Card className="rounded-[2.5rem] border-none shadow-premium bg-white overflow-hidden mt-12">
            <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-black tracking-tight">Privacy & Data Manager</CardTitle>
                        <p className="text-xs text-slate-400 font-medium">Manage your personal uploads and biometric data</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">

                {/* Videos Section */}
                <div className="space-y-4">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Your Video Submissions
                    </h4>

                    {uploads.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">No videos uploaded for this week.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {uploads.map((upload) => (
                                <div key={upload.id} className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400">
                                            <Video className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 capitalize">
                                                {upload.kind.replace('_', ' ')}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-medium">
                                                Uploaded {new Date(upload.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="rounded-[2rem]">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete this video?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently remove the video from your record. Dr. Jon will no longer be able to review it.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDeleteVideo(upload.id, upload.file_url)}
                                                    className="bg-destructive hover:bg-destructive/90 rounded-xl"
                                                >
                                                    Delete Permanently
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Vitals Section */}
                <div className="pt-8 border-t border-slate-100 space-y-4">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Biometric Data
                    </h4>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-[2rem] bg-slate-900 text-white">
                        <div className="space-y-1">
                            <p className="text-sm font-bold">Clear Biometric History</p>
                            <p className="text-xs text-slate-400">Reset your BOLT scores and breathing percentages for this week.</p>
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="bg-transparent border-white/20 hover:bg-white/10 text-white rounded-xl">
                                    Reset Vitals
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[2rem]">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                        <AlertTriangle className="w-5 h-5" />
                                        Clear Biometric Data?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        All your breathing and BOLT scores for this week will be deleted. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleResetVitals}
                                        className="bg-destructive hover:bg-destructive/90 rounded-xl"
                                    >
                                        Clear All
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
