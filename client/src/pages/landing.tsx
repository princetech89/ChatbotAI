import { useState, useEffect } from 'react'
import { Link } from 'wouter'
import { Button } from '@/components/ui/button'
import { MessageCircle, Sparkles, Zap, Brain, ArrowRight, Play } from 'lucide-react'

export function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Smart Conversations",
      description: "Engage in natural, intelligent conversations with advanced AI"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Image Analysis", 
      description: "Upload and analyze images with powerful computer vision"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Interactive Charts",
      description: "Generate beautiful visualizations and data insights"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Get instant responses with real-time processing"
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-emerald-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)]" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        
        {/* Hero Section */}
        <div className={`text-center space-y-8 transform transition-all duration-1000 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          
          {/* Logo/Icon */}
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse-glow">
              <span className="text-white font-bold text-5xl animate-bounce-subtle">PC</span>
            </div>
            <div className="absolute -inset-6 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-xl animate-spin-slow" />
          </div>

          {/* Developer Name */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-purple-600 bg-clip-text text-transparent animate-gradient-x">
                Prince Chourasiya
              </h1>
              <div className="h-1 w-32 mx-auto bg-gradient-to-r from-primary to-purple-600 rounded-full animate-pulse"></div>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-muted-foreground animate-fade-in-up">
              Full Stack Developer & AI Enthusiast
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed animate-fade-in-up-delay">
              Crafting intelligent conversations with cutting-edge AI technology
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link href="/chat" data-testid="button-start-chat">
              <Button 
                size="lg" 
                className="group bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rainbow-border"
              >
                <Play className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Start Chatting
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg"
              className="group px-8 py-4 text-lg font-semibold glass-morph hover:bg-accent/50 transform hover:scale-105 transition-all duration-300"
              data-testid="button-learn-more"
              onClick={() => {
                document.querySelector('.feature-card')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
              Learn More
            </Button>
          </div>
        </div>

        {/* Quick Features */}
        <div className={`mt-16 max-w-2xl w-full transform transition-all duration-1000 delay-500 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.slice(0, 4).map((feature, index) => (
              <div
                key={index}
                className={`feature-card p-4 rounded-xl glass-morph border transition-all duration-500 hover:scale-105 ${
                  currentFeature === index 
                    ? 'border-primary shadow-primary/25' 
                    : 'border-border/30 hover:border-primary/50'
                }`}
                style={{
                  animationDelay: `${index * 150}ms`
                }}
                data-testid={`feature-card-${index}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    currentFeature === index 
                      ? 'bg-gradient-to-r from-primary to-purple-600 text-white' 
                      : 'bg-accent/50 text-accent-foreground'
                  }`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {feature.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer with website link */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
            </div>
          </div>
          <div className="glass-morph px-4 py-2 rounded-full">
            <a 
              href="https://princechourasiya.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
              data-testid="website-link"
            >
              <div className="w-4 h-4 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">PC</span>
              </div>
              <span>princechourasiya.dev</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}