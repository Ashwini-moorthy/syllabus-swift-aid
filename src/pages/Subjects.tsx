import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Atom, Globe, BookOpen, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const subjectIcons: Record<string, any> = {
  Calculator,
  Atom,
  Globe,
  BookOpen,
};

export default function Subjects() {
  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data;
    },
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">All Subjects</h1>
          <p className="text-muted-foreground mt-1">
            Choose a subject to start learning
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {subjects?.map((subject: any) => {
            const Icon = subjectIcons[subject.icon] || BookOpen;
            
            return (
              <Link key={subject.id} to={`/subjects/${subject.id}`}>
                <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer h-full border-2 hover:border-primary/30 overflow-hidden">
                  <div
                    className="h-3"
                    style={{ backgroundColor: subject.color }}
                  />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-2xl text-primary-foreground"
                        style={{ backgroundColor: subject.color }}
                      >
                        <Icon className="h-8 w-8" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <CardTitle className="font-display text-2xl mt-4 group-hover:text-primary transition-colors">
                      {subject.name}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {subject.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
