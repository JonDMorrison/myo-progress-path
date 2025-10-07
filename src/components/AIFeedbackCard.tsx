import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";

interface AIFeedback {
  strengths?: string[];
  issues?: string[];
  suggestions?: string[];
}

interface AIFeedbackCardProps {
  feedback: AIFeedback;
  compact?: boolean;
}

const AIFeedbackCard: React.FC<AIFeedbackCardProps> = ({ feedback, compact = false }) => {
  if (!feedback || (!feedback.strengths && !feedback.issues && !feedback.suggestions)) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <span className="text-lg">✨</span>
          </div>
          <CardTitle className="text-lg">AI Feedback</CardTitle>
          <Badge variant="secondary" className="ml-auto text-xs">
            Powered by Lovable AI
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedback.strengths && feedback.strengths.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-success">
              <CheckCircle2 className="h-4 w-4" />
              Strengths
            </div>
            <ul className="space-y-1 text-sm">
              {feedback.strengths.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.issues && feedback.issues.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-warning">
              <AlertCircle className="h-4 w-4" />
              Issues to Address
            </div>
            <ul className="space-y-1 text-sm">
              {feedback.issues.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-warning mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.suggestions && feedback.suggestions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Lightbulb className="h-4 w-4" />
              Suggestions
            </div>
            <ul className="space-y-1 text-sm">
              {feedback.suggestions.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIFeedbackCard;
