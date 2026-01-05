import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, CheckCircle2, Play, MessageCircle, Youtube } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function ChapterPage() {
  const { chapterId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch chapter details
  const { data: chapter } = useQuery({
    queryKey: ['chapter', chapterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chapters')
        .select(`
          *,
          subject:subjects(id, name, color)
        `)
        .eq('id', chapterId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch topics for this chapter
  const { data: topics } = useQuery({
    queryKey: ['topics', chapterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('chapter_id', chapterId)
        .order('order_index');
      if (error) throw error;
      return data;
    },
  });

  // Fetch student progress
  const { data: progress } = useQuery({
    queryKey: ['topic-progress', user?.id, chapterId],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('student_progress')
        .select('topic_id, completed')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const isTopicCompleted = (topicId: string) => {
    return progress?.some((p: any) => p.topic_id === topicId && p.completed);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Back Button & Header */}
        <div>
          <Link to={`/subjects/${chapter?.subject?.id}`}>
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to {chapter?.subject?.name}
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-2">
            <Badge
              variant="secondary"
              className="text-primary-foreground"
              style={{ backgroundColor: chapter?.subject?.color }}
            >
              {chapter?.subject?.name}
            </Badge>
            <Badge variant="outline">Grade {chapter?.grade}</Badge>
          </div>
          
          <h1 className="font-display text-3xl font-bold">{chapter?.name}</h1>
          <p className="text-muted-foreground mt-2">{chapter?.description}</p>
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-semibold">Topics</h2>
          
          {topics?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">No topics available yet</h3>
                <p className="text-muted-foreground">
                  Topics for this chapter are being prepared.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {topics?.map((topic: any, index: number) => {
                const completed = isTopicCompleted(topic.id);
                const hasVideos = topic.youtube_videos && topic.youtube_videos.length > 0;

                return (
                  <Card
                    key={topic.id}
                    className={`group cursor-pointer transition-all hover:shadow-md border-2 ${
                      completed ? 'border-success/30 bg-success/5' : 'hover:border-primary/30'
                    }`}
                    onClick={() => navigate(`/topics/${topic.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          completed
                            ? 'bg-success text-success-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {completed ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <span className="font-medium">{index + 1}</span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-medium group-hover:text-primary transition-colors">
                            {topic.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {topic.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {hasVideos && (
                            <Badge variant="outline" className="gap-1">
                              <Youtube className="h-3 w-3" />
                              Video
                            </Badge>
                          )}
                          <Button size="sm" variant={completed ? "secondary" : "default"}>
                            {completed ? 'Review' : 'Start'}
                            <Play className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Chapter Actions */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-dashed">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">Need help with this chapter?</h3>
                  <p className="text-sm text-muted-foreground">
                    Chat with AI tutor for personalized explanations
                  </p>
                </div>
              </div>
              <Button onClick={() => topics?.[0] && navigate(`/topics/${topics[0].id}?chat=true`)}>
                Start AI Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
