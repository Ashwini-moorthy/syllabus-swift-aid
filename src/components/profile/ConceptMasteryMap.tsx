import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  ChevronRight,
  Calculator,
  Atom,
  Globe,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConceptMasteryMapProps {
  subjects: any[];
  progress: any[];
  testResults: any[];
}

const subjectIcons: Record<string, any> = {
  Calculator,
  Atom,
  Globe,
  BookOpen,
};

type MasteryStatus = 'mastered' | 'in-progress' | 'weak' | 'not-started';

export function ConceptMasteryMap({ subjects, progress, testResults }: ConceptMasteryMapProps) {
  // Get mastery status for each topic
  const getTopicMastery = (topicId: string): MasteryStatus => {
    const topicProgress = progress.find(p => p.topic_id === topicId);
    const topicTests = testResults.filter(r => r.topic_id === topicId);
    
    // Not started
    if (!topicProgress && topicTests.length === 0) {
      return 'not-started';
    }
    
    // Check test performance
    if (topicTests.length > 0) {
      const avgScore = topicTests.reduce((acc, t) => acc + (t.score / t.total_questions), 0) / topicTests.length;
      if (avgScore >= 0.8) return 'mastered';
      if (avgScore >= 0.5) return 'in-progress';
      return 'weak';
    }
    
    // Completed but not tested
    if (topicProgress?.completed) {
      return 'in-progress';
    }
    
    return 'not-started';
  };

  // Get chapter mastery summary
  const getChapterMastery = (chapter: any) => {
    const topics = chapter.topics || [];
    const masteryStatuses = topics.map((t: any) => getTopicMastery(t.id));
    
    const mastered = masteryStatuses.filter((s: MasteryStatus) => s === 'mastered').length;
    const inProgress = masteryStatuses.filter((s: MasteryStatus) => s === 'in-progress').length;
    const weak = masteryStatuses.filter((s: MasteryStatus) => s === 'weak').length;
    const notStarted = masteryStatuses.filter((s: MasteryStatus) => s === 'not-started').length;
    
    // Determine overall chapter status
    if (topics.length === 0) return { status: 'not-started' as MasteryStatus, mastered, weak, total: 0 };
    if (mastered === topics.length) return { status: 'mastered' as MasteryStatus, mastered, weak, total: topics.length };
    if (weak > mastered) return { status: 'weak' as MasteryStatus, mastered, weak, total: topics.length };
    if (inProgress > 0 || mastered > 0) return { status: 'in-progress' as MasteryStatus, mastered, weak, total: topics.length };
    return { status: 'not-started' as MasteryStatus, mastered, weak, total: topics.length };
  };

  const getMasteryIcon = (status: MasteryStatus) => {
    switch (status) {
      case 'mastered':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'in-progress':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'weak':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-muted" />;
    }
  };

  const getMasteryLabel = (status: MasteryStatus) => {
    switch (status) {
      case 'mastered': return '✔';
      case 'in-progress': return '⚠';
      case 'weak': return '✖';
      default: return '○';
    }
  };

  const getMasteryBadge = (status: MasteryStatus) => {
    const variants: Record<MasteryStatus, { class: string; label: string }> = {
      'mastered': { class: 'bg-success/10 text-success border-success/20', label: 'Mastered' },
      'in-progress': { class: 'bg-warning/10 text-warning border-warning/20', label: 'In Progress' },
      'weak': { class: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Needs Work' },
      'not-started': { class: 'bg-muted/50 text-muted-foreground border-muted', label: 'Not Started' },
    };
    return variants[status];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl flex items-center gap-2">
          🗺️ Concept Mastery Map
        </CardTitle>
        <CardDescription>
          Visual summary of your learning progress across all subjects
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {subjects.map((subject) => {
          const Icon = subjectIcons[subject.icon] || BookOpen;
          const chapters = subject.chapters || [];
          
          // Skip subjects with no chapters for this grade
          if (chapters.length === 0) return null;
          
          return (
            <div key={subject.id} className="space-y-3">
              {/* Subject Header */}
              <div className="flex items-center gap-3">
                <div 
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: subject.color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{subject.name}</h3>
              </div>
              
              {/* Chapters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-2">
                {chapters.slice(0, 6).map((chapter: any) => {
                  const mastery = getChapterMastery(chapter);
                  const badge = getMasteryBadge(mastery.status);
                  
                  return (
                    <div 
                      key={chapter.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm",
                        mastery.status === 'weak' && "border-destructive/30 bg-destructive/5",
                        mastery.status === 'mastered' && "border-success/30 bg-success/5",
                        mastery.status === 'in-progress' && "border-warning/30 bg-warning/5",
                        mastery.status === 'not-started' && "border-muted bg-muted/20"
                      )}
                    >
                      {getMasteryIcon(mastery.status)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{chapter.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {mastery.mastered}/{mastery.total} topics mastered
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {chapters.length > 6 && (
                <p className="text-sm text-muted-foreground pl-2">
                  +{chapters.length - 6} more chapters
                </p>
              )}
            </div>
          );
        })}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span>Mastered (80%+)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-warning" />
            <span>In Progress (50-79%)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <XCircle className="h-4 w-4 text-destructive" />
            <span>Needs Work (&lt;50%)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-4 w-4 rounded-full border-2 border-muted" />
            <span>Not Started</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
