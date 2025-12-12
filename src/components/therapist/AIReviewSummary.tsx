import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, HelpCircle, Loader, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AIFeedback {
  strengths?: string[];
  issues?: string[];
  suggestions?: string[];
}

interface AIReviewSummaryProps {
  uploads: {
    id: string;
    kind: string;
    ai_feedback: AIFeedback | null;
    ai_feedback_status: string | null;
  }[];
}

type ConfidenceLevel = "high" | "needs_attention" | "low";

function getConfidenceLevel(feedback: AIFeedback | null, status: string | null): ConfidenceLevel {
  if (!feedback || status === "error") return "low";
  if (status === "pending") return "low";
  
  const issueCount = feedback.issues?.length || 0;
  const strengthCount = feedback.strengths?.length || 0;
  
  if (issueCount === 0 && strengthCount >= 2) return "high";
  if (issueCount >= 2) return "needs_attention";
  return "high";
}

function getConfidenceConfig(level: ConfidenceLevel) {
  switch (level) {
    case "high":
      return {
        label: "High confidence",
        icon: CheckCircle,
        className: "text-success",
        bgClassName: "bg-success/10",
      };
    case "needs_attention":
      return {
        label: "Needs attention",
        icon: AlertTriangle,
        className: "text-warning",
        bgClassName: "bg-warning/10",
      };
    case "low":
      return {
        label: "Low confidence",
        icon: HelpCircle,
        className: "text-muted-foreground",
        bgClassName: "bg-muted",
      };
  }
}

const AIReviewSummary = ({ uploads }: AIReviewSummaryProps) => {
  const [expanded, setExpanded] = useState(false);

  // Check for pending/error states
  const hasPending = uploads.some(u => u.ai_feedback_status === "pending");
  const hasError = uploads.some(u => u.ai_feedback_status === "error");
  const pendingCount = uploads.filter(u => u.ai_feedback_status === "pending").length;
  const errorCount = uploads.filter(u => u.ai_feedback_status === "error").length;

  // Aggregate confidence across all uploads
  const confidenceLevels = uploads.map(u => 
    getConfidenceLevel(u.ai_feedback, u.ai_feedback_status)
  );
  
  // Overall confidence is the worst case
  const overallConfidence: ConfidenceLevel = confidenceLevels.includes("low") 
    ? "low" 
    : confidenceLevels.includes("needs_attention") 
      ? "needs_attention" 
      : "high";

  const config = getConfidenceConfig(overallConfidence);
  const Icon = config.icon;

  // Collect all feedback
  const allStrengths: string[] = [];
  const allIssues: string[] = [];
  const allSuggestions: string[] = [];
  
  uploads.forEach(u => {
    if (u.ai_feedback) {
      allStrengths.push(...(u.ai_feedback.strengths || []));
      allIssues.push(...(u.ai_feedback.issues || []));
      allSuggestions.push(...(u.ai_feedback.suggestions || []));
    }
  });

  const hasDetails = allStrengths.length > 0 || allIssues.length > 0 || allSuggestions.length > 0;
  
  // Show status banner if pending or error
  const showStatusBanner = hasPending || hasError;

  return (
    <div className={cn("rounded-lg border", config.bgClassName)}>
      {/* Status banner for pending/error states */}
      {showStatusBanner && (
        <div className="px-4 py-2 border-b flex items-center gap-2 text-sm">
          {hasPending && (
            <Badge variant="outline" className="bg-muted text-muted-foreground gap-1">
              <Loader className="h-3 w-3 animate-spin" />
              {pendingCount} analyzing...
            </Badge>
          )}
          {hasError && (
            <Badge variant="outline" className="bg-destructive/10 text-destructive gap-1">
              <XCircle className="h-3 w-3" />
              {errorCount} failed
            </Badge>
          )}
        </div>
      )}
      
      <Button
        variant="ghost"
        className="w-full justify-between px-4 py-3 h-auto"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", config.className)} />
          <span className="font-medium">AI Review: {config.label}</span>
        </div>
        {hasDetails && (
          expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {expanded && hasDetails && (
        <div className="px-4 pb-4 space-y-3">
          {allStrengths.length > 0 && (
            <div>
              <p className="text-xs font-medium text-success mb-1">Strengths</p>
              <ul className="text-sm space-y-1">
                {allStrengths.map((s, i) => (
                  <li key={i} className="text-muted-foreground">• {s}</li>
                ))}
              </ul>
            </div>
          )}

          {allIssues.length > 0 && (
            <div>
              <p className="text-xs font-medium text-warning mb-1">Issues</p>
              <ul className="text-sm space-y-1">
                {allIssues.map((s, i) => (
                  <li key={i} className="text-muted-foreground">• {s}</li>
                ))}
              </ul>
            </div>
          )}

          {allSuggestions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-primary mb-1">Suggestions</p>
              <ul className="text-sm space-y-1">
                {allSuggestions.map((s, i) => (
                  <li key={i} className="text-muted-foreground">• {s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIReviewSummary;
