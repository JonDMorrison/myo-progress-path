import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { HelpCircle, Activity, Wind, Target, Save } from "lucide-react";
import { BOLTHelpContent } from "@/components/BOLTHelpContent";
import { NasalBreathingHelpContent } from "@/components/NasalBreathingHelpContent";
import { NasalUnblockModal } from "@/components/learn/NasalUnblockModal";
import { useWeekForm } from "@/hooks/useWeekForm";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WeekProgressFormProps {
  progress: any;
  week: any;
  readOnly?: boolean;
  onUpdate?: () => void;
}

export function WeekProgressForm({ progress, week, readOnly = false, onUpdate }: WeekProgressFormProps) {
  // Guard against null progress (therapist/admin preview mode)
  if (!progress?.id) {
    return (
      <div className="p-8 text-center text-muted-foreground bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
        <p className="font-medium">Vitals tracking unavailable in preview mode</p>
        <p className="text-sm">Patient progress data is only visible when viewing as the enrolled patient.</p>
      </div>
    );
  }

  const { formData, updateField, isSaving, lastSaved } = useWeekForm(
    progress.id,
    {
      boltScore: progress.bolt_score?.toString() || '',
      nasalPct: progress.nasal_breathing_pct?.toString() || '',
      tonguePct: progress.tongue_on_spot_pct?.toString() || ''
    },
    { readOnly, onSaveComplete: onUpdate }
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">
            {readOnly ? "Clinical Summary" : "Your Biweekly Vitals"}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Respiratory & Myofunctional Tracking</p>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
            <div className={cn("w-2 h-2 rounded-full", isSaving ? "bg-amber-400 animate-pulse" : "bg-emerald-500")} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {isSaving ? "Syncing..." : "Cloud Synced"}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* BOLT Score Card */}
        {week?.requires_bolt && (
          <Card className="rounded-[2.5rem] border-none shadow-premium bg-white group hover:shadow-2xl transition-all duration-500">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                  <Activity className="w-6 h-6" />
                </div>
                <HoverCard>
                  <HoverCardTrigger>
                    <HelpCircle className="h-5 w-5 text-slate-300 cursor-help hover:text-primary transition-colors" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 rounded-3xl border-none shadow-2xl p-6">
                    <BOLTHelpContent />
                  </HoverCardContent>
                </HoverCard>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bolt-score" className="text-sm font-bold text-slate-400 uppercase tracking-widest">BOLT Score</Label>
                <div className="relative">
                  <Input
                    id="bolt-score"
                    type="number"
                    min="0"
                    max="120"
                    value={formData.boltScore}
                    onChange={(e) => updateField('boltScore', e.target.value)}
                    placeholder="--"
                    disabled={readOnly}
                    className="h-16 text-3xl font-black bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20 transition-all pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase italic">sec</span>
                </div>
                <Progress value={(Number(formData.boltScore) / 40) * 100} className="h-1.5 bg-slate-100" />
                <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                  <span>Baseline</span>
                  <span>Target: 40s+</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Nasal Breathing Card */}
        <Card className="rounded-[2.5rem] border-none shadow-premium bg-white group hover:shadow-2xl transition-all duration-500">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                <Wind className="w-6 h-6" />
              </div>
              <HoverCard>
                <HoverCardTrigger>
                  <HelpCircle className="h-5 w-5 text-slate-300 cursor-help hover:text-primary transition-colors" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80 rounded-3xl border-none shadow-2xl p-6">
                  <NasalBreathingHelpContent />
                </HoverCardContent>
              </HoverCard>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nasal-pct" className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nasal Breathing (Awake)</Label>
              <div className="relative">
                <Input
                  id="nasal-pct"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.nasalPct}
                  onChange={(e) => updateField('nasalPct', e.target.value)}
                  placeholder="--"
                  disabled={readOnly}
                  className="h-16 text-3xl font-black bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20 transition-all pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase italic">%</span>
              </div>
              <Progress value={Number(formData.nasalPct)} className="h-1.5 bg-slate-100" />
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                <span className="text-slate-300">Target: 100%</span>
                <NasalUnblockModal />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tongue Posture Card */}
        <Card className="rounded-[2.5rem] border-none shadow-premium bg-white group hover:shadow-2xl transition-all duration-500">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                <Target className="w-6 h-6" />
              </div>
              <HoverCard>
                <HoverCardTrigger>
                  <HelpCircle className="h-5 w-5 text-slate-300 cursor-help hover:text-primary transition-colors" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80 rounded-3xl border-none shadow-2xl p-6">
                  <div className="space-y-4">
                    <p className="font-black text-lg italic italic">The "Spot"</p>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      The "spot" is the roof of your mouth behind your front teeth.
                      Ideally, your tongue should rest here naturally throughout the day.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tongue-pct" className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tongue on Spot</Label>
              <div className="relative">
                <Input
                  id="tongue-pct"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.tonguePct}
                  onChange={(e) => updateField('tonguePct', e.target.value)}
                  placeholder="--"
                  disabled={readOnly}
                  className="h-16 text-3xl font-black bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20 transition-all pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase italic">%</span>
              </div>
              <Progress value={Number(formData.tonguePct)} className="h-1.5 bg-slate-100 italic" />
              <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                <span>Habit Formation</span>
                <span>Target: 100%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
