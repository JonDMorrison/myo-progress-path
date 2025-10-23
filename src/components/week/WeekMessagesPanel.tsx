import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface WeekMessagesPanelProps {
  messages: any[];
  newMessage: string;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
}

export function WeekMessagesPanel({ 
  messages, 
  newMessage, 
  onMessageChange, 
  onSendMessage 
}: WeekMessagesPanelProps) {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Messages</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages Thread */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No messages yet. Send a message to your therapist!
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className="flex gap-3 p-3 bg-muted rounded-lg"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {message.therapist?.name?.charAt(0) || 'T'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {message.therapist?.name || 'Therapist'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(message.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm">{message.body}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* New Message Form */}
        <div className="space-y-2">
          <Textarea
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Ask your therapist a question..."
            rows={3}
          />
          <Button
            onClick={onSendMessage}
            disabled={!newMessage.trim()}
            className="w-full"
          >
            <Send className="mr-2 h-4 w-4" />
            Send Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
