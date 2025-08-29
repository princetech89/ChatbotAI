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
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse-glow">
              <MessageCircle className="w-12 h-12 text-white animate-bounce-subtle" />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-xl animate-spin-slow" />
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-purple-600 bg-clip-text text-transparent animate-gradient-x">
              AI Assistant
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience the future of conversations with advanced AI technology, 
              image analysis, and intelligent insights
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
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
              Learn More
            </Button>
          </div>
        </div>

        {/* Feature Showcase */}
        <div className={`mt-20 max-w-4xl w-full transform transition-all duration-1000 delay-500 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`feature-card p-6 rounded-2xl glass-morph border-2 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                  currentFeature === index 
                    ? 'border-primary shadow-primary/25 neon-glow' 
                    : 'border-border/50 hover:border-primary/50'
                }`}
                style={{
                  animationDelay: `${index * 200}ms`
                }}
                data-testid={`feature-card-${index}`}
              >
                <div className={`inline-flex p-3 rounded-full mb-4 transition-all duration-300 ${
                  currentFeature === index 
                    ? 'bg-gradient-to-r from-primary to-purple-600 text-white' 
                    : 'bg-accent/50 text-accent-foreground'
                }`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className={`mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center transform transition-all duration-1000 delay-700 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="space-y-2">
            <div className="text-3xl font-bold gradient-text">100k+</div>
            <div className="text-muted-foreground">Messages Processed</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold gradient-text">99.9%</div>
            <div className="text-muted-foreground">Uptime</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold gradient-text">50ms</div>
            <div className="text-muted-foreground">Average Response</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </div>
  )
}