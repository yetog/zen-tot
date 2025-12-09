import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  FileText, 
  Youtube, 
  Globe, 
  MessageSquare, 
  Sparkles,
  ArrowRight,
  Check,
  Brain,
  Zap,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Mic, title: 'Audio & Voice', description: 'Record meetings, lectures, or voice memos. Get instant transcriptions.' },
    { icon: FileText, title: 'PDFs & Documents', description: 'Upload PDFs and extract text automatically for AI analysis.' },
    { icon: Youtube, title: 'YouTube Videos', description: 'Paste any YouTube URL and capture video insights.' },
    { icon: Globe, title: 'Web Pages', description: 'Save articles and web content with smart extraction.' },
    { icon: MessageSquare, title: 'AI Chat', description: 'Ask questions about your notes. Get intelligent answers.' },
    { icon: Sparkles, title: 'AI Templates', description: 'Generate summaries, action items, emails, and quizzes.' },
  ];

  const steps = [
    { number: '1', title: 'Capture', description: 'Record audio, upload files, or paste links' },
    { number: '2', title: 'Summarize', description: 'AI extracts key points and action items' },
    { number: '3', title: 'Chat & Act', description: 'Ask questions and turn insights into action' },
  ];

  const pricingTiers = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['10 notes per month', 'Basic AI templates', 'Web & PDF capture', 'Local storage'],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$12',
      period: 'per month',
      features: ['Unlimited notes', 'All AI templates', 'Priority processing', 'Cloud sync', 'Voice assistant', 'API access'],
      cta: 'Coming Soon',
      highlighted: true,
    },
    {
      name: 'Team',
      price: '$29',
      period: 'per user/month',
      features: ['Everything in Pro', 'Team workspaces', 'Shared folders', 'Admin controls', 'Priority support', 'Custom integrations'],
      cta: 'Coming Soon',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_50%)]" />
        
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-32">
          <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in">
            <img src={logo} alt="Zen TOT" className="w-16 h-16 rounded-2xl shadow-lg shadow-primary/20" />
            <h1 className="text-4xl font-bold">
              Zen <span className="text-primary">TOT</span>
            </h1>
          </div>
          
          <div className="text-center max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              AI Note Taker for Your{' '}
              <span className="gradient-text">Train of Thought</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Capture anything — meetings, PDFs, YouTube, web pages. 
              Let AI transcribe, summarize, and help you find insights instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/')} className="text-lg px-8 hover-lift">
                Start Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 hover-lift">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-16">How It Works</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div 
                key={step.number} 
                className="relative text-center p-8 rounded-2xl bg-card border border-border hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">{step.number}</span>
                </div>
                <h4 className="text-xl font-semibold mb-3">{step.title}</h4>
                <p className="text-muted-foreground">{step.description}</p>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-4">Capture Everything</h3>
          <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            From voice recordings to web articles, Zen TOT handles all your content and makes it searchable.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Zen TOT */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-16">Why Zen TOT?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Train of Thought</h4>
              <p className="text-muted-foreground">
                Optimized for how you naturally think. Brain dump freely, then let AI organize.
              </p>
            </div>
            <div className="text-center p-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Instant Insights</h4>
              <p className="text-muted-foreground">
                Ask questions across all your notes. Find connections you'd never see manually.
              </p>
            </div>
            <div className="text-center p-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Your Data, Your Control</h4>
              <p className="text-muted-foreground">
                Self-host on your own infrastructure. No vendor lock-in, full data ownership.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-4">Simple Pricing</h3>
          <p className="text-muted-foreground text-center mb-16">
            Start free, upgrade when you're ready.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <div 
                key={tier.name}
                className={`p-8 rounded-2xl border animate-fade-in ${
                  tier.highlighted 
                    ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10' 
                    : 'bg-card border-border'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {tier.highlighted && (
                  <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-4">
                    Most Popular
                  </div>
                )}
                <h4 className="text-2xl font-bold mb-2">{tier.name}</h4>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground">/{tier.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={tier.highlighted ? 'default' : 'outline'}
                  onClick={() => tier.cta === 'Get Started' && navigate('/')}
                  disabled={tier.cta === 'Coming Soon'}
                >
                  {tier.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to capture your thoughts?</h3>
          <p className="text-muted-foreground mb-8">
            Start for free. No credit card required.
          </p>
          <Button size="lg" onClick={() => navigate('/')} className="text-lg px-8 hover-lift">
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Zen TOT" className="w-8 h-8 rounded-lg" />
              <span className="font-semibold">Zen TOT</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Zen TOT. Built for thinkers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
