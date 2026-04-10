import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface BadgeShowcaseProps {
  patientId: string;
}

export function BadgeShowcase({ patientId }: BadgeShowcaseProps) {
  const [badges, setBadges] = useState<any[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, [patientId]);

  const loadBadges = async () => {
    try {
      // Get earned badges
      const { data: earned } = await supabase
        .from('earned_badges')
        .select('*, badge:badges(*)')
        .eq('patient_id', patientId)
        .order('earned_at', { ascending: false });

      // Get all available badges
      const { data: all } = await supabase
        .from('badges')
        .select('*')
        .order('key');

      setBadges(earned || []);
      setAllBadges(all || []);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading badges...</div>
        </CardContent>
      </Card>
    );
  }

  const earnedKeys = new Set(badges.map(b => b.badge_key));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Badges</CardTitle>
        <CardDescription>
          {badges.length} of {allBadges.length || 10} earned
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
          {allBadges.map(badge => {
            const earned = earnedKeys.has(badge.key);
            const earnedBadge = badges.find(b => b.badge_key === badge.key);

            return (
              <TooltipProvider key={badge.key}>
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      className={cn(
                        'aspect-square rounded-lg flex items-center justify-center text-4xl transition-all cursor-pointer',
                        earned
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg hover:scale-110'
                          : 'bg-muted opacity-40 grayscale hover:opacity-60'
                      )}
                    >
                      {badge.icon}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center max-w-xs">
                      <div className="font-bold">{badge.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {badge.description}
                      </div>
                      {earned && earnedBadge && (
                        <div className="text-xs mt-2">
                          Earned {format(new Date(earnedBadge.earned_at), 'MMM d, yyyy')}
                        </div>
                      )}
                      {!earned && (
                        <div className="text-xs mt-2 text-yellow-500">
                          Locked
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>

        {/* Recent badges */}
        {badges.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3">Recently Earned</h4>
            <div className="space-y-2">
              {badges.slice(0, 3).map(b => (
                <div
                  key={b.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                >
                  <div className="text-2xl">{b.badge.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium">{b.badge.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(b.earned_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
