import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle2, Clock, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TodayExercisesCardProps {
  moduleLabel?: string;
  weekNumber: number;
  weekTitle: string;
  exercisesCompleted?: number;
  totalExercises?: number;
  status?: "open" | "submitted" | "approved" | "needs_more";
  onStartSession: () => void;
}

export function TodayExercisesCard({
  moduleLabel,
  weekNumber,
  weekTitle,
  exercisesCompleted = 0,
  totalExercises = 5,
  status = "open",
  onStartSession
}: TodayExercisesCardProps) {
  const isApproved = status === "approved";
  const isSubmitted = status === "submitted";

  // Fallbacks for empty database to prevent showing "0 / 0" during initial setup/demo
  const actualTotal = totalExercises > 0 ? totalExercises : 5;
  const actualCompleted = exercisesCompleted;
  const progressPercent = (actualCompleted / actualTotal) * 100;

  return (
    <Card className={cn(
      "rounded-3xl border-none shadow-elevated bg-white relative overflow-hidden group transition-all duration-300 hover:shadow-2xl",
      isSubmitted && "bg-slate-50/50"
    )}>
      {/* Premium Background Glimmer */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] -ml-24 -mb-24" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-6 sm:p-8">
        {/* Left Aspect: Progress Orb */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-slate-100"
            />
            <circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={364}
              strokeDashoffset={364 - (364 * (isApproved ? 100 : progressPercent)) / 100}
              strokeLinecap="round"
              fill="transparent"
              className={cn(
                "transition-all duration-1000 ease-out",
                isApproved ? "text-emerald-500" : "text-primary"
              )}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isApproved ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            ) : (
              <>
                <span className="text-2xl font-black text-slate-900">{actualCompleted}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Completed</span>
              </>
            )}
          </div>
        </div>

        {/* Middle aspect: Content */}
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase font-bold tracking-widest px-2 py-0.5">
              {moduleLabel || `Module ${weekNumber}`}
            </Badge>
            {isApproved && (
              <Badge className="bg-emerald-500 text-white border-none text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 animate-bounce">
                Complete
              </Badge>
            )}
            {isSubmitted && (
              <Badge className="bg-amber-100 text-amber-700 border-none text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Under Review
              </Badge>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            {weekTitle === `Module ${weekNumber}` ? 'Foundation & Breathing' : weekTitle}
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            {isSubmitted
              ? "Awaiting therapist approval — your next module will unlock soon"
              : isApproved
                ? "Excellent work! This module has been approved."
                : <>Next: <span className="text-slate-700 font-bold italic">Active Suction & Tone</span> • ~12 min left</>
            }
          </p>
        </div>

        {/* Right Aspect: Action */}
        <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
          <Button
            onClick={onStartSession}
            size="lg"
            className={cn(
              "w-full md:w-auto h-14 px-8 text-lg font-black shadow-xl transition-all duration-300 rounded-2xl group/btn",
              isSubmitted || isApproved
                ? "bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 shadow-slate-100"
                : "bg-slate-900 hover:bg-primary text-white shadow-slate-200 hover:shadow-primary/20"
            )}
          >
            {isSubmitted || isApproved ? (
              <BookOpen className="w-5 h-5 mr-3 group-hover/btn:scale-110 transition-transform" />
            ) : (
              <Play className="w-5 h-5 mr-3 fill-white group-hover/btn:scale-110 transition-transform" />
            )}
            {isSubmitted ? 'View Submission' : isApproved ? 'Review Content' : 'Start Session'}
          </Button>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Best performed twice daily</span>
          </div>
        </div>
      </div>

      {/* Mini Progress Bar at bottom for mobile scan */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </Card>
  );
}
