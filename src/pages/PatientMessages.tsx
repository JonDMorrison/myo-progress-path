import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { BottomNav } from "@/components/layout/BottomNav";
import { PatientHeader } from "@/components/layout/PatientHeader";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { FeedbackMediaButtons, cleanFeedbackBody } from "@/lib/feedbackMedia";
import { patientRequiresVideo } from "@/lib/constants";

const PatientMessages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { user: authUser } = useAuth();

  useEffect(() => {
    if (authUser) {
      loadMessages(authUser.id);
    }
  }, [authUser?.id]);

  const loadMessages = async (userId?: string) => {
    try {
      let uid = userId;
      if (!uid) {
        uid = authUser?.id;
        if (!uid) return;
      }

      const { data: patientData } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", uid)
        .single();

      if (!patientData) throw new Error("Patient not found");
      setPatient(patientData);

      // Load messages first — non-video patients may still have historical
      // therapist feedback to read. Only redirect away if they truly have
      // nothing to see AND can't message the therapist.
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .eq("patient_id", patientData.id)
        .order("created_at", { ascending: true });

      const rows = messagesData || [];
      setMessages(rows);

      if ((patientData as any).requires_video === false && rows.length === 0) {
        navigate("/patient", { replace: true });
        return;
      }
    } catch (error: any) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !patient) return;

    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        patient_id: patient.id,
        body: newMessage,
        sent_by: 'patient',
      });

      if (error) throw error;

      setNewMessage("");
      loadMessages();
      toast({
        title: "Message sent!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const canCompose = patientRequiresVideo(patient);

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      <PatientHeader />
      <header className="border-b bg-white/80">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/patient")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-black italic tracking-tight">Messaging Inbox</h1>
        </div>
      </header>

      <main className={`container mx-auto px-4 py-6 max-w-2xl ${canCompose ? "" : "pb-12"}`}>
        <MobileContainer>
          <div className={`space-y-4 ${canCompose ? "mb-32" : ""}`}>
            {messages.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 italic">
                <MessageSquare className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400">
                  {canCompose
                    ? "No messages yet. Send a message to your therapist!"
                    : "No messages yet."}
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const fromPatient = msg.sent_by === 'patient' || (!msg.sent_by && !msg.therapist_id);
                const isSystem = msg.sent_by === 'system';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${fromPatient ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-3xl shadow-sm ${
                        fromPatient
                          ? "bg-primary text-white rounded-br-none"
                          : isSystem
                            ? "bg-blue-50 border border-blue-200 rounded-bl-none"
                            : "bg-white border border-slate-100 rounded-bl-none"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${
                          fromPatient ? "text-white/70" : isSystem ? "text-blue-600" : "text-primary"
                        }`}>
                          {isSystem ? "Notification" : fromPatient ? "You" : msg.therapist?.name || "Therapist"}
                        </p>
                        <p className={`text-[9px] ${fromPatient ? "text-white/50" : "text-slate-400"}`}>
                          {format(new Date(msg.created_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {cleanFeedbackBody(msg.body)}
                      </p>
                      <FeedbackMediaButtons
                        videoUrl={msg.video_url}
                        photoUrl={msg.photo_url}
                        className="mt-3"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </MobileContainer>
      </main>

      {canCompose && (
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t">
          <div className="container mx-auto max-w-2xl flex gap-3">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              className="rounded-2xl resize-none shadow-sm border-slate-200"
              rows={2}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="h-auto rounded-2xl px-6 bg-slate-900"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default PatientMessages;
