import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { useQuery } from '@tanstack/react-query';
import { LearningSnapshot } from '@/components/profile/LearningSnapshot';
import { ConceptMasteryMap } from '@/components/profile/ConceptMasteryMap';
import { MistakePatternDashboard } from '@/components/profile/MistakePatternDashboard';
import { LearningWarnings } from '@/components/profile/LearningWarnings';
import { Skeleton } from '@/components/ui/skeleton';

export default function Profile() {
  const { profile, user } = useAuth();

  // Fetch all test results for analysis
  const { data: testResults, isLoading: loadingTests } = useQuery({
    queryKey: ['profile-test-results', user?.id],
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
  });

  // Fetch student progress
  const { data: progress, isLoading: loadingProgress } = useQuery({
    queryKey: ['profile-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('student_progress')
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
        .eq('user_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch all subjects with their chapters and topics
  const { data: subjects, isLoading: loadingSubjects } = useQuery({
    queryKey: ['profile-subjects', profile?.grade],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase
        .from('subjects')
        .select(`
          id,
          name,
          color,
          chapters!chapters_subject_id_fkey(
            id,
            name,
            grade,
            topics(id, name)
          )
        `)
        .order('order_index');
      if (error) throw error;
      
      // Filter chapters by student grade
      return data?.map(subject => ({
        ...subject,
        chapters: subject.chapters?.filter((ch: any) => ch.grade === profile.grade) || []
      })) || [];
    },
    enabled: !!profile,
  });

  const isLoading = loadingTests || loadingProgress || loadingSubjects;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* 1️⃣ Learning Snapshot - Top Section */}
        <LearningSnapshot 
          profile={profile} 
          testResults={testResults || []} 
          progress={progress || []}
        />

        {/* 2️⃣ Concept Mastery Map */}
        <ConceptMasteryMap 
          subjects={subjects || []} 
          progress={progress || []} 
          testResults={testResults || []}
        />

        {/* 3️⃣ Mistake Pattern Dashboard */}
        <MistakePatternDashboard testResults={testResults || []} />

        {/* 4️⃣ Personalized Learning Warnings */}
        <LearningWarnings 
          subjects={subjects || []} 
          progress={progress || []} 
          testResults={testResults || []}
        />
      </div>
    </MainLayout>
  );
}
