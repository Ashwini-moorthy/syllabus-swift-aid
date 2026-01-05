import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function SubjectPage() {
  const { subjectId } = useParams();
  const { profile, user } = useAuth();

  // Fetch subject details
  const { data: subject } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', subjectId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch chapters for this subject and grade
  const { data: chapters } = useQuery({
    queryKey: ['chapters', subjectId, profile?.grade],
    queryFn: async () => {
      if (!profile?.grade) return [];
      const { data, error } = await supabase
        .from('chapters')
        .select(`
          *,
          topics(id, name)
        `)
        .eq('subject_id', subjectId)
        .eq('grade', profile.grade)
        .order('order_index');
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.grade,
  });

  // Fetch student progress
  const { data: progress } = useQuery({
    queryKey: ['chapter-progress', user?.id, subjectId],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('student_progress')
        .select(`
          topic_id,
          completed,
          topic:topics(
            chapter_id
          )
        `)
        .eq('user_id', user.id)
        .eq('completed', true);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getChapterProgress = (chapterId: string, totalTopics: number) => {
    if (!progress || totalTopics === 0) return 0;
    const completedInChapter = progress.filter(
      (p: any) => p.topic?.chapter_id === chapterId
    ).length;
    return Math.round((completedInChapter / totalTopics) * 100);
  };

  const getCompletedTopicsCount = (chapterId: string) => {
    if (!progress) return 0;
    return progress.filter((p: any) => p.topic?.chapter_id === chapterId).length;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Back Button & Header */}
        <div>
          <Link to="/dashboard">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-primary-foreground"
              style={{ backgroundColor: subject?.color || 'hsl(var(--primary))' }}
            >
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">{subject?.name}</h1>
              <p className="text-muted-foreground">Grade {profile?.grade} • NCERT Curriculum</p>
            </div>
          </div>
        </div>

        {/* Chapters List */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-semibold">Chapters</h2>
          
          {chapters?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">No chapters available yet</h3>
                <p className="text-muted-foreground">
                  Content for Grade {profile?.grade} is being prepared.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {chapters?.map((chapter: any, index: number) => {
                const topicCount = chapter.topics?.length || 0;
                const progressPercent = getChapterProgress(chapter.id, topicCount);
                const completedCount = getCompletedTopicsCount(chapter.id);
                const isCompleted = progressPercent === 100;

                return (
                  <Link key={chapter.id} to={`/chapters/${chapter.id}`}>
                    <Card className="group hover:shadow-md transition-all cursor-pointer border-2 hover:border-primary/30">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold ${
                              isCompleted
                                ? 'bg-success text-success-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle2 className="h-6 w-6" />
                              ) : (
                                index + 1
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                  {chapter.name}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {chapter.description}
                                </p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                            </div>
                            
                            <div className="mt-3 flex items-center gap-4">
                              <div className="flex-1">
                                <Progress value={progressPercent} className="h-2" />
                              </div>
                              <span className="text-sm text-muted-foreground whitespace-nowrap">
                                {completedCount}/{topicCount} topics
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
