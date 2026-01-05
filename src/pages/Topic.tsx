import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  BookOpen, 
  MessageCircle, 
  Youtube, 
  CheckCircle2,
  Volume2,
  VolumeX,
  Send,
  Loader2,
  GraduationCap,
  User,
  ClipboardList
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AIChatPanel } from '@/components/chat/AIChatPanel';
import { YouTubeVideos } from '@/components/learning/YouTubeVideos';
import { TopicQuiz } from '@/components/quiz/TopicQuiz';

export default function TopicPage() {
  const { topicId } = useParams();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(searchParams.get('chat') === 'true' ? 'chat' : 'learn');

  // Fetch topic details
  const { data: topic } = useQuery({
    queryKey: ['topic', topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topics')
        .select(`
          *,
          chapter:chapters(
            id,
            name,
            grade,
            subject:subjects(id, name, color)
          )
        `)
        .eq('id', topicId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch student progress for this topic
  const { data: progress } = useQuery({
    queryKey: ['topic-progress-single', user?.id, topicId],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('student_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('topic_id', topicId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Mark topic as completed
  const markCompleted = useMutation({
    mutationFn: async () => {
      if (!user || !topicId) return;
      
      const { error } = await supabase
        .from('student_progress')
        .upsert({
          user_id: user.id,
          topic_id: topicId,
          completed: true,
          completed_at: new Date().toISOString(),
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topic-progress'] });
      toast({
        title: 'Topic Completed! 🎉',
        description: 'Great job! Keep up the excellent work.',
      });
    },
  });

  const isCompleted = progress?.completed;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link to={`/chapters/${topic?.chapter?.id}`}>
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to {topic?.chapter?.name}
            </Button>
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge
              variant="secondary"
              className="text-primary-foreground"
              style={{ backgroundColor: topic?.chapter?.subject?.color }}
            >
              {topic?.chapter?.subject?.name}
            </Badge>
            <Badge variant="outline">{topic?.chapter?.name}</Badge>
            {isCompleted && (
              <Badge className="bg-success text-success-foreground gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </Badge>
            )}
          </div>
          
          <h1 className="font-display text-3xl font-bold">{topic?.name}</h1>
          <p className="text-muted-foreground mt-2">{topic?.description}</p>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="learn" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Learn</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">AI Tutor</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Youtube className="h-4 w-4" />
              <span className="hidden sm:inline">Videos</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Quiz</span>
            </TabsTrigger>
          </TabsList>

          {/* Learn Tab */}
          <TabsContent value="learn" className="space-y-4">
            <Card>
              <CardContent className="p-6 prose prose-slate max-w-none">
                <div className="whitespace-pre-wrap text-lg leading-relaxed">
                  {topic?.content || 'Content is being prepared for this topic.'}
                </div>
              </CardContent>
            </Card>

            {!isCompleted && (
              <Button
                size="lg"
                onClick={() => markCompleted.mutate()}
                disabled={markCompleted.isPending}
                className="w-full sm:w-auto"
              >
                {markCompleted.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Mark as Completed
              </Button>
            )}
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <AIChatPanel 
              topicId={topicId!}
              topicName={topic?.name || ''}
              chapterName={topic?.chapter?.name || ''}
              subjectName={topic?.chapter?.subject?.name || ''}
              grade={profile?.grade || 6}
            />
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <YouTubeVideos videos={(topic?.youtube_videos as Array<{title: string; url: string; thumbnail?: string}>) || []} topicName={topic?.name || ''} />
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz">
            <TopicQuiz 
              topicId={topicId!}
              topicName={topic?.name || ''}
              grade={profile?.grade || 6}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
