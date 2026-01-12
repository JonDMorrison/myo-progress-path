import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Video, Image, Check, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface TherapistFeedback {
  id: string;
  feedback_text: string | null;
  video_url: string | null;
  photo_url: string | null;
  created_at: string;
  read_at: string | null;
  therapist: {
    name: string | null;
  } | null;
  exercise: {
    title: string;
  } | null;
}

interface TherapistFeedbackListProps {
  patientId: string;
  weekId?: string;
}

const TherapistFeedbackList = ({ patientId, weekId }: TherapistFeedbackListProps) => {
  const [feedback, setFeedback] = useState<TherapistFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedback();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('therapist-feedback-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'therapist_feedback',
          filter: `patient_id=eq.${patientId}`,
        },
        () => {
          loadFeedback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patientId, weekId]);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("therapist_feedback")
        .select(`
          id,
          feedback_text,
          video_url,
          photo_url,
          created_at,
          read_at,
          therapist:therapist_id(name),
          exercise:exercise_id(title)
        `)
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (weekId) {
        query = query.eq("week_id", weekId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFeedback((data as unknown as TherapistFeedback[]) || []);

      // Mark unread feedback as read
      const unreadIds = data
        ?.filter((f: any) => !f.read_at)
        .map((f: any) => f.id) || [];

      if (unreadIds.length > 0) {
        await supabase
          .from("therapist_feedback")
          .update({ read_at: new Date().toISOString() })
          .in("id", unreadIds);
      }
    } catch (error) {
      console.error("Error loading feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading feedback...
        </CardContent>
      </Card>
    );
  }

  if (feedback.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Therapist Feedback
          {feedback.some((f) => !f.read_at) && (
            <Badge variant="default" className="ml-2">New</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-80">
          <div className="space-y-4">
            {feedback.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border ${
                  !item.read_at ? "bg-primary/5 border-primary/20" : "bg-muted/50"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium">
                      {item.therapist?.name || "Your Therapist"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(item.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.video_url && (
                      <Badge variant="outline" className="text-xs">
                        <Video className="h-3 w-3 mr-1" />
                        Video
                      </Badge>
                    )}
                    {item.photo_url && (
                      <Badge variant="outline" className="text-xs">
                        <Image className="h-3 w-3 mr-1" />
                        Photo
                      </Badge>
                    )}
                    {item.read_at && (
                      <Check className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {item.exercise && (
                  <Badge variant="secondary" className="mb-2 text-xs">
                    {item.exercise.title}
                  </Badge>
                )}

                {item.feedback_text && (
                  <p className="text-sm mb-3">{item.feedback_text}</p>
                )}

                {/* Media attachments */}
                <div className="flex flex-wrap gap-2">
                  {item.video_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={item.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Video className="h-4 w-4 mr-1" />
                        Watch Video
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  )}
                  {item.photo_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={item.photo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Image className="h-4 w-4 mr-1" />
                        View Photo
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TherapistFeedbackList;
