import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Section } from "@/components/ui/Section";
import { Shield, ChevronDown } from "lucide-react";

import { notifyTherapistSubmission } from "@/lib/notify";
import { grantBadgeWithToast } from "@/lib/gamification";
import confetti from "canvas-confetti";
import { ResponsiveVideo } from "@/components/week/ResponsiveVideo";

import { BottomNav } from "@/components/layout/BottomNav";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { PatientHeader } from "@/components/layout/PatientHeader";
import { isWeekAccessible, isWeekReadOnly } from "@/lib/userProgress";
import { WeekHeader } from "@/components/week/WeekHeader";
import { WeekObjectives } from "@/components/week/WeekObjectives";
import { WeekProgressForm } from "@/components/week/WeekProgressForm";
import { WeekMessagesPanel } from "@/components/week/WeekMessagesPanel";
import { WeekCompletionChecklist } from "@/components/week/WeekCompletionChecklist";
import { WeekExercisesList } from "@/components/week/WeekExercisesList";
import { PostOpSectionedContent } from "@/components/week/PostOpSectionedContent";
import { SubmitButton } from "@/components/week/SubmitBar";
import { ExerciseProgressSummary } from "@/components/week/ExerciseProgressSummary";
import { FrenectomyConsultTask } from "@/components/week/FrenectomyConsultTask";
import { FrenectomyConsultReminder } from "@/components/week/FrenectomyConsultReminder";
import { LearnHubReviewTask } from "@/components/week/LearnHubReviewTask";
import { PreOpPreparationCard } from "@/components/week/PreOpPreparationCard";
import { PostOpProtocolCard } from "@/components/week/PostOpProtocolCard";
import TherapistFeedbackList from "@/components/week/TherapistFeedbackList";
import { PreviousWeeksReview } from "@/components/week/PreviousWeeksReview";
import { PrivacyManager } from "@/components/week/PrivacyManager";
import { FRENECTOMY_POST_OP_WEEKS, isLastWeekOfModule, getModuleInfo } from "@/lib/moduleUtils";
import { isFrenectomyVariant, requiresVideo, getProgramTitle } from "@/lib/constants";

