import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar, ArrowRight, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';

interface QuizResult {
  id: string;
  score: number;
  total_questions: number;
  performance: string | null;
  created_at: string;
  topic_id: string | null;
  topic?: {
    id: string;
    name: string;
    chapter?: {
      id: string;
      name: string;
      subject?: {
        id: string;
        name: string;
        color: string | null;
      };
    };
  };
}

interface QuizHistoryProps {
  results: QuizResult[];
}

export function QuizHistory({ results }: QuizHistoryProps) {
  if (!results || results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Quiz History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No quizzes taken yet</p>
            <p className="text-sm mt-1">Complete a quiz to see your history here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Quiz History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {results.map((result) => {
            const percentage = Math.round((result.score / result.total_questions) * 100);
            const performanceColor = 
              result.performance === 'strong' 
                ? 'bg-success/10 text-success border-success/30' 
                : result.performance === 'average'
                ? 'bg-warning/10 text-warning border-warning/30'
                : 'bg-destructive/10 text-destructive border-destructive/30';
            
            const performanceLabel = 
              result.performance === 'strong' 
                ? 'Strong' 
                : result.performance === 'average'
                ? 'Average'
                : 'Needs Practice';

            return (
              <div 
                key={result.id} 
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    result.performance === 'strong'
                      ? 'bg-success/10 text-success'
                      : result.performance === 'average'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {result.topic?.chapter?.subject && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs"
                          style={{ 
                            backgroundColor: result.topic.chapter.subject.color || undefined,
                            color: 'white'
                          }}
                        >
                          {result.topic.chapter.subject.name}
                        </Badge>
                      )}
                      <Badge variant="outline" className={performanceColor}>
                        {performanceLabel}
                      </Badge>
                    </div>
                    <p className="font-medium">
                      {result.topic?.name || 'Practice Quiz'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(result.created_at), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="text-2xl font-bold">
                      {result.score}/{result.total_questions}
                    </p>
                    <p className={`text-sm font-medium ${
                      percentage >= 80 
                        ? 'text-success' 
                        : percentage >= 50 
                        ? 'text-warning' 
                        : 'text-destructive'
                    }`}>
                      {percentage}%
                    </p>
                  </div>
                  {result.topic_id && (
                    <Link to={`/topics/${result.topic_id}?tab=quiz`}>
                      <Button variant="ghost" size="icon">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}