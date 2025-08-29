import { useState, useEffect } from "react";
import { Play, ArrowRight, MessageCircle, Sparkles, Bot, Zap, Star, Heart, Code, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StaticLanding() {
  const [mounted, setMounted] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: <Bot className="w-6 h-6" />, title: "AI Conversations", description: "Powered by Google Gemini AI" },
    { icon: <Zap className="w-6 h-6" />, title: "Voice Assistant", description: "Speech-to-text interaction" },
    { icon: <Star className="w-6 h-6" />, title: "Smart Replies", description: "Context-aware suggestions" },
    { icon: <Heart className="w-6 h-6" />, title: "Sentiment Analysis", description: "Emotion-aware responses" },
    { icon: <Code className="w-6 h-6" />, title: "File Processing", description: "Image & document analysis" },
    { icon: <Palette className="w-6 h-6" />, title: "Rich Animations", description: "Beautiful user interface" }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Design */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Geometric Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(99,102,241,0.1)_0%,transparent_50%,rgba(147,51,234,0.1)_100%)]" />
        
        {/* Dynamic Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:100px_100px] animate-pulse" />
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0s' }} />
        <div className="absolute top-60 right-32 w-24 h-24 bg-gradient-to-r from-emerald-400/20 to-teal-600/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-40 left-40 w-20 h-20 bg-gradient-to-r from-pink-400/20 to-rose-600/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-r from-orange-400/20 to-yellow-600/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Diagonal Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_0%,rgba(99,102,241,0.05)_25%,transparent_50%,rgba(147,51,234,0.05)_75%,transparent_100%)] bg-[length:200px_200px] animate-pulse" />
      </div>

      {/* Animated Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Hexagons */}
        <div className="absolute top-32 left-1/4 w-6 h-6 border-2 border-primary/30 rotate-45 animate-spin-slow" />
        <div className="absolute bottom-32 right-1/4 w-4 h-4 border-2 border-purple-500/30 rotate-12 animate-spin-slow" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-16 w-5 h-5 border-2 border-emerald-500/30 rotate-45 animate-spin-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/4 right-16 w-3 h-3 border-2 border-pink-500/30 rotate-12 animate-spin-slow" style={{ animationDelay: '2.5s' }} />
        
        {/* Floating Dots */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-primary/40 to-purple-500/40 rounded-full animate-float"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        
        {/* Hero Section */}
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
              
              <div className="space-y-4">
                <p className="text-xl text-muted-foreground">
                  A showcase of modern web development with AI integration
                </p>
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-4">
                  <p className="text-amber-200 text-sm">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    This is a static demo. For full AI functionality, visit the live Replit deployment.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="group bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  onClick={() => window.open('https://your-replit-url.replit.app', '_blank')}
                >
                  <Play className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  Try Live Demo
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Footer */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-muted-foreground text-sm">
          Built with React, TypeScript, and modern web technologies
        </p>
      </div>
    </div>
  );
}