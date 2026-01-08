import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Flame, Calendar, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function StreakDisplay() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch streak data from profiles
  const { data: streakData } = useQuery({
    queryKey: ['streak', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('current_streak, longest_streak, last_activity_date')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Check and update streak on daily login
  const updateStreak = useMutation({
    mutationFn: async () => {
      if (!user) return;
      
      const today = new Date().toISOString().split('T')[0];
      const lastActivity = streakData?.last_activity_date;
      
      // If already logged today, no update needed
      if (lastActivity === today) return;
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      let newStreak = 1;
      
      // If last activity was yesterday, continue streak
      if (lastActivity === yesterdayStr) {
        newStreak = (streakData?.current_streak || 0) + 1;
      }
      // Otherwise, streak resets to 1 (new day after gap)
      
      const longestStreak = Math.max(newStreak, streakData?.longest_streak || 0);
      
      // Update profile with new streak
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_activity_date: today,
        })
        .eq('user_id', user.id);
      
      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streak'] });
    },
  });

  // Update streak when user logs in for the day
  useEffect(() => {
    if (user && streakData !== undefined) {
      const today = new Date().toISOString().split('T')[0];
      if (streakData?.last_activity_date !== today) {
        updateStreak.mutate();
      }
    }
  }, [user, streakData]);

  const currentStreak = streakData?.current_streak || 0;
  const longestStreak = streakData?.longest_streak || 0;

  // Check if streak is at risk (no activity today yet)
  const today = new Date().toISOString().split('T')[0];
  const isActiveToday = streakData?.last_activity_date === today;

  return (
    <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-200 dark:border-orange-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${isActiveToday ? 'bg-orange-500' : 'bg-muted'} transition-colors`}>
              <Flame className={`h-6 w-6 ${isActiveToday ? 'text-white' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {currentStreak}
                </span>
                <span className="text-sm text-muted-foreground">day streak</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isActiveToday ? '🔥 Keep it up!' : 'Learn today to maintain your streak!'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <Trophy className="h-4 w-4" />
                <span className="font-semibold">{longestStreak}</span>
              </div>
              <p className="text-xs text-muted-foreground">Best</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

