import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import { TherapistLayout } from "@/components/layout/TherapistLayout";

const TherapistAIAssist = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);

  const quickQueries = [
    "Summarize all patients who are pending review",
    "Which patients are struggling with compensations?",
    "Show me patients with low adherence this week",
    "Who needs follow-up this week?",
  ];

  const handleQuery = async (queryText: string) => {
    setLoading(true);
    setQuery(queryText);
    
    try {
      // Get user context
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not authenticated");
      }

      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!userData || (userData.role !== "therapist" && userData.role !== "admin" && userData.role !== "super_admin")) {
        throw new Error("Insufficient permissions");
      }

      // Get patient data for context
      const patientsQuery = supabase
        .from("patient_week_progress")
        .select("*, patients!inner(id, program_variant, assigned_therapist_id, users!patients_user_id_fkey(name)), weeks(number)")
        .in("status", ["submitted", "needs_more", "approved"])
        .order("completed_at", { ascending: false })
        .limit(50);

      if (userData.role === "therapist") {
        patientsQuery.eq("patients.assigned_therapist_id", user.id);
      }

      const { data: patients } = await patientsQuery;

      const contextData = JSON.stringify(patients?.slice(0, 50) || []); // Limit to 50 for token efficiency

      // Call AI with structured context
      const { data: aiData, error } = await supabase.functions.invoke("therapist-ai-query", {
        body: {
          query: queryText,
          context: contextData,
          history: chatHistory,
        },
      });

      if (error) throw error;

      const aiResponse = aiData.response || "No response generated";
      setResponse(aiResponse);
      
      setChatHistory(prev => [
        ...prev,
        { role: "user", content: queryText },
        { role: "assistant", content: aiResponse },
      ]);

      toast({
        title: "Query completed",
        description: "AI analysis generated successfully",
      });
    } catch (error: any) {
      console.error("Error querying AI:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to query AI assistant",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TherapistLayout title="AI Assistant" description="Get AI-powered insights about your patients">
      <div className="max-w-4xl mx-auto space-y-6">

        <Card>
          <CardHeader>
            <CardTitle>Quick Queries</CardTitle>
            <CardDescription>Common questions to get started</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickQueries.map((q, i) => (
              <Button
                key={i}
                variant="outline"
                className="h-auto p-4 text-left justify-start whitespace-normal"
                onClick={() => handleQuery(q)}
                disabled={loading}
              >
                {q}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ask Your Question</CardTitle>
            <CardDescription>Type your query about patients, progress, or trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="e.g., Which patients need the most attention this week?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
              disabled={loading}
            />
            <Button
              onClick={() => handleQuery(query)}
              disabled={loading || !query.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Query
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {chatHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg ${
                    msg.role === "user"
                      ? "bg-primary/10 ml-8"
                      : "bg-muted mr-8"
                  }`}
                >
                  <p className="text-sm font-semibold mb-2">
                    {msg.role === "user" ? "You" : "AI Assistant"}
                  </p>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </TherapistLayout>
  );
};

export default TherapistAIAssist;
