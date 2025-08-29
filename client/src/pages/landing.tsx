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
        
        {/* Hero Section - New Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl w-full">
          
          {/* Left Side - Name and CTA */}
          <div className={`text-left space-y-8 transform transition-all duration-1000 ${
            mounted ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
          }`}>
            <div className="space-y-6">
              <div className="inline-block">
                <div className="px-6 py-3 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-full border border-primary/30 backdrop-blur-sm">
                  <span className="text-primary font-medium">Prince Chourasiya</span>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                AI <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Assistant</span>
              </h1>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/chat" data-testid="button-start-chat">
                  <Button 
                    size="lg" 
                    className="group bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Play className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                    Start Chatting
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side - Interactive Visual */}
          <div className={`flex justify-center lg:justify-end transform transition-all duration-1000 delay-300 ${
            mounted ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
          }`}>
            <div className="relative">
              {/* Main Circle */}
              <div className="w-64 h-64 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-full backdrop-blur-sm border border-primary/30 flex items-center justify-center animate-pulse-glow">
                <div className="w-48 h-48 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                  <MessageCircle className="w-24 h-24 text-white animate-bounce-subtle" />
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-float" style={{ animationDelay: '0s' }} />
              <div className="absolute -bottom-6 -right-2 w-6 h-6 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full animate-float" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/4 -right-8 w-4 h-4 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full animate-float" style={{ animationDelay: '2s' }} />
              <div className="absolute bottom-1/4 -left-8 w-5 h-5 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full animate-float" style={{ animationDelay: '1.5s' }} />
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className={`mt-20 max-w-4xl w-full transform transition-all duration-1000 delay-500 ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="text-center mb-12">
            <h3 className="text-2xl font-semibold text-foreground mb-4">Powerful Features</h3>
            <div className="h-0.5 w-16 bg-gradient-to-r from-primary to-purple-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`feature-card group p-6 rounded-2xl glass-morph border-2 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer ${
                  currentFeature === index 
                    ? 'border-primary shadow-primary/25 bg-primary/5' 
                    : 'border-border/30 hover:border-primary/50'
                }`}
                style={{
                  animationDelay: `${index * 200}ms`
                }}
                data-testid={`feature-card-${index}`}
              >
                <div className="text-center space-y-4">
                  <div className={`inline-flex p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 ${
                    currentFeature === index 
                      ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-accent/50 to-accent/30 text-accent-foreground group-hover:from-primary/20 group-hover:to-purple-600/20'
                  }`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
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
              <div className="w-6 h-4 bg-gradient-to-br from-primary to-purple-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">Prince Chourasiya</span>
              </div>
              <span>princechourasiya.dev</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}