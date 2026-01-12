import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Send, 
  Loader2, 
  Volume2, 
  VolumeX, 
  GraduationCap, 
  User,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatPanelProps {
  topicId: string;
  topicName: string;
  chapterName: string;
  subjectName: string;
  grade: number;
}

export function AIChatPanel({ topicId, topicName, chapterName, subjectName, grade }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTeacherMode, setIsTeacherMode] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: 'Text-to-Speech not supported',
        description: 'Your browser does not support text-to-speech.',
        variant: 'destructive',
      });
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          mode: isTeacherMode ? 'teacher' : 'student',
          context: {
            topicName,
            chapterName,
            subjectName,
            grade,
          },
        }),
      });

      if (response.status === 429) {
        toast({
          title: 'Rate limit exceeded',
          description: 'Please wait a moment and try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (response.status === 402) {
        toast({
          title: 'Usage limit reached',
          description: 'AI credits have been exhausted.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: assistantMessage };
                  return updated;
                });
              }
            } catch {
              // Ignore JSON parse errors for partial chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    stopSpeaking();
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isTeacherMode ? 'bg-primary' : 'bg-secondary'
            } text-primary-foreground`}>
              {isTeacherMode ? <GraduationCap className="h-5 w-5" /> : <User className="h-5 w-5" />}
            </div>
            <div>
              <CardTitle className="text-lg">AI Tutor</CardTitle>
              <p className="text-sm text-muted-foreground">
                {isTeacherMode ? 'Teacher Mode - Explains concepts' : 'Student Mode - Teach back & get feedback'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="mode-toggle" className="text-sm">
                {isTeacherMode ? 'Teacher' : 'Student'}
              </Label>
              <Switch
                id="mode-toggle"
                checked={!isTeacherMode}
                onCheckedChange={(checked) => setIsTeacherMode(!checked)}
              />
            </div>
            <Button variant="ghost" size="icon" onClick={clearChat}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">
                {isTeacherMode ? 'Start a conversation!' : 'Teach-Back Mode'}
              </p>
              <p className="text-sm mt-1">
                {isTeacherMode 
                  ? 'Ask me anything about this topic and I\'ll explain it step by step.'
                  : 'Explain this concept in your own words. I\'ll evaluate your understanding and help fill any gaps.'}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {isTeacherMode ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInput('Explain this topic in simple terms')}
                    >
                      Explain simply
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInput('Give me an example')}
                    >
                      Give example
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInput('Why is this important?')}
                    >
                      Why important?
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInput('Let me explain this topic to you...')}
                    >
                      Start teaching
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInput('I think this concept means...')}
                    >
                      Share my understanding
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.role === 'assistant' && msg.content && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-8 text-xs"
                    onClick={() => isSpeaking ? stopSpeaking() : speakText(msg.content)}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="h-3 w-3 mr-1" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3 w-3 mr-1" />
                        Listen
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-3">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isTeacherMode ? 'Ask a question...' : 'Explain the concept in your own words...'}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}
