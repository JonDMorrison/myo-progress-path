import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, CheckCircle2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Assignment {
  id: string;
  week_id: string;
  week_number: number;
  week_title: string;
  due_date: string | null;
  status: string;
  notes: string | null;
  assigned_at: string;
}

interface MaintenanceAssignmentCardProps {
  assignments: Assignment[];
  onStatusChange?: () => void;
}

export function MaintenanceAssignmentCard({ assignments, onStatusChange }: MaintenanceAssignmentCardProps) {
  const [completing, setCompleting] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleStartPractice = (weekNumber: number) => {
    navigate(`/week/${weekNumber}`);
  };

  const handleMarkComplete = async (assignmentId: string) => {
    setCompleting(assignmentId);
    try {
      const { error } = await supabase
        .from("maintenance_assignments")
        .update({ 
          status: "completed",
          completed_at: new Date().toISOString()
        })
        .eq("id", assignmentId);

      if (error) throw error;

      toast({
        title: "Assignment completed!",
        description: "Great work on your practice session.",
      });
      
      onStatusChange?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCompleting(null);
    }
  };

  const activeAssignments = assignments.filter(a => a.status === "active");
  const completedAssignments = assignments.filter(a => a.status === "completed");

  if (assignments.length === 0) {
    return (
      <Card className="rounded-xl sm:rounded-2xl border shadow-sm">
        <CardContent className="py-8 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No practice assignments from your therapist yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl sm:rounded-2xl border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <BookOpen className="h-5 w-5 text-primary" />
          Practice Assignments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeAssignments.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Active</h4>
            {activeAssignments.map((assignment) => (
              <div 
                key={assignment.id}
                className="p-4 rounded-lg border bg-card space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-medium">Week {assignment.week_number}</h5>
                    <p className="text-sm text-muted-foreground">{assignment.week_title}</p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Active
                  </Badge>
                </div>
                
                {assignment.due_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Due: {format(new Date(assignment.due_date), "MMM d, yyyy")}
                  </div>
                )}
                
                {assignment.notes && (
                  <p className="text-sm text-muted-foreground italic">
                    "{assignment.notes}"
                  </p>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleStartPractice(assignment.week_number)}
                  >
                    Start Practice
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleMarkComplete(assignment.id)}
                    disabled={completing === assignment.id}
                  >
                    {completing === assignment.id ? "..." : "Mark Complete"}
                    <CheckCircle2 className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {completedAssignments.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Completed</h4>
            {completedAssignments.slice(0, 3).map((assignment) => (
              <div 
                key={assignment.id}
                className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Week {assignment.week_number}: {assignment.week_title}</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Done
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
