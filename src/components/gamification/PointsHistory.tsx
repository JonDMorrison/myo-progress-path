import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface PointsHistoryProps {
  patientId: string;
}

export function PointsHistory({ patientId }: PointsHistoryProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();

    // Subscribe to new point awards
    const channel = supabase
      .channel('points_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          if (payload.new.type === 'points_awarded') {
            loadHistory();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patientId]);

  const loadHistory = async () => {
    try {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('patient_id', patientId)
        .eq('type', 'points_awarded')
        .order('created_at', { ascending: false })
        .limit(20);

      setHistory(data || []);
    } catch (error) {
      console.error('Error loading points history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group by day
  const groupedByDay = (history as any[]).reduce((acc, event) => {
    const day = format(new Date(event.created_at), 'yyyy-MM-dd');
    if (!acc[day]) acc[day] = [];
    acc[day].push(event);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Points History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Points History</CardTitle>
        <CardDescription>Your recent point awards</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {Object.entries(groupedByDay).map(([day, events]: [string, any[]]) => {
              const dayTotal = events.reduce(
                (sum, e) => sum + ((e.meta as any)?.points || 0),
                0
              );

              return (
                <div key={day}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">
                      {format(new Date(day), 'MMMM d, yyyy')}
                    </h4>
                    <Badge variant="secondary">+{dayTotal} pts</Badge>
                  </div>

                  <div className="space-y-2 pl-4 border-l-2">
                    {events.map(event => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span>{(event.meta as any)?.reason || 'Points awarded'}</span>
                        </div>
                        <span className="font-medium text-primary">
                          +{(event.meta as any)?.points}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {Object.keys(groupedByDay).length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No points history yet
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
