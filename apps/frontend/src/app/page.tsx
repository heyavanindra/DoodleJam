"use client";
import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Play,
  Users,
  Zap,
  Palette,
  ArrowRight,
  Star,
} from "lucide-react";
import Link from "next/link";

const DoodleJamLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(0);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Real-time Collaboration",
      description:
        "Work together seamlessly with your team in real-time, no matter where you are.",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description:
        "Ultra-responsive canvas with smooth drawing and instant synchronization.",
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Rich Tools",
      description:
        "Professional drawing tools, shapes, text, and multimedia support.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Design Lead at TechCorp",
      content:
        "DoodleJam has revolutionized how our design team collaborates. The real-time features are incredible!",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "Product Manager",
      content:
        "Finally, a whiteboard that actually works. Our brainstorming sessions are 10x more productive now.",
      rating: 5,
    },
    {
      name: "Emily Johnson",
      role: "UX Designer",
      content:
        "The interface is so intuitive and the collaboration features are seamless. Love it!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute w-96 h-96 bg-primary/5 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-chart-2/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-chart-3/10 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-chart-2 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                DoodleJam
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Reviews
              </a>
              <Link
                href={"/signup"}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Start Creating
              </Link>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-foreground hover:bg-muted rounded-lg"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-card/95 backdrop-blur-xl border-t border-border/50">
            <div className="px-4 py-4 space-y-4">
              <a
                href="#features"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Reviews
              </a>
              <Link
                href={"/signup"}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg transition-all duration-300"
              >
                Start Creating
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-8">
              <Zap className="w-4 h-4 mr-2" />
              Now with AI-powered collaboration
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-chart-2 bg-clip-text text-transparent leading-tight">
              Where Ideas Come
              <br />
              <span className="relative">
                to Life
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-chart-2 rounded-full" />
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              The ultimate collaborative whiteboard that transforms your ideas
              into reality. Draw, brainstorm, and create together in real-time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center">
                <Play className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Start Creating Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              <button className="group border border-border hover:border-primary/50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-muted/50 flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>
          </div>

          {/* Canvas Preview */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-muted/30 to-muted/50 rounded-xl relative overflow-hidden">
                <div className="absolute inset-4 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                      <Palette className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground">Your canvas awaits</p>
                  </div>
                </div>

                {/* Animated elements */}
                <div className="absolute top-8 left-8 w-12 h-12 bg-chart-1/30 rounded-full animate-pulse" />
                <div className="absolute top-16 right-12 w-8 h-8 bg-chart-2/40 rounded-full animate-pulse delay-500" />
                <div className="absolute bottom-12 left-16 w-10 h-10 bg-chart-3/35 rounded-full animate-pulse delay-1000" />
              </div>
            </div>

            {/* Floating UI Elements */}
            <div className="absolute -top-4 -left-4 bg-card/90 backdrop-blur-xl border border-border/50 rounded-lg p-3 shadow-lg animate-float">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute -top-4 -right-4 bg-card/90 backdrop-blur-xl border border-border/50 rounded-lg p-3 shadow-lg animate-float delay-1000">
              <Zap className="w-5 h-5 text-chart-2" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Built for Modern Teams
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to bring your team&apos;s creativity to life,
              all in one powerful platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative p-8 bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl transition-all duration-500 hover:shadow-2xl hover:scale-105 cursor-pointer ${
                  activeFeature === index
                    ? "ring-2 ring-primary/50 shadow-xl scale-105"
                    : ""
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>

                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-chart-2/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Loved by Creators
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of teams already creating magic with DoodleJam
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">
                  &quot;{testimonial.content}&quot;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-chart-2 rounded-full mr-3" />
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-chart-2/10 border border-primary/20 rounded-3xl p-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              Ready to Start Creating?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of teams already collaborating on DoodleJam. Start
              your free trial today, no credit card required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center">
                <Play className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border border-border hover:border-primary/50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-muted/50">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-card/50 backdrop-blur-xl border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-chart-2 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                DoodleJam
              </span>
            </div>

            <div className="flex items-center space-x-6 text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Support
              </a>
              <span>© 2024 DoodleJam. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DoodleJamLanding;
