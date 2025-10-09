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
  created_at: string;
}

interface MessagesCardProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  onViewAll: () => void;
}

export function MessagesCard({ messages, onSendMessage, onViewAll }: MessagesCardProps) {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setSending(true);
    try {
      await onSendMessage(newMessage);
      setNewMessage("");
    } finally {
      setSending(false);
    }
  };

  const recentMessages = messages.slice(-3);

  return (
    <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow h-full flex flex-col bg-white/90 dark:bg-card/90 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages & Feedback
          </CardTitle>
          <CardDescription className="mt-1">Chat with your therapist</CardDescription>
        </div>
        {messages.length > 3 && (
          <Button variant="ghost" size="sm" onClick={onViewAll} className="text-sm">
            View all
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <div className="flex-1 flex flex-col">
        {recentMessages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm flex-1 flex flex-col items-center justify-center gap-2">
            <MessageSquare className="h-12 w-12 opacity-20" />
            <p>No messages yet — your therapist will check in soon.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-xl text-sm transition-all border ${
                  msg.therapist_id 
                    ? "bg-accent hover:shadow-sm" 
                    : "bg-primary/10 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold">
                    {msg.therapist_id ? msg.therapist?.name || "Therapist" : "You"}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed line-clamp-2">{msg.body}</p>
              </div>
            ))}
          </div>
        )}
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Reply to your coach…"
            disabled={sending}
            className="flex-1 rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 bg-background"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="rounded-xl px-4 hover:shadow-md transition-shadow"
            aria-busy={sending}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
