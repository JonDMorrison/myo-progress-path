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

  const recentMessages = messages.slice(-3);

  return (
    <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages & Feedback
          </CardTitle>
          <CardDescription className="mt-1">Chat with your therapist</CardDescription>
        </div>
        {messages.length > 3 && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View all
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {recentMessages.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No messages yet. Start a conversation!
          </div>
        ) : (
          <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-hide">
            {recentMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-xl text-sm ${
                  msg.therapist_id ? "bg-accent" : "bg-primary/10"
                }`}
              >
                <p className="font-medium mb-1">
                  {msg.therapist_id ? msg.therapist?.name || "Therapist" : "You"}
                </p>
                <p className="text-muted-foreground">{msg.body}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            rows={2}
            className="rounded-xl resize-none"
            disabled={sending}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="h-auto rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
