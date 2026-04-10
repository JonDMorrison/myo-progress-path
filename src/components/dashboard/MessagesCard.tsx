import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";
import { useState } from "react";

interface Message {
  id: string;
  body: string;
  therapist_id?: string;
  therapist?: { name: string };
  sent_by?: 'patient' | 'therapist';
  created_at: string;
}

interface MessagesCardProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
}

export function MessagesCard({ messages, onSendMessage }: MessagesCardProps) {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await onSendMessage(newMessage);
      setNewMessage("");
    } finally {
      setSending(false);
    }
  };

  // Show latest 5 messages in chronological order (oldest at top, newest
  // at bottom — chat style). The parent query is ascending so we just slice.
  const recentMessages = messages.slice(-5);

  return (
    <Card className="rounded-[2.5rem] border-none shadow-premium bg-white relative overflow-hidden h-full flex flex-col group transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-black italic tracking-tight flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Inbox
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-[10px] uppercase font-black tracking-widest text-primary hover:bg-primary/5 rounded-full"
            onClick={() => window.location.href = '/patient/messages'}
          >
            Full Inbox →
          </Button>
        </div>
        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Chat with your therapist
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col relative z-10 pt-0">
        <div className="flex-1 flex flex-col min-h-[200px]">
          {recentMessages.length === 0 ? (
            <div className="text-center py-10 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs italic flex-1 flex flex-col items-center justify-center gap-2">
              <MessageSquare className="w-8 h-8 opacity-20" />
              Start a conversation!
            </div>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-2xl text-sm transition-all duration-300 ${(msg.sent_by === 'patient' || (!msg.sent_by && !msg.therapist_id))
                      ? "bg-primary/5 border border-primary/10 rounded-br-none ml-8"
                      : "bg-slate-50 border border-slate-100/50 rounded-bl-none mr-8 shadow-sm"
                    }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${(msg.sent_by === 'patient' || (!msg.sent_by && !msg.therapist_id)) ? "text-slate-400" : "text-primary"
                      }`}>
                      {(msg.sent_by === 'patient' || (!msg.sent_by && !msg.therapist_id)) ? "You" : msg.therapist?.name || "Therapist"}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">
                      {new Date(msg.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-xs font-medium">
                    {msg.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            rows={1}
            className="rounded-2xl resize-none bg-slate-50 border-none shadow-inner text-sm py-3 px-4 focus-visible:ring-primary/20"
            disabled={sending}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="h-12 w-12 rounded-2xl bg-slate-900 shadow-xl shadow-slate-200 hover:bg-primary transition-all"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      {/* Background accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -z-0" />
    </Card>
  );
}
