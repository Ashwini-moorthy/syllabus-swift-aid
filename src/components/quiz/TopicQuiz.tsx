import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  ClipboardList, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Trophy,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface TopicQuizProps {
  topicId: string;
  topicName: string;
  grade: number;
}

export function TopicQuiz({ topicId, topicName, grade }: TopicQuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateQuiz = async () => {
    setIsGenerating(true);
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
    setSelectedAnswer(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          topicName,
          grade,
          questionCount: 5,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      console.error('Quiz generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate quiz. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;
    
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    setSelectedAnswer(null);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setShowResult(true);
    
    const score = answers.reduce((acc, ans, idx) => 
      ans === questions[idx].correct ? acc + 1 : acc, 0
    );
    
    const percentage = (score / questions.length) * 100;
    const performance = percentage >= 80 ? 'strong' : percentage >= 50 ? 'average' : 'weak';

    // Save result to database
    if (user) {
      try {
        // First create a test record for this generated quiz
        const { data: testData, error: testError } = await supabase.from('tests').insert({
          title: `Practice Quiz: ${topicName}`,
          topic_id: topicId,
          questions: questions.map((q, idx) => ({
            question: q.question,
            options: q.options,
            correct: q.correct,
            explanation: q.explanation,
          })),
        }).select('id').single();

        if (testError) {
          console.error('Failed to create test record:', testError);
          return;
        }

        // Then save the test result with the test_id
        await supabase.from('test_results').insert({
          user_id: user.id,
          topic_id: topicId,
          test_id: testData.id,
          score,
          total_questions: questions.length,
          performance,
          answers: answers.map((ans, idx) => ({
            question: questions[idx].question,
            selected: ans,
            correct: questions[idx].correct,
            isCorrect: ans === questions[idx].correct,
          })),
        });
      } catch (error) {
        console.error('Failed to save result:', error);
      }
    }
  };

  const score = answers.reduce((acc, ans, idx) => 
    ans === questions[idx]?.correct ? acc + 1 : acc, 0
  );
  const percentage = questions.length ? Math.round((score / questions.length) * 100) : 0;

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ClipboardList className="h-12 w-12 mx-auto text-primary mb-4" />
          <h3 className="font-medium text-lg mb-2">Test Your Knowledge</h3>
          <p className="text-muted-foreground mb-6">
            Take a quick quiz to check your understanding of this topic
          </p>
          <Button onClick={generateQuiz} disabled={isGenerating} size="lg">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <ClipboardList className="h-4 w-4 mr-2" />
                Start Quiz
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResult) {
    const performance = percentage >= 80 ? 'strong' : percentage >= 50 ? 'average' : 'weak';
    
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className={`flex h-20 w-20 mx-auto items-center justify-center rounded-full mb-4 ${
            performance === 'strong' 
              ? 'bg-success/10 text-success' 
              : performance === 'average'
              ? 'bg-warning/10 text-warning'
              : 'bg-destructive/10 text-destructive'
          }`}>
            <Trophy className="h-10 w-10" />
          </div>
          
          <h3 className="font-display text-2xl font-bold mb-2">
            {performance === 'strong' 
              ? 'Excellent Work! 🎉' 
              : performance === 'average'
              ? 'Good Effort! 👍'
              : 'Keep Practicing! 💪'}
          </h3>
          
          <p className="text-3xl font-bold text-primary mb-4">
            {score}/{questions.length}
            <span className="text-lg text-muted-foreground ml-2">({percentage}%)</span>
          </p>
          
          {performance === 'strong' && (
            <p className="text-muted-foreground mb-6">
              You have a strong understanding of this topic!
            </p>
          )}
          
          {performance === 'average' && (
            <p className="text-muted-foreground mb-6">
              You're on the right track! Review the explanations to strengthen your understanding.
            </p>
          )}
          
          {performance === 'weak' && (
            <p className="text-muted-foreground mb-6">
              Don't worry! Go back to the lesson and try the AI tutor for more explanations.
            </p>
          )}

          {/* Review answers */}
          <div className="text-left space-y-3 mb-6">
            {questions.map((q, idx) => (
              <div key={idx} className={`p-3 rounded-lg border ${
                answers[idx] === q.correct ? 'bg-success/5 border-success/30' : 'bg-destructive/5 border-destructive/30'
              }`}>
                <div className="flex items-start gap-2">
                  {answers[idx] === q.correct ? (
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{q.question}</p>
                    {answers[idx] !== q.correct && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Correct: {q.options[q.correct]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={generateQuiz} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correct;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium">
            Score: {score}/{answers.length}
          </span>
        </div>
        <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <h3 className="text-lg font-medium">{question.question}</h3>
        
        <RadioGroup
          value={selectedAnswer?.toString()}
          onValueChange={(val) => !showExplanation && setSelectedAnswer(parseInt(val))}
          className="space-y-3"
        >
          {question.options.map((option, idx) => (
            <div
              key={idx}
              className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                showExplanation
                  ? idx === question.correct
                    ? 'border-success bg-success/5'
                    : idx === selectedAnswer
                    ? 'border-destructive bg-destructive/5'
                    : 'border-muted'
                  : selectedAnswer === idx
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <RadioGroupItem value={idx.toString()} id={`option-${idx}`} disabled={showExplanation} />
              <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                {option}
              </Label>
              {showExplanation && idx === question.correct && (
                <CheckCircle2 className="h-5 w-5 text-success" />
              )}
              {showExplanation && idx === selectedAnswer && idx !== question.correct && (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
            </div>
          ))}
        </RadioGroup>

        {showExplanation && (
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-success/10' : 'bg-warning/10'}`}>
            <div className="flex items-start gap-2">
              <Lightbulb className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">
                  {isCorrect ? 'Correct!' : 'Not quite right'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {question.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          {!showExplanation ? (
            <Button onClick={submitAnswer} disabled={selectedAnswer === null}>
              Submit Answer
            </Button>
          ) : (
            <Button onClick={nextQuestion}>
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
