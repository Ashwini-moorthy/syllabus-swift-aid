import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, TrendingUp, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { QuizHistory } from '@/components/progress/QuizHistory';

export default function ProgressPage() {
  const { user, profile } = useAuth();

  const { data: testResults } = useQuery({
    queryKey: ['all-test-results', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('test_results')
        .select(`
          *,
          topic:topics(
            id,
            name,
            chapter:chapters(
              id,
              name,
              subject:subjects(id, name, color)
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: progress } = useQuery({
    queryKey: ['all-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('student_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const totalTopics = progress?.length || 0;
  const totalTests = testResults?.length || 0;
  const avgScore = totalTests > 0
    ? Math.round(testResults!.reduce((acc, r) => acc + (r.score / r.total_questions) * 100, 0) / totalTests)
    : 0;

  const strongCount = testResults?.filter(r => r.performance === 'strong').length || 0;
  const averageCount = testResults?.filter(r => r.performance === 'average').length || 0;
  const weakCount = testResults?.filter(r => r.performance === 'weak').length || 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-bold">Your Progress</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalTopics}</p>
                  <p className="text-sm text-muted-foreground">Topics Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalTests}</p>
                  <p className="text-sm text-muted-foreground">Tests Taken</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgScore}%</p>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{strongCount}</p>
                  <p className="text-sm text-muted-foreground">Strong Results</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-success font-medium">Strong</span>
                <span>{strongCount} tests</span>
              </div>
              <Progress value={totalTests ? (strongCount / totalTests) * 100 : 0} className="h-3 bg-success/20" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-warning font-medium">Average</span>
                <span>{averageCount} tests</span>
              </div>
              <Progress value={totalTests ? (averageCount / totalTests) * 100 : 0} className="h-3 bg-warning/20" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-destructive font-medium">Needs Practice</span>
                <span>{weakCount} tests</span>
              </div>
              <Progress value={totalTests ? (weakCount / totalTests) * 100 : 0} className="h-3 bg-destructive/20" />
            </div>
          </CardContent>
        </Card>

        {/* Quiz History */}
        <QuizHistory results={testResults || []} />
      </div>
    </MainLayout>
  );
}
