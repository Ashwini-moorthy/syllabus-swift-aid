import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useStreak() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const recordActivity = useMutation({
    mutationFn: async () => {
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      // Get current profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_streak, longest_streak, last_activity_date')
        .eq('user_id', user.id)
        .single();

      const lastActivity = profile?.last_activity_date;

      // If already logged today, just increment topics
      if (lastActivity === today) {
        // Increment topics completed
        const { data: existing } = await supabase
          .from('daily_activity')
          .select('topics_completed')
          .eq('user_id', user.id)
          .eq('activity_date', today)
          .single();

        await supabase
          .from('daily_activity')
          .upsert({
            user_id: user.id,
            activity_date: today,
            topics_completed: (existing?.topics_completed || 0) + 1,
          });
        return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = 1;

      // If last activity was yesterday, continue streak
      if (lastActivity === yesterdayStr) {
        newStreak = (profile?.current_streak || 0) + 1;
      }

      const longestStreak = Math.max(newStreak, profile?.longest_streak || 0);

      // Update profile
      await supabase
        .from('profiles')
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_activity_date: today,
        })
        .eq('user_id', user.id);

      // Log daily activity
      await supabase
        .from('daily_activity')
        .upsert({
          user_id: user.id,
          activity_date: today,
          topics_completed: 1,
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streak'] });
    },
  });

  return { recordActivity };
}
