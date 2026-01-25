import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Users, Building2, ChartBar, ArrowRight, CheckCircle } from 'lucide-react';
import christLogo from '@/assets/christ-university-logo.png';

const Index = () => {
  const features = [
    {
      icon: Building2,
      title: 'Company Listings',
      description: 'Browse upcoming companies with detailed job descriptions and requirements.',
    },
    {
      icon: ChartBar,
      title: 'Track Applications',
      description: 'Monitor your application status from applied to selected in real-time.',
    },
    {
      icon: Users,
      title: 'Placement Stats',
      description: 'View comprehensive placement statistics and trends.',
    },
  ];

  const stats = [
    { value: '500+', label: 'Students Placed' },
    { value: '100+', label: 'Companies' },
    { value: '₹25 LPA', label: 'Highest Package' },
    { value: '95%', label: 'Placement Rate' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-hero min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl animate-fade-in">
            <div className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <img 
                src={christLogo} 
                alt="Christ University Logo" 
                className="h-12 w-auto object-contain bg-white rounded-lg p-1"
              />
              <span className="text-sm text-white font-medium">Centre for Career Development & Placement</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-6 leading-tight">
              Christ University
              <span className="block text-white">Placement Portal</span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-2xl">
              Connect with top companies, track your applications, and land your perfect job through our comprehensive placement management system.
            </p>
            
            <Link to="/login">
              <Button variant="outline" size="xl" className="bg-white text-primary hover:bg-primary hover:text-white border-white">
                Login to Portal
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <p className="text-4xl md:text-5xl font-heading font-bold text-primary">{stat.value}</p>
                <p className="text-muted-foreground mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A complete placement management solution for students and placement officers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group transition-all duration-300 hover:shadow-card-hover hover:-translate-y-2 border-border/50 animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-heading font-bold text-primary-foreground mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have landed their dream jobs through our platform.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 text-primary-foreground/90">
              <CheckCircle className="w-5 h-5" />
              <span>Free for Students</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/90">
              <CheckCircle className="w-5 h-5" />
              <span>100+ Companies</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/90">
              <CheckCircle className="w-5 h-5" />
              <span>Real-time Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={christLogo} 
                alt="Christ University Logo" 
                className="h-10 w-auto object-contain bg-white rounded-lg p-1"
              />
              <div>
                <span className="font-heading font-bold text-background">Christ (Deemed to be University)</span>
                <p className="text-background/60 text-xs">Bengaluru, India</p>
              </div>
            </div>
            <p className="text-background/60 text-sm">
              © 2026 Christ University - Centre for Career Development & Placement. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;