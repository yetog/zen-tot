import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  FileText, 
  Youtube, 
  Globe, 
  ArrowRight,
  Check,
  Brain,
  Zap,
  Lock,
  Network,
  Bot,
  Sparkles,
  Star,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
import { useSoundEffects } from '@/hooks/useSoundEffects';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { playClick, playWhoosh, playSuccess } = useSoundEffects();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const features = [
    { icon: Mic, title: 'Audio & Voice', description: 'Record meetings, lectures, or voice memos. Get instant transcriptions.', color: '#3B82F6' },
    { icon: FileText, title: 'PDFs & Documents', description: 'Upload PDFs and extract text automatically for AI analysis.', color: '#EF4444' },
    { icon: Youtube, title: 'YouTube Videos', description: 'Paste any YouTube URL and capture video insights.', color: '#DC2626' },
    { icon: Globe, title: 'Web Pages', description: 'Save articles and web content with smart extraction.', color: '#22C55E' },
    { icon: Network, title: 'Knowledge Graph', description: 'Visualize connections between ideas with 3D neural network views.', color: '#8B5CF6' },
    { icon: Bot, title: 'Voice Assistant', description: 'Talk to your notes with an AI that understands your content.', color: '#EC4899' },
  ];

  const steps = [
    { number: '1', title: 'Capture', description: 'Record audio, upload files, or paste links', icon: Mic },
    { number: '2', title: 'Summarize', description: 'AI extracts key points and action items', icon: Sparkles },
    { number: '3', title: 'Chat & Act', description: 'Ask questions and turn insights into action', icon: Bot },
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
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary) / 0.03) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary) / 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)`,
          }}
        />
        {/* Floating orbs */}
        <div 
          className="absolute w-96 h-96 rounded-full blur-3xl"
          style={{ 
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.15), transparent)',
            top: '10%',
            left: '10%',
            transform: `translate(${Math.sin(scrollY * 0.01) * 20}px, ${Math.cos(scrollY * 0.01) * 20}px)`,
          }}
        />
        <div 
          className="absolute w-72 h-72 rounded-full blur-3xl"
          style={{ 
            background: 'radial-gradient(circle, hsl(var(--accent) / 0.15), transparent)',
            bottom: '20%',
            right: '15%',
            transform: `translate(${Math.cos(scrollY * 0.01) * 30}px, ${Math.sin(scrollY * 0.01) * 30}px)`,
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/50"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
        
        {/* Floating icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-20 left-[10%] opacity-30"
            style={{ transform: `translateY(${scrollY * 0.1}px) rotate(${scrollY * 0.05}deg)` }}
          >
            <FileText className="h-16 w-16 text-primary animate-float" />
          </div>
          <div 
            className="absolute top-40 right-[15%] opacity-30"
            style={{ transform: `translateY(${scrollY * 0.15}px)` }}
          >
            <Youtube className="h-12 w-12 text-red-500 animate-float" style={{ animationDelay: '0.5s' }} />
          </div>
          <div 
            className="absolute bottom-40 left-[20%] opacity-30"
            style={{ transform: `translateY(${-scrollY * 0.1}px)` }}
          >
            <Mic className="h-14 w-14 text-primary animate-float" style={{ animationDelay: '1s' }} />
          </div>
          <div 
            className="absolute bottom-60 right-[25%] opacity-20"
            style={{ transform: `translateY(${-scrollY * 0.08}px)` }}
          >
            <Brain className="h-24 w-24 text-primary animate-pulse" />
          </div>
          <div 
            className="absolute top-[60%] left-[5%] opacity-20"
          >
            <Network className="h-32 w-32 text-accent animate-rotate-slow" />
          </div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          {/* Logo and brand */}
          <div className="flex items-center justify-center gap-4 mb-10 animate-fade-in">
            <div className="relative">
              <img 
                src={logo} 
                alt="Zen TOT" 
                className="w-24 h-24 rounded-2xl shadow-2xl pulse-glow"
              />
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-primary/20 to-accent/20 blur-xl -z-10" />
            </div>
            <h1 className="text-6xl font-bold">
              Zen <span className="gradient-text">TOT</span>
            </h1>
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <h2 
              className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-8 leading-tight animate-fade-in"
              style={{ animationDelay: '100ms' }}
            >
              AI Note Taker for Your{' '}
              <span className="relative inline-block">
                <span className="gradient-text">Train of Thought</span>
                <Sparkles className="absolute -top-4 -right-8 h-8 w-8 text-primary animate-pulse" />
              </span>
            </h2>
            
            <p 
              className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in leading-relaxed"
              style={{ animationDelay: '200ms' }}
            >
              Capture anything — meetings, PDFs, YouTube, web pages. 
              Let AI transcribe, summarize, and help you find insights instantly.
            </p>
            
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in"
              style={{ animationDelay: '300ms' }}
            >
              <Button 
                size="lg" 
                onClick={() => { playSuccess(); navigate('/'); }} 
                className="text-lg px-10 py-6 hover-lift glow-primary transition-all group"
              >
                Start Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => playClick()}
                className="text-lg px-10 py-6 hover-lift glass futuristic-border group"
              >
                <Volume2 className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>
            
            {/* Stats */}
            <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              {[
                { value: '∞', label: 'Note Types' },
                { value: 'AI', label: 'Powered' },
                { value: '100%', label: 'Privacy' },
              ].map((stat, i) => (
                <div 
                  key={stat.label}
                  className="text-center animate-fade-in"
                  style={{ animationDelay: `${400 + i * 100}ms` }}
                >
                  <div className="text-4xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2 futuristic-border">
            <div className="w-1.5 h-3 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        
        <div className="relative max-w-6xl mx-auto px-6">
          <h3 className="text-4xl font-bold text-center mb-4">
            How It <span className="gradient-text">Works</span>
          </h3>
          <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
            From capture to insight in three simple steps
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div 
                key={step.number} 
                className="relative text-center p-8 rounded-2xl glass-strong futuristic-border hover-lift animate-fade-in group"
                style={{ animationDelay: `${index * 100}ms` }}
                onMouseEnter={() => playClick()}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform pulse-glow">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {step.number}
                </div>
                <h4 className="text-xl font-semibold mb-3">{step.title}</h4>
                <p className="text-muted-foreground">{step.description}</p>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-32">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-4xl font-bold text-center mb-4">
            Capture <span className="gradient-text">Everything</span>
          </h3>
          <p className="text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            From voice recordings to web articles, Zen TOT handles all your content and makes it searchable.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="p-6 rounded-xl glass hover:futuristic-border transition-all hover-lift animate-fade-in group cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
                onMouseEnter={() => playClick()}
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ 
                    backgroundColor: `${feature.color}20`,
                    boxShadow: `0 0 20px ${feature.color}30`
                  }}
                >
                  <feature.icon className="h-7 w-7" style={{ color: feature.color }} />
                </div>
                <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Zen TOT */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
        
        <div className="relative max-w-6xl mx-auto px-6">
          <h3 className="text-4xl font-bold text-center mb-16">
            Why <span className="gradient-text">Zen TOT</span>?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: 'Train of Thought', description: 'Optimized for how you naturally think. Brain dump freely, then let AI organize.' },
              { icon: Zap, title: 'Instant Insights', description: 'Ask questions across all your notes. Find connections you\'d never see manually.' },
              { icon: Lock, title: 'Your Data, Your Control', description: 'Self-host on your own infrastructure. No vendor lock-in, full data ownership.' },
            ].map((item, i) => (
              <div 
                key={item.title}
                className="text-center p-8 rounded-2xl glass-strong hover-lift animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-6 pulse-glow">
                  <item.icon className="h-10 w-10 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-3">{item.title}</h4>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative py-32">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-4xl font-bold text-center mb-4">
            Simple <span className="gradient-text">Pricing</span>
          </h3>
          <p className="text-muted-foreground text-center mb-16">
            Start free, upgrade when you're ready.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <div 
                key={tier.name}
                className={`p-8 rounded-2xl animate-fade-in hover-lift ${
                  tier.highlighted 
                    ? 'glass-strong futuristic-border glow-primary' 
                    : 'glass'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {tier.highlighted && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wide mb-4">
                    <Star className="h-4 w-4 fill-primary" />
                    Most Popular
                  </div>
                )}
                <h4 className="text-2xl font-bold mb-2">{tier.name}</h4>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-bold gradient-text">{tier.price}</span>
                  <span className="text-muted-foreground">/{tier.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${tier.highlighted ? 'glow-primary' : ''}`}
                  variant={tier.highlighted ? 'default' : 'outline'}
                  onClick={() => {
                    playClick();
                    if (tier.cta === 'Get Started') navigate('/');
                  }}
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
      <section className="relative py-32">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
        
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8 pulse-glow">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-4xl font-bold mb-4">Ready to capture your thoughts?</h3>
          <p className="text-muted-foreground mb-10 text-lg">
            Start for free. No credit card required.
          </p>
          <Button 
            size="lg" 
            onClick={() => { playSuccess(); navigate('/'); }} 
            className="text-lg px-12 py-6 hover-lift glow-primary group"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Zen TOT" className="w-10 h-10 rounded-lg glow-primary" />
              <span className="font-bold text-lg">Zen <span className="text-primary">TOT</span></span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Zen TOT. Built for thinkers, by thinkers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
