import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Lightbulb, Target, CheckCircle } from 'lucide-react';

interface TopicContentProps {
  content: string | null;
  topicName: string;
}

export function TopicContent({ content, topicName }: TopicContentProps) {
  // Parse content to extract sections if formatted
  const parseContent = (rawContent: string) => {
    // Check if content has markdown-like headers
    const sections: { type: string; content: string }[] = [];
    
    const lines = rawContent.split('\n');
    let currentSection = { type: 'intro', content: '' };
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
        if (currentSection.content) {
          sections.push({ ...currentSection });
        }
        const header = trimmed.replace(/^#+\s*/, '').toLowerCase();
        if (header.includes('example')) {
          currentSection = { type: 'example', content: '' };
        } else if (header.includes('key') || header.includes('point') || header.includes('remember')) {
          currentSection = { type: 'keypoints', content: '' };
        } else if (header.includes('practice') || header.includes('try')) {
          currentSection = { type: 'practice', content: '' };
        } else {
          currentSection = { type: 'section', content: trimmed.replace(/^#+\s*/, '') + '\n' };
        }
      } else {
        currentSection.content += line + '\n';
      }
    });
    
    if (currentSection.content) {
      sections.push(currentSection);
    }
    
    return sections.length > 0 ? sections : [{ type: 'intro', content: rawContent }];
  };

  if (!content) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Content is being prepared for this topic.</p>
        </CardContent>
      </Card>
    );
  }

  const sections = parseContent(content);

  return (
    <div className="space-y-6">
      {/* Main Content Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Understanding {topicName}</h3>
          </div>
          
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {sections.map((section, idx) => (
              <div key={idx} className="mb-4">
                {section.type === 'intro' && (
                  <p className="text-base leading-relaxed whitespace-pre-wrap">
                    {section.content.trim()}
                  </p>
                )}
                {section.type === 'section' && (
                  <div>
                    <h4 className="font-semibold text-primary mb-2">
                      {section.content.split('\n')[0]}
                    </h4>
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {section.content.split('\n').slice(1).join('\n').trim()}
                    </p>
                  </div>
                )}
                {section.type === 'example' && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-blue-700 dark:text-blue-300">Example</span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-blue-900 dark:text-blue-100">
                      {section.content.trim()}
                    </p>
                  </div>
                )}
                {section.type === 'keypoints' && (
                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold text-green-700 dark:text-green-300">Key Points to Remember</span>
                    </div>
                    <ul className="space-y-2">
                      {section.content.trim().split('\n').filter(l => l.trim()).map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-green-900 dark:text-green-100">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{point.replace(/^[-*•]\s*/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {section.type === 'practice' && (
                  <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-semibold text-purple-700 dark:text-purple-300">Practice</span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-purple-900 dark:text-purple-100">
                      {section.content.trim()}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">Study Tip</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                After reading, try explaining this topic in your own words. Use the AI Tutor if you have any doubts!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
