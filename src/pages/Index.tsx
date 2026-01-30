import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Brain, Target, TrendingUp, Play, CheckCircle } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Get personalized explanations from our intelligent tutor that adapts to your learning style",
    },
    {
      icon: Target,
      title: "NCERT Aligned",
      description: "Complete curriculum coverage for Grades 6-9 following the official NCERT syllabus",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your learning journey with detailed analytics and performance insights",
    },
    {
      icon: Play,
      title: "Video Learning",
      description: "Curated YouTube videos and AI-suggested content to reinforce your understanding",
    },
  ];

  const subjects = [
    { name: "Mathematics", color: "bg-blue-500", icon: "📐" },
    { name: "Science", color: "bg-green-500", icon: "🔬" },
    { name: "Social Science", color: "bg-amber-500", icon: "🌍" },
    { name: "English", color: "bg-purple-500", icon: "📚" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              THINK 2 TEACH AI
            </span>
          </div>
          <Link to="/auth">
            <Button variant="default" size="lg" className="rounded-full px-6">
              Get Started
            </Button>
          </Link>
        </nav>
      </header>

      {/* Main Hero */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <CheckCircle className="h-4 w-4" />
            Free for all students
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Master Your{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              NCERT Syllabus
            </span>
            <br />
            with AI-Powered Learning
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Interactive lessons, smart quizzes, and personalized AI tutoring for Grades 6-9. 
            Learn at your own pace with our intelligent learning companion.
          </p>
          
        </div>
      </section>

      {/* Subjects Preview */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap justify-center gap-4">
          {subjects.map((subject) => (
            <div
              key={subject.name}
              className="flex items-center gap-3 bg-card border border-border rounded-full px-6 py-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-2xl">{subject.icon}</span>
              <span className="font-medium text-foreground">{subject.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Excel
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our platform combines the best of AI technology with the trusted NCERT curriculum
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 md:py-24 bg-muted/30 rounded-3xl my-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { step: "1", title: "Sign Up", desc: "Create your account and select your grade" },
            { step: "2", title: "Choose Subject", desc: "Pick any subject from the NCERT curriculum" },
            { step: "3", title: "Start Learning", desc: "Learn with AI, take quizzes, and track progress" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-primary-foreground mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of students who are already mastering their NCERT curriculum with our AI-powered platform.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="rounded-full px-8 py-6 text-lg">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">THINK 2 TEACH AI</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2026 THINK 2 TEACH AI. Made with ❤️ for Indian students.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