const WeekDetail = () => {
  const { weekNumber } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [week, setWeek] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [patient, setPatient] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const [uploads, setUploads] = useState<any[]>([]);
  const [postProgramText, setPostProgramText] = useState<string | null>(null);
  const [progressBenchmark, setProgressBenchmark] = useState<string | null>(null);
  const [canSubmitState, setCanSubmitState] = useState(false);
  const [missingRequirements, setMissingRequirements] = useState<string[]>([]);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  useEffect(() => {
    if (canSubmitState && !loading) {
      const isLast = isLastWeekOfModule(parseInt(weekNumber || "1"), patient?.program_variant || 'frenectomy');

      if (isLast) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#3b82f6', '#f59e0b']
        });

        toast({
          title: "Module Complete! 🎉",
          description: "You've met all module requirements. Ready to submit for review!",
        });
      } else {
        toast({
          title: "Part One Complete!",
          description: "You've finished Part One. Complete Part Two to submit this module.",
        });
      }
    }
  }, [canSubmitState, loading, weekNumber]);

  useEffect(() => {
    loadWeekData();
  }, [weekNumber]);

  const { user: authUser, role: authRole, isAuthReady } = useAuth();

  const backDestination = useMemo(() => {
    if (authRole === 'therapist' || authRole === 'admin' || authRole === 'super_admin') {
      return '/therapist';
    }
    if (authRole === 'patient') {
      return '/patient';
    }
    // Role not yet resolved — fall back to browser history to avoid hardcoding /patient
    return window.history.length > 1 ? -1 as any : '/patient';
  }, [authRole]);

  const backLabel = useMemo(() => {
    if (authRole === 'therapist' || authRole === 'admin' || authRole === 'super_admin') {
      return 'Curriculum';
    }
    return 'Dashboard';
  }, [authRole]);

  const loadWeekData = async () => {
    try {
      const user = authUser;
      if (!user) return;

      const isSuperAdmin = authRole === "super_admin";
      const isTherapist = authRole === "therapist" || authRole === "admin";

      // Get patient - if user is therapist/admin but NOT a patient themselves, we create a partial dummy state
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (patientError) throw patientError;

      if (!patientData && !isTherapist && !isSuperAdmin) {
        throw new Error("No patient profile found for this account.");
      }

      setPatient(patientData || { id: 'dummy', program_variant: 'frenectomy', user: { name: 'Therapist Preview' } });

      const searchParams = new URLSearchParams(window.location.search);
      const variantOverride = searchParams.get('variant');

      // Check access and read-only state
      if (isTherapist || isSuperAdmin) {
        setIsReadOnly(true); // Content preview is read-only for therapists
      } else if (patientData) {
        const weekNum = parseInt(weekNumber || "1");
        const accessible = weekNum === 1 || await isWeekAccessible(patientData.id, weekNum);

        if (!accessible) {
          toast({
            title: "Module Locked",
            description: "Please complete the previous module to unlock this one.",
            variant: "destructive",
          });
          navigate("/patient");
          return;
        }

        const readOnly = await isWeekReadOnly(patientData.id, weekNum);
        setIsReadOnly(readOnly);
      }

      // Get week - filter by patient's program variant or override (for therapist preview)
      const variant = variantOverride || (patientData?.program_variant) || 'frenectomy';
      const programTitle = getProgramTitle(variant);

      let { data: weekData } = await supabase
        .from("weeks")
        .select("*, programs!inner(title)")
        .eq("number", parseInt(weekNumber || "1"))
        .eq("programs.title", programTitle)
        .single();

      // Fallback: try without program join (in case program mapping differs)
      if (!weekData) {
        const { data: fallbackWeek } = await supabase
          .from("weeks")
          .select("*")
          .eq("number", parseInt(weekNumber || "1"))
          .maybeSingle();
        weekData = fallbackWeek;
      }

      if (!weekData) {
        // No Supabase row at all — create synthetic week so JSON-only mode can proceed
        weekData = {
          id: `json-week-${parseInt(weekNumber || "1")}`,
          number: parseInt(weekNumber || "1"),
          title: '',
          objectives: null,
          introduction: null,
          requires_bolt: false,
          video_url: null,
          video_title: null,
        } as any;
      }

      setWeek(weekData);

      // Load exercises from JSON file (source of truth)
      try {
        const response = await fetch('/24-week-program.json');
        const programData = await response.json(); // flat array, not { weeks: [] }

        // Find entries matching this week number for both weeks in the module
        // JSON uses 'frenectomy' and 'standard' — map variant accordingly
        const jsonVariant = isFrenectomyVariant(variant) ? 'frenectomy' : 'standard';
        const weekEntries = programData.filter(
          (entry: any) => entry.week === weekData.number &&
          entry.program_variant === jsonVariant
        );

        const weekEntry = weekEntries[0];

        if (weekEntry?.exercises?.length > 0) {
          // Map JSON exercise shape to what the component expects
          const mapped = weekEntry.exercises.map((ex: any, index: number) => ({
            id: `json-${weekData.number}-${index}`,
            title: ex.name,
            instructions: ex.description,
            type: ex.type || 'active',
            duration: ex.duration || '',
            frequency: ex.frequency || '',
            props: ex.props || [],
            compensations: Array.isArray(ex.compensations)
              ? ex.compensations.map((c: string) => `- ${c}`).join('\n')
              : ex.compensations || '',
            demo_video_url: ex.demo_video_url || null,
            modified_video_url: ex.modified_video_url || null,
            order_index: index,
            week_id: weekData.id,
            completion_target: 1,
            media_status: 'approved',
          }));
          setExercises(mapped);

          // Fetch Vimeo video URLs from Supabase and merge into JSON exercises
          try {
            const { data: supabaseExercises } = await supabase
              .from("exercises")
              .select("title, demo_video_url, modified_video_url")
              .eq("week_id", weekData.id);

            if (supabaseExercises && supabaseExercises.length > 0) {
              setExercises(prev => prev.map(ex => {
                const match = supabaseExercises.find(
                  se => se.title?.toLowerCase().trim() === ex.title?.toLowerCase().trim()
                );
                return match ? {
                  ...ex,
                  demo_video_url: (match.demo_video_url && match.demo_video_url.includes('vimeo'))
                    ? match.demo_video_url
                    : ex.demo_video_url,
                  modified_video_url: match.modified_video_url || ex.modified_video_url || null,
                } : ex;
              }));
            }
          } catch (e) {
            console.error("Error merging Supabase video URLs:", e);
          }

        } else {
          // Fallback to Supabase if JSON has no exercises for this week
          const { data: exercisesData } = await supabase
            .from("exercises")
            .select("*")
            .eq("week_id", weekData.id)
            .order("order_index");
          setExercises(exercisesData || []);
        }

        // Always set these from JSON regardless of whether exercises exist
        if (weekEntry) {
          setWeek(prev => prev ? {
            ...prev,
            objectives: weekEntry.objectives || prev.objectives,
            introduction: weekEntry.introduction || prev.introduction,
            requires_bolt: weekEntry.tracking?.bolt_score === true ? true : prev.requires_bolt,
          } : prev);
          if (weekEntry.post_program_text) {
            setPostProgramText(weekEntry.post_program_text);
          }
          if (weekEntry.progress_benchmark) {
            setProgressBenchmark(weekEntry.progress_benchmark);
          }
        }
      } catch (error) {
        console.error("Error loading exercises from JSON:", error);
        // Fallback to Supabase on error
        const { data: exercisesData } = await supabase
          .from("exercises")
          .select("*")
          .eq("week_id", weekData.id)
          .order("title");
        setExercises(exercisesData || []);
      }

      let progressData = null;
      if (patientData && patientData.id !== 'dummy') {
        // Get or create progress
        let { data: pData, error: progressError } = await supabase
          .from("patient_week_progress")
          .select("*")
          .eq("patient_id", patientData.id)
          .eq("week_id", weekData.id)
          .maybeSingle();

        if (!pData && !progressError) {
          // Create progress entry
          const { data: newProgress, error: createError } = await supabase
            .from("patient_week_progress")
            .insert({
              patient_id: patientData.id,
              week_id: weekData.id,
              status: "open",
            })
            .select()
            .single();

          if (createError) throw createError;
          pData = newProgress;
        }

        progressData = pData;
        setProgress(progressData);

        // Get messages
        const { data: messagesData } = await supabase
          .from("messages")
          .select("*")
          .eq("patient_id", patientData.id)
          .eq("week_id", weekData.id)
          .order("created_at", { ascending: true });

        setMessages(messagesData || []);

        // Get uploads
        const { data: uploadsData } = await supabase
          .from("uploads")
          .select("*")
          .eq("patient_id", patientData.id)
          .eq("week_id", weekData.id)
          .order("created_at", { ascending: false });

        setUploads(uploadsData || []);



        // Check submit eligibility
        checkCanSubmit(patientData.id, weekData.id, progressData);
      } else {
        // Therapist mode: clear everything
        setProgress(null);
        setMessages([]);
        setUploads([]);
        setCanSubmitState(false);
      }
    } catch (error: any) {
      console.error("Error loading week data:", error);
      toast({
        title: "Error",
        description: "Failed to load week data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // When the Supabase weeks table lookup fails, WeekDetail creates a
  // synthetic week with id "json-week-N". That fake ID can't be used in
  // the calc_week_progress RPC (the DB function needs a real UUID that
  // appears in patient_week_progress). This helper resolves a synthetic
  // ID back to the real UUID by querying the weeks table.
  const resolveWeekId = async (rawWeekId: string): Promise<string> => {
    if (!rawWeekId.startsWith('json-')) return rawWeekId;

    const weekNum = parseInt(weekNumber || '1');
    const programTitle = getProgramTitle(patient?.program_variant || 'frenectomy');

    // Try with program filter first
    const { data: matchedWeek } = await supabase
      .from('weeks')
      .select('id, programs!inner(title)')
      .eq('number', weekNum)
      .eq('programs.title', programTitle)
      .maybeSingle();

    if (matchedWeek) return matchedWeek.id;

    // Fallback: number-only lookup
    const { data: fallbackWeek } = await supabase
      .from('weeks')
      .select('id')
      .eq('number', weekNum)
      .maybeSingle();

    if (fallbackWeek) return fallbackWeek.id;

    // Nothing in the DB — return the original so the RPC at least gets
    // called (it will return 0 / error, which is the current behaviour)
    console.warn(`resolveWeekId: no real week row found for synthetic ${rawWeekId}`);
    return rawWeekId;
  };

  const checkCanSubmit = async (patientId: string, weekId: string, progressData: any) => {
    try {
      const realWeekId = await resolveWeekId(weekId);

      const { data, error } = await supabase.rpc('calc_week_progress', {
        _patient_id: patientId,
        _week_id: realWeekId
      });

      console.log('calc_week_progress result:', data, 'error:', error, 'week_id used:', realWeekId);

      if (error) {
        console.error('Progress calculation error:', error);
        setCanSubmitState(false);
        setMissingRequirements([]);
        return;
      }

      const result = data as { percent_complete: number; missing: string[] };
      const isComplete = result?.percent_complete === 100;
      const notYetReviewed = progressData?.status === "open" || progressData?.status === "needs_more";

      setCanSubmitState(isComplete && notYetReviewed);
      setMissingRequirements(isComplete ? [] : result?.missing || []);
    } catch (error) {
      console.error('Error checking submit eligibility:', error);
      setCanSubmitState(false);
      setMissingRequirements([]);
    }
  };

  const canSubmit = async () => {
    if (!patient || !week || !progress) return false;

    const realWeekId = await resolveWeekId(week.id);

    const { data, error } = await supabase.rpc('calc_week_progress', {
      _patient_id: patient.id,
      _week_id: realWeekId
    });

    console.log('canSubmit calc_week_progress result:', data, 'error:', error, 'week_id used:', realWeekId);

    if (error) {
      console.error('Progress calculation error:', error);
      return false;
    }

    const progressData = data as { percent_complete: number; missing: string[] };
    const isComplete = progressData?.percent_complete === 100;
    const notYetReviewed = progress?.status === "open" || progress?.status === "needs_more";

    return isComplete && notYetReviewed;
  };

  const handleSubmitForReview = async () => {
    if (!progress || !patient) return;

    try {
      const canSubmitNow = await canSubmit();
      if (!canSubmitNow) {
        const realWeekId = await resolveWeekId(week.id);
        const { data } = await supabase.rpc('calc_week_progress', {
          _patient_id: patient.id,
          _week_id: realWeekId
        });

        const progressData = data as { missing: string[] };
        const missing = progressData?.missing || ['Unknown requirements'];

        toast({
          title: "Incomplete Data",
          description: `Missing: ${missing.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      // Update ALL weeks in the current module to 'submitted'
      const moduleInfo = getModuleInfo(parseInt(weekNumber || "1"), patient?.program_variant || 'frenectomy');
      const { data: moduleWeeks } = await supabase
        .from("weeks")
        .select("id, program_id, programs!inner(title)")
        .eq("programs.title", getProgramTitle(patient?.program_variant))
        .gte("number", moduleInfo.weekRange[0])
        .lte("number", moduleInfo.weekRange[1]);

      const weekIds = moduleWeeks?.map(w => w.id) || [week.id];

      const { error } = await supabase
        .from("patient_week_progress")
        .update({
          status: "submitted",
          completed_at: new Date().toISOString(),
        })
        .in("week_id", weekIds)
        .eq("patient_id", patient.id);

      if (error) throw error;

      // Grant first_week_submitted badge (idempotent - shows toast only on first earn)
      grantBadgeWithToast(patient.id, "first_week_submitted", toast).catch(console.error);

      await supabase.from("events").insert({
        patient_id: patient.id,
        type: "submitted_week",
        meta: {
          week_number: parseInt(weekNumber || "1"),
          timestamp: new Date().toISOString(),
        },
      });

      if (patient.assigned_therapist_id) {
        const { data: therapist } = await supabase
          .from("users")
          .select("email, name")
          .eq("id", patient.assigned_therapist_id)
          .single();

        if (therapist) {
          await notifyTherapistSubmission(
            therapist.email,
            therapist.name || "Therapist",
            patient.user?.name || "Patient",
            patient.id,
            parseInt(weekNumber || "1")
          );
        }
      }

      toast({
        title: "Submitted for review!",
        description: "Your therapist will review your progress soon.",
      });

      navigate("/patient");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };



  const handleVideoUploadComplete = async () => {
    if (!patient || !week) return;

    // Refresh uploads list
    const { data: uploadsData } = await supabase
      .from("uploads")
      .select("*")
      .eq("patient_id", patient.id)
      .eq("week_id", week.id)
      .order("created_at", { ascending: false });

    setUploads(uploadsData || []);

    // Also refresh progress to check for completion eligibility immediately with LATEST status
    const { data: latestProgress } = await supabase
      .from("patient_week_progress")
      .select("*")
      .eq("patient_id", patient.id)
      .eq("week_id", week.id)
      .single();

    if (latestProgress) setProgress(latestProgress);
    await checkCanSubmit(patient.id, week.id, latestProgress || progress);
  };

  const handleProgressUpdate = async () => {
    // Directly call loadWeekData to ensure everything (vitals, exercises, uploads) 
    // is synced with the latest database state immediately.
    await loadWeekData();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !patient || !week) return;

    try {
      const { error } = await supabase.from("messages").insert({
        patient_id: patient.id,
        week_id: week.id,
        therapist_id: patient.assigned_therapist_id,
        body: newMessage,
      });

      if (error) throw error;

      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .eq("patient_id", patient.id)
        .eq("week_id", week.id)
        .order("created_at", { ascending: true });

      setMessages(messagesData || []);
      setNewMessage("");

      toast({
        title: "Message sent!",
        description: "Your therapist will respond soon.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading module details...</p>
        </div>
      </div>
    );
  }

  if (!week) return null;

  return (
    <>

      <div className="min-h-screen bg-slate-50/50 pb-24 sm:pb-12">
        <PatientHeader userName={patient?.name} />
        {/* Header - Truly Compact */}
        <WeekHeader
          week={week}
          progress={progress}
          programVariant={patient?.program_variant || 'frenectomy'}
          onBack={() => {
            if (typeof backDestination === 'number') {
              navigate(-1);
            } else {
              navigate(backDestination);
            }
          }}
          backLabel={backLabel}
          isReadOnly={isReadOnly}
        />

        <main className="container mx-auto px-4 sm:px-6 py-8 max-w-[1400px]">
          <div className="flex flex-col gap-10">


            {/* 2. Main 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

              {/* Left Column: Actions & Exercises (8 Cols) */}
              <div className="lg:col-span-8 space-y-12">

                {/* Preparation Logic (Frenectomy reminders etc) */}
                {isFrenectomyVariant(new URLSearchParams(window.location.search).get('variant') || patient?.program_variant) && (
                  <div className="space-y-6">
                    {parseInt(weekNumber || "0") === 1 && (
                      <FrenectomyConsultTask
                        patientId={patient.id}
                        weekId={week.id}
                        isCompleted={progress?.frenectomy_consult_booked || false}
                        onUpdate={handleProgressUpdate}
                      />
                    )}
                    {parseInt(weekNumber || "0") === 2 && !progress?.frenectomy_consult_booked && (
                      <FrenectomyConsultReminder weekNumber={2} />
                    )}
                  </div>
                )}

                {/* Hub Actions: Learning & Video */}
                <div className={`grid grid-cols-1 ${week?.video_url ? 'xl:grid-cols-2' : ''} gap-8`}>
                  <div className="space-y-8">
                    {parseInt(weekNumber || "0") === 1 && (
                      <LearnHubReviewTask
                        patientId={patient.id}
                        weekId={week.id}
                        isCompleted={progress?.learn_hub_reviewed || false}
                        onUpdate={handleProgressUpdate}
                      />
                    )}
                    <WeekObjectives
                      objectives={week?.objectives}
                      weekNumber={parseInt(weekNumber || "0")}
                    />
                    {progressBenchmark && (
                      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex gap-3 items-start">
                        <span className="text-lg">📊</span>
                        <div>
                          <p className="text-sm font-medium text-primary mb-1">Progress Check</p>
                          <p className="text-sm text-muted-foreground">{progressBenchmark}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {week?.video_url && (
                    <div className="rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-900 aspect-video ring-1 ring-slate-200">
                      <ResponsiveVideo
                        src={week.video_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                        title={week.video_title || "Week Video"}
                      />
                    </div>
                  )}
                </div>

                {/* Video uploads are now per-exercise within the exercises list */}

                {/* Part Two orientation banner — shown when patient first arrives at the second week of a module */}
                {(() => {
                  const wn = parseInt(weekNumber || "1");
                  const isPartTwo = wn % 2 === 0;
                  const noCompletions = !progress?.exercise_completions || Object.keys(progress.exercise_completions).length === 0;
                  const isOpen = progress?.status === "open";
                  if (isPartTwo && noCompletions && isOpen && !isReadOnly) {
                    const moduleNum = getModuleInfo(wn, patient?.program_variant || 'frenectomy').moduleNumber;
                    return (
                      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 mb-6">
                        <p className="text-sm font-semibold text-blue-800">You've reached Part Two of Module {moduleNum}</p>
                        <p className="text-sm text-blue-600 mt-1">
                          Complete all exercises below, record your biometrics, then submit the module for your therapist to review.
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Exercise Progress & List */}
                <div className="space-y-10 pt-6">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                    <div className="space-y-1">
                      <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter">Your Session</h2>
                      <div className="h-1.5 w-16 bg-primary rounded-full transition-all group-hover:w-24" />
                    </div>
                    <ExerciseProgressSummary
                      completedCount={Object.values(progress?.exercise_completions || {}).filter((count): count is number => typeof count === 'number' && count > 0).length}
                      totalCount={exercises.length}
                    />
                  </div>

                  {postProgramText && (
                    <div className="rounded-2xl bg-gradient-to-br from-success/10 to-primary/10 border border-success/20 p-8 text-center space-y-4">
                      <div className="text-4xl">🎉</div>
                      <h2 className="text-2xl font-bold text-success">Congratulations!</h2>
                      <div className="text-sm text-muted-foreground whitespace-pre-line text-left max-w-2xl mx-auto">
                        {postProgramText}
                      </div>
                    </div>
                  )}

                  {exercises.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                      {isFrenectomyVariant(new URLSearchParams(window.location.search).get('variant') || patient?.program_variant) &&
                        FRENECTOMY_POST_OP_WEEKS.includes(parseInt(weekNumber || "0")) ? (
                        <PostOpSectionedContent
                          weekNumber={parseInt(weekNumber || "0")}
                          exercises={exercises}
                          patientId={patient?.id}
                          weekId={week?.id}
                          existingCompletions={progress?.exercise_completions || {}}
                          onUpdate={handleProgressUpdate}
                          readOnly={isReadOnly}
                        />
                      ) : (
                        <WeekExercisesList
                          exercises={exercises}
                          patientId={patient?.id}
                          weekId={week?.id}
                          existingCompletions={progress?.exercise_completions || {}}
                          onUpdate={handleProgressUpdate}
                          readOnly={isReadOnly}
                          showVideoUpload={requiresVideo(patient?.program_variant) && patient?.requires_video !== false}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Progress Vitals Form - Only render when progress record exists (not for therapist preview).
                    key={progress.id} forces a full remount when the patient navigates between weeks,
                    so useWeekForm re-initialises from the new progress row's values instead of showing
                    stale Part One vitals on Part Two. */}
                {progress && (
                  <Section delay={400}>
                    <WeekProgressForm
                      key={progress.id}
                      progress={progress}
                      week={week}
                      readOnly={isReadOnly}
                      onUpdate={handleProgressUpdate}
                    />
                  </Section>
                )}

                {/* Privacy & Data Manager - collapsed by default */}
                {patient?.id && week?.id && (
                  <Collapsible open={privacyOpen} onOpenChange={setPrivacyOpen}>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-4 rounded-xl border bg-white hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-blue-500" />
                          </div>
                          <span className="text-sm font-semibold text-slate-700">Privacy & Data</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${privacyOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <PrivacyManager
                        patientId={patient.id}
                        weekId={week.id}
                        onUpdate={handleProgressUpdate}
                      />
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Big Global Submit Bar - Only shown on last week of module */}
                {!isReadOnly && progress && (progress.status === "open" || progress.status === "needs_more") && (
                  isLastWeekOfModule(parseInt(weekNumber || "1"), patient?.program_variant || 'frenectomy') ? (
                    <SubmitButton
                      onComplete={handleSubmitForReview}
                      canSubmit={canSubmitState}
                      loading={false}
                    />
                  ) : (
                    <div className="mt-8 p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-premium text-center space-y-6">
                      <div className="space-y-2">
                        <p className="text-slate-800 text-lg font-bold">
                          {canSubmitState ? "Part One Complete! 🌟" : "Module Progress"}
                        </p>
                        <p className="text-slate-500 text-sm font-medium">
                          {canSubmitState
                            ? "You've finished everything for Part One. Now let's head to Part Two to complete the module."
                            : `Complete all tasks for both parts to submit Module ${getModuleInfo(parseInt(weekNumber || "1"), patient?.program_variant || 'frenectomy').moduleNumber}.`
                          }
                        </p>
                      </div>

                      {canSubmitState ? (
                        <Button
                          onClick={() => navigate(`/week/${parseInt(weekNumber || "1") + 1}`)}
                          className="w-full sm:w-auto px-10 h-14 rounded-2xl bg-primary hover:bg-primary-dark font-black text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 text-lg"
                        >
                          Continue to Part Two →
                        </Button>
                      ) : (
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                          Submission available at the end of Part Two
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>

              {/* Right Column: Mission Tracker (4 Cols) */}
              <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-8 h-fit">
                <div className="animate-in fade-in slide-in-from-right-4 duration-700">
                  <WeekCompletionChecklist
                    progress={progress}
                    week={week}
                    uploads={uploads}
                    exercises={exercises}
                    weekNumber={parseInt(weekNumber || "0")}
                    programVariant={patient?.program_variant}
                    requiresVideoUpload={requiresVideo(patient?.program_variant) && patient?.requires_video !== false}
                    layout="sidebar"
                  />
                </div>

                {patient?.id && week?.id && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
                    <TherapistFeedbackList
                      patientId={patient.id}
                      weekId={week.id}
                    />
                  </div>
                )}

                {patient?.program_variant !== 'non_frenectomy' && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-400">
                    <div className="rounded-[2.5rem] overflow-hidden shadow-xl ring-1 ring-slate-100 bg-white">
                      <WeekMessagesPanel
                        messages={messages}
                        newMessage={newMessage}
                        onMessageChange={setNewMessage}
                        onSendMessage={handleSendMessage}
                      />
                    </div>
                  </div>
                )}
              </aside>

            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    </>
  );
};

export default WeekDetail;
