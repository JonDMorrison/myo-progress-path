import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { BottomNav } from "@/components/layout/BottomNav";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const PatientMessages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: patientData } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!patientData) throw new Error("Patient not found");
      setPatient(patientData);

      const { data: messagesData } = await supabase
        .from("messages")
        .select("*, therapist:therapist_id(name)")
        .eq("patient_id", patientData.id)
        .order("created_at", { ascending: true });

      setMessages(messagesData || []);
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
        therapist_id: patient.assigned_therapist_id,
        body: newMessage,
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

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/patient")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-black italic tracking-tight">Messaging Inbox</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <MobileContainer>
          <div className="space-y-4 mb-32">
            {messages.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 italic">
                <MessageSquare className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400">No messages yet. Send a message to your therapist!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.therapist_id ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-3xl shadow-sm ${msg.therapist_id
                        ? "bg-white border border-slate-100 rounded-bl-none"
                        : "bg-primary text-white rounded-br-none"
                      }`}
                  >
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${msg.therapist_id ? "text-primary" : "text-white/70"
                      }`}>
                      {msg.therapist_id ? msg.therapist?.name || "Therapist" : "You"}
                    </p>
                    <p className="text-sm leading-relaxed">{msg.body}</p>
                    <p className={`text-[9px] mt-2 ${msg.therapist_id ? "text-slate-400" : "text-white/50"
                      }`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </MobileContainer>
      </main>

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

      <BottomNav />
    </div>
  );
};

export default PatientMessages;
