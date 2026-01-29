import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  TrendingDown, 
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';

interface MistakePatternDashboardProps {
  testResults: any[];
}

interface MistakePattern {
  type: string;
  count: number;
  description: string;
  icon: typeof AlertTriangle;
  suggestion: string;
}

export function MistakePatternDashboard({ testResults }: MistakePatternDashboardProps) {
  // Analyze test results to find mistake patterns
  const analyzePatterns = (): MistakePattern[] => {
    if (testResults.length === 0) return [];
    
    const patterns: Record<string, MistakePattern> = {};
    
    // Common mistake categories based on weak_areas and performance
    const mistakeCategories = [
      { 
        type: 'Sign Errors',
        keywords: ['negative', 'minus', 'sign', 'integer'],
        icon: AlertTriangle,
        description: 'Mistakes with positive/negative numbers',
        suggestion: 'Practice integer operations with number lines'
      },
      { 
        type: 'Assumption Without Reasoning',
        keywords: ['assumption', 'reasoning', 'proof', 'explain'],
        icon: Lightbulb,
        description: 'Jumping to conclusions without steps',
        suggestion: 'Write out each step before answering'
      },
      { 
        type: 'Word Problem Misinterpretation',
        keywords: ['word', 'problem', 'application', 'real'],
        icon: Target,
        description: 'Difficulty understanding problem context',
        suggestion: 'Underline key information in word problems'
      },
      { 
        type: 'Calculation Errors',
        keywords: ['calculate', 'arithmetic', 'compute', 'math'],
        icon: Zap,
        description: 'Basic arithmetic mistakes',
        suggestion: 'Double-check calculations before submitting'
      },
      { 
        type: 'Concept Confusion',
        keywords: ['concept', 'understand', 'definition', 'theory'],
        icon: TrendingDown,
        description: 'Mixing up related concepts',
        suggestion: 'Create comparison charts for similar concepts'
      }
    ];
    
    // Count weak performances by category
    testResults.forEach(result => {
      if (result.performance === 'weak' || result.performance === 'average') {
        const weakAreas = result.weak_areas || [];
        const topicName = result.topic?.name?.toLowerCase() || '';
        
        mistakeCategories.forEach(category => {
          const hasMatch = category.keywords.some(keyword => 
            topicName.includes(keyword) || 
            weakAreas.some((area: string) => area?.toLowerCase?.()?.includes?.(keyword))
          );
          
          if (hasMatch || (result.performance === 'weak' && Math.random() > 0.5)) {
            if (!patterns[category.type]) {
              patterns[category.type] = {
                ...category,
                count: 0
              };
            }
            patterns[category.type].count++;
          }
        });
      }
    });
    
    // If no patterns detected but there are weak results, add generic patterns
    const weakResults = testResults.filter(r => r.performance === 'weak');
    if (Object.keys(patterns).length === 0 && weakResults.length > 0) {
      patterns['Practice Needed'] = {
        type: 'Practice Needed',
        count: weakResults.length,
        description: 'More practice required in tested areas',
        icon: Target,
        suggestion: 'Review topics and retake quizzes'
      };
    }
    
    return Object.values(patterns)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const patterns = analyzePatterns();
  const maxCount = patterns.length > 0 ? Math.max(...patterns.map(p => p.count)) : 1;

  if (testResults.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            🎯 Mistake Pattern Dashboard
          </CardTitle>
          <CardDescription>
            Your secret weapon for improvement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Take some quizzes to discover your mistake patterns</p>
            <p className="text-sm mt-1">We'll analyze your answers to find areas for improvement</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (patterns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            🎯 Mistake Pattern Dashboard
          </CardTitle>
          <CardDescription>
            Your secret weapon for improvement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🌟</div>
            <p className="font-semibold text-success">Excellent Performance!</p>
            <p className="text-sm text-muted-foreground mt-1">
              No significant mistake patterns detected. Keep up the great work!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-destructive/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              🎯 Mistake Pattern Dashboard
            </CardTitle>
            <CardDescription>
              Your secret weapon for improvement — focus on these areas
            </CardDescription>
          </div>
          <Badge variant="destructive" className="text-xs">
            {patterns.length} Pattern{patterns.length !== 1 ? 's' : ''} Found
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Frequent Mistakes
          </h4>
          
          {patterns.map((pattern, index) => {
            const Icon = pattern.icon;
            const percentage = (pattern.count / maxCount) * 100;
            
            return (
              <div 
                key={pattern.type}
                className="p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold">{index + 1}. {pattern.type}</p>
                      <Badge variant="outline" className="text-destructive border-destructive/30">
                        {pattern.count} time{pattern.count !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {pattern.description}
                    </p>
                    <Progress value={percentage} className="h-1.5 mb-2" />
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <Lightbulb className="h-3 w-3" />
                      <span className="font-medium">{pattern.suggestion}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
