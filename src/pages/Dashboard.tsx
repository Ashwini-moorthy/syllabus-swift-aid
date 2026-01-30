import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calculator, Atom, Globe, BookOpen, ArrowRight, Trophy, Clock, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { StreakDisplay } from '@/components/streak/StreakDisplay';
const subjectIcons: Record<string, any> = {
  Calculator,
  Atom,
  Globe,
  BookOpen,
};

const subjectColorClasses: Record<string, string> = {
  'hsl(221, 83%, 53%)': 'bg-math',
  'hsl(142, 76%, 36%)': 'bg-science',
  'hsl(24, 95%, 53%)': 'bg-social',
  'hsl(280, 65%, 60%)': 'bg-english',
};

export default function Dashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  // Fetch subjects
  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data;
    },
  });

  // Fetch progress
  const { data: progress } = useQuery({
    queryKey: ['student-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('student_progress')
        .select(`
          *,
          topic:topics(
            id,
            chapter:chapters(
              id,
              subject_id
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('completed', true);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Fetch test results
  const { data: testResults } = useQuery({
    queryKey: ['test-results', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Calculate subject progress
  const getSubjectProgress = (subjectId: string) => {
    if (!progress) return 0;
    const subjectProgress = progress.filter(
      (p: any) => p.topic?.chapter?.subject_id === subjectId
    );
    return subjectProgress.length;
  };

  // Calculate average score
  const averageScore = testResults?.length
    ? Math.round(
        testResults.reduce((acc: number, r: any) => acc + (r.score / r.total_questions) * 100, 0) /
        testResults.length
      )
    : 0;

  const totalTopicsCompleted = progress?.length || 0;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="gradient-hero rounded-2xl p-8 text-primary-foreground">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {profile?.name}! 👋
              </h1>
              <p className="text-white/80 text-lg">
                Ready to continue your learning journey? Let's make today count!
              </p>
            </div>
            <Button
              size="lg"
              variant="secondary"
              className="self-start md:self-auto"
              onClick={() => navigate('/subjects')}
            >
              Continue Learning
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Streak Display */}
        <StreakDisplay />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalTopicsCompleted}</p>
                  <p className="text-sm text-muted-foreground">Topics Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{averageScore}%</p>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Grade {profile?.grade}</p>
                  <p className="text-sm text-muted-foreground">Current Level</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subjects Grid */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-4">Your Subjects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjects?.map((subject: any) => {
              const Icon = subjectIcons[subject.icon] || BookOpen;
              const completedTopics = getSubjectProgress(subject.id);
              
              return (
                <Link key={subject.id} to={`/subjects/${subject.id}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer h-full border-2 hover:border-primary/30">
                    <CardHeader className="pb-2">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground mb-3"
                        style={{ backgroundColor: subject.color }}
                      >
                        <Icon className="h-7 w-7" />
                      </div>
                      <CardTitle className="font-display text-xl group-hover:text-primary transition-colors">
                        {subject.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {subject.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{completedTopics} topics</span>
                        </div>
                        <Progress value={Math.min(completedTopics * 10, 100)} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        {testResults && testResults.length > 0 && (
          <div>
            <h2 className="font-display text-2xl font-bold mb-4">Recent Tests</h2>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {testResults.map((result: any, index: number) => (
                    <div key={result.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          result.performance === 'strong'
                            ? 'bg-success/10 text-success'
                            : result.performance === 'average'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          <Trophy className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Test #{testResults.length - index}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {result.performance} performance
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {result.score}/{result.total_questions}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {Math.round((result.score / result.total_questions) * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
