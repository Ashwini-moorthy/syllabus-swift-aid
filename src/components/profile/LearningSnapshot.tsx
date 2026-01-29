import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap, 
  Brain, 
  Heart, 
  Sparkles,
  TrendingUp,
  BookOpen
} from 'lucide-react';

interface LearningSnapshotProps {
  profile: any;
  testResults: any[];
  progress: any[];
}

export function LearningSnapshot({ profile, testResults, progress }: LearningSnapshotProps) {
  // Calculate overall health score based on multiple factors
  const calculateHealthScore = () => {
    if (!testResults.length && !progress.length) return 0;
    
    // Factor 1: Average test performance (40%)
    const avgTestScore = testResults.length > 0
      ? testResults.reduce((acc, r) => acc + (r.score / r.total_questions) * 100, 0) / testResults.length
      : 50;
    
    // Factor 2: Completion rate (30%)
    const completedTopics = progress.filter(p => p.completed).length;
    const completionRate = Math.min((completedTopics / 20) * 100, 100); // Normalize to 20 topics
    
    // Factor 3: Consistency (30%) - based on strong performances
    const strongPerformances = testResults.filter(r => r.performance === 'strong').length;
    const consistencyRate = testResults.length > 0 
      ? (strongPerformances / testResults.length) * 100 
      : 50;
    
    return Math.round(avgTestScore * 0.4 + completionRate * 0.3 + consistencyRate * 0.3);
  };

  // Derive learning style from test patterns
  const deriveLearningStyle = () => {
    if (testResults.length < 3) return { style: 'Exploring', description: 'Take more quizzes to discover your style' };
    
    const avgScore = testResults.reduce((acc, r) => acc + (r.score / r.total_questions), 0) / testResults.length;
    const strongCount = testResults.filter(r => r.performance === 'strong').length;
    const weakCount = testResults.filter(r => r.performance === 'weak').length;
    
    if (avgScore > 0.8 && strongCount > weakCount * 2) {
      return { style: 'Quick Learner', description: 'You grasp concepts rapidly and excel in tests' };
    } else if (avgScore > 0.6) {
      return { style: 'Steady Builder', description: 'You learn through consistent practice' };
    } else if (weakCount > strongCount) {
      return { style: 'Deep Diver', description: 'You benefit from thorough explanations' };
    } else {
      return { style: 'Visual Thinker', description: 'You learn best with examples and diagrams' };
    }
  };

  const healthScore = calculateHealthScore();
  const learningStyle = deriveLearningStyle();
  
  const getHealthColor = (score: number) => {
    if (score >= 75) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getHealthBg = (score: number) => {
    if (score >= 75) return 'bg-success/10';
    if (score >= 50) return 'bg-warning/10';
    return 'bg-destructive/10';
  };

  return (
    <Card className="overflow-hidden border-2 border-primary/20">
      <div className="gradient-hero p-6 text-primary-foreground">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-white/30">
            <AvatarFallback className="text-2xl font-bold bg-white/20 text-white">
              {profile?.name?.charAt(0)?.toUpperCase() || 'S'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-display text-3xl font-bold mb-1">{profile?.name}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-0 gap-1">
                <GraduationCap className="h-3 w-3" />
                Grade {profile?.grade}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-0 gap-1">
                <Brain className="h-3 w-3" />
                {learningStyle.style}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Learning Style Card */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-accent/50">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{learningStyle.style}</p>
              <p className="text-sm text-muted-foreground">{learningStyle.description}</p>
            </div>
          </div>

          {/* Topics Completed */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-accent/50">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {progress.filter(p => p.completed).length}
              </p>
              <p className="text-sm text-muted-foreground">Topics Completed</p>
            </div>
          </div>

          {/* Health Score */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-accent/50">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${getHealthBg(healthScore)}`}>
              <Heart className={`h-6 w-6 ${getHealthColor(healthScore)}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-foreground">Health Score</p>
                <span className={`text-lg font-bold ${getHealthColor(healthScore)}`}>
                  {healthScore}%
                </span>
              </div>
              <Progress value={healthScore} className="h-2" />
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="mt-6 pt-6 border-t flex flex-wrap gap-6 justify-center text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{testResults.length}</p>
            <p className="text-sm text-muted-foreground">Tests Taken</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-success">
              {testResults.filter(r => r.performance === 'strong').length}
            </p>
            <p className="text-sm text-muted-foreground">Strong Results</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {profile?.current_streak || 0}
            </p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {profile?.longest_streak || 0}
            </p>
            <p className="text-sm text-muted-foreground">Best Streak</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
