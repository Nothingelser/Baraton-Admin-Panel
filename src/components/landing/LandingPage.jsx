import React, { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  BookOpen,
  Calendar,
  ChevronRight,
  Cloud,
  Cpu,
  Database,
  LogIn,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

function LandingPage({ setShowLogin, setShowSignup }) {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: 'Smart Course Management',
      description: 'Effortlessly schedule and manage examination courses with intelligent row allocation',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Real-time Analytics',
      description: 'Track student enrollment, venue utilization, and exam schedules in real-time',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Secure & Reliable',
      description: 'Bank-grade security with automated backups and role-based access control',
      icon: Shield,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Bulk Operations',
      description: 'Import and export data seamlessly with support for CSV and JSON formats',
      icon: Database,
      color: 'from-orange-500 to-red-500',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 rounded-xl shadow-lg">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Baraton EMS</h1>
              <p className="text-xs text-blue-200">Examination Management System</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowLogin(true)}
              className="px-6 py-2.5 text-sm font-medium text-white hover:text-blue-200 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowSignup(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-full text-sm font-medium backdrop-blur-sm">
              <span className="flex items-center">
                <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                Trusted by 50+ Universities
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Modern Exam
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Management System
              </span>
            </h1>

            <p className="text-xl text-blue-100 leading-relaxed">
              Streamline your examination scheduling, automate row allocation, and manage courses with the most advanced
              academic management platform.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowSignup(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-lg font-semibold shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-105 flex items-center space-x-2"
              >
                <span>Start Free Trial</span>
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-lg font-semibold hover:bg-white/20 transition-all flex items-center space-x-2"
              >
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </button>
            </div>

            <div className="flex items-center space-x-8 pt-8">
              <div>
                <div className="text-3xl font-bold">50+</div>
                <div className="text-sm text-blue-200">Universities</div>
              </div>
              <div className="h-12 w-px bg-blue-400/30"></div>
              <div>
                <div className="text-3xl font-bold">100K+</div>
                <div className="text-sm text-blue-200">Students</div>
              </div>
              <div className="h-12 w-px bg-blue-400/30"></div>
              <div>
                <div className="text-3xl font-bold">99.9%</div>
                <div className="text-sm text-blue-200">Uptime</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-2xl transition-all duration-500 cursor-pointer ${
                      activeFeature === index
                        ? 'bg-gradient-to-r ' + feature.color + ' shadow-lg scale-105'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl ${activeFeature === index ? 'bg-white/20' : 'bg-white/10'}`}>
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                        <p className={`text-sm ${activeFeature === index ? 'text-white/90' : 'text-blue-200'}`}>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div
              className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl opacity-50 animate-pulse"
              style={{ animationDelay: '1s' }}
            ></div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-xl text-blue-200">Powerful features for modern exam management</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Cpu, title: 'API Integration', desc: 'RESTful API for seamless integration' },
            { icon: Shield, title: 'Advanced Security', desc: '2FA and role-based access control' },
            { icon: Cloud, title: 'Cloud Backup', desc: 'Automated backups every 24 hours' },
            { icon: Activity, title: 'Real-time Sync', desc: 'Instant updates across all devices' },
            { icon: BarChart3, title: 'Analytics', desc: 'Comprehensive reporting and insights' },
            { icon: Users, title: 'Team Collaboration', desc: 'Work together seamlessly' },
          ].map((item, index) => (
            <div
              key={index}
              className="group p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all hover:scale-105 hover:shadow-xl"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-blue-200">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of educators using Baraton EMS to streamline their examination management
          </p>
          <button
            onClick={() => setShowSignup(true)}
            className="px-8 py-4 bg-white text-blue-600 rounded-xl text-lg font-semibold hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center space-x-2"
          >
            <span>Create Free Account</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <footer className="relative z-10 border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="font-bold">Baraton EMS</span>
              </div>
              <p className="text-sm text-blue-200">Modern examination management for modern universities</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-blue-200">
            <p>© 2026 Baraton University. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

