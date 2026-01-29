import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  ArrowRight, 
  Shield,
  Zap,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface LearningWarningsProps {
  subjects: any[];
  progress: any[];
  testResults: any[];
}

interface RiskAlert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  weakTopic: string;
  affectedTopic: string;
  suggestedAction: string;
  suggestedPath: string;
}

export function LearningWarnings({ subjects, progress, testResults }: LearningWarningsProps) {
  // Dependency mapping for topics (simplified version)
  const topicDependencies: Record<string, string[]> = {
    // Mathematics dependencies
    'linear equations': ['integers', 'fractions', 'algebraic expressions'],
    'quadratic equations': ['linear equations', 'factorization', 'algebraic expressions'],
    'polynomials': ['algebraic expressions', 'integers', 'exponents'],
    'coordinate geometry': ['linear equations', 'graphs', 'number systems'],
    'mensuration': ['geometry', 'area', 'perimeter'],
    'statistics': ['data handling', 'graphs', 'averages'],
    'probability': ['fractions', 'statistics', 'ratios'],
    
    // Science dependencies
    'chemical equations': ['atoms', 'molecules', 'elements'],
    'chemical reactions': ['chemical equations', 'atoms', 'periodic table'],
    'electricity': ['atoms', 'current', 'circuits'],
    'magnetism': ['electricity', 'magnetic field'],
    'light': ['reflection', 'refraction', 'mirrors'],
    'force': ['motion', 'newton', 'gravity'],
  };

  // Analyze and generate risk alerts
  const generateRiskAlerts = (): RiskAlert[] => {
    const alerts: RiskAlert[] = [];
    
    // Find weak topics from test results
    const weakTopics = new Set<string>();
    testResults.forEach(result => {
      if (result.performance === 'weak') {
        const topicName = result.topic?.name?.toLowerCase() || '';
        if (topicName) weakTopics.add(topicName);
      }
    });

    // Check topic completion for potential gaps
    const completedTopics = new Set<string>();
    progress.forEach(p => {
      if (p.completed) {
        const topicName = p.topic?.name?.toLowerCase() || '';
        if (topicName) completedTopics.add(topicName);
      }
    });

    // Generate alerts based on dependencies
    Object.entries(topicDependencies).forEach(([advancedTopic, prerequisites]) => {
      prerequisites.forEach(prereq => {
        // Check if prerequisite is weak
        const isPrereqWeak = Array.from(weakTopics).some(weak => 
          weak.includes(prereq) || prereq.includes(weak)
        );
        
        // Check if prerequisite is not completed
        const isPrereqIncomplete = !Array.from(completedTopics).some(completed =>
          completed.includes(prereq) || prereq.includes(completed)
        );
        
        if (isPrereqWeak || isPrereqIncomplete) {
          const existing = alerts.find(a => 
            a.weakTopic === prereq && a.affectedTopic === advancedTopic
          );
          
          if (!existing && alerts.length < 3) {
            alerts.push({
              id: `${prereq}-${advancedTopic}`,
              severity: isPrereqWeak ? 'high' : 'medium',
              title: `Potential Challenge Ahead`,
              description: `You may struggle with ${capitalizeWords(advancedTopic)} due to gaps in ${capitalizeWords(prereq)}`,
              weakTopic: prereq,
              affectedTopic: advancedTopic,
              suggestedAction: `Revise ${capitalizeWords(prereq)}`,
              suggestedPath: `/subjects`
            });
          }
        }
      });
    });

    // Add general alerts if no specific ones found
    if (alerts.length === 0 && weakTopics.size > 0) {
      const weakTopicArray = Array.from(weakTopics);
      alerts.push({
        id: 'general-weak',
        severity: 'medium',
        title: 'Areas Needing Attention',
        description: `You have ${weakTopicArray.length} topic${weakTopicArray.length !== 1 ? 's' : ''} with weak performance that may affect future learning`,
        weakTopic: weakTopicArray[0],
        affectedTopic: 'advanced topics',
        suggestedAction: 'Review weak topics before moving forward',
        suggestedPath: '/progress'
      });
    }

    return alerts.slice(0, 3);
  };

  const capitalizeWords = (str: string) => {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const alerts = generateRiskAlerts();

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          border: 'border-destructive/50',
          bg: 'bg-destructive/5',
          badge: 'bg-destructive text-destructive-foreground',
          icon: 'text-destructive'
        };
      case 'medium':
        return {
          border: 'border-warning/50',
          bg: 'bg-warning/5',
          badge: 'bg-warning text-warning-foreground',
          icon: 'text-warning'
        };
      default:
        return {
          border: 'border-info/50',
          bg: 'bg-info/5',
          badge: 'bg-info text-info-foreground',
          icon: 'text-info'
        };
    }
  };

  if (alerts.length === 0) {
    return (
      <Card className="border-2 border-success/30">
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            ⚡ Personalized Learning Insights
          </CardTitle>
          <CardDescription>
            Proactive alerts to keep you on track
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-success/10 border border-success/30">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/20">
              <Shield className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="font-semibold text-success">All Clear!</p>
              <p className="text-sm text-muted-foreground">
                No learning risks detected. You're building a strong foundation!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-warning/30">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              ⚡ Personalized Learning Warnings
            </CardTitle>
            <CardDescription>
              Proactive alerts to prevent future struggles
            </CardDescription>
          </div>
          <Badge className="bg-warning text-warning-foreground">
            {alerts.length} Alert{alerts.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => {
          const styles = getSeverityStyles(alert.severity);
          
          return (
            <div 
              key={alert.id}
              className={`p-4 rounded-xl border-2 ${styles.border} ${styles.bg}`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-background ${styles.icon}`}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={styles.badge}>
                      ⚠ Risk Alert
                    </Badge>
                    <span className="text-xs text-muted-foreground capitalize">
                      {alert.severity} priority
                    </span>
                  </div>
                  <p className="font-medium mb-1">{alert.title}</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {alert.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="font-medium text-primary">
                        Suggested: {alert.suggestedAction}
                      </span>
                    </div>
                    <Link to={alert.suggestedPath}>
                      <Button size="sm" variant="outline" className="gap-1">
                        Take Action
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
