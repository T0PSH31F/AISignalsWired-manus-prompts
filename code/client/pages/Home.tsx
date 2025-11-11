import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BarChart3, Bell, Shield, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [tickerSignals, setTickerSignals] = useState<any[]>([]);

  // Fetch latest signals for ticker
  const { data: latestSignals } = trpc.signals.latest.useQuery(
    { limit: 10 },
    { refetchInterval: 15000 } // Refresh every 15 seconds
  );

  useEffect(() => {
    if (latestSignals) {
      setTickerSignals(latestSignals);
    }
  }, [latestSignals]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {APP_TITLE}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link href="/signals">
                  <Button variant="default">View Signals</Button>
                </Link>
              </>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button variant="ghost">Sign In</Button>
                </a>
                <a href={getLoginUrl()}>
                  <Button variant="default" className="bg-primary hover:bg-primary/90">
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Live Signal Ticker */}
      {tickerSignals.length > 0 && (
        <div className="bg-card/50 border-b border-border/40 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap py-3">
            <div className="inline-flex gap-8">
              {tickerSignals.concat(tickerSignals).map((signal, idx) => (
                <div key={idx} className="inline-flex items-center gap-2 text-sm">
                  <span className="font-mono font-semibold text-foreground">{signal.asset}</span>
                  <span
                    className={`font-bold ${
                      signal.action === "BUY" ? "text-chart-3" : "text-destructive"
                    }`}
                  >
                    {signal.action}
                  </span>
                  <span className="text-muted-foreground">@</span>
                  <span className="font-mono text-accent">${parseFloat(signal.entryPrice).toFixed(2)}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground text-xs">{signal.strategyType}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">AI-Powered Trading Signals</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              Real-Time Signals
            </span>
            <br />
            <span className="text-foreground">That Actually Win</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced technical analysis powered by 3 proven strategies. Get instant alerts for
            high-confidence trading opportunities in crypto markets.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
            <Link href="/signals">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                View Live Signals
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">65%+</div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-accent">3</div>
              <div className="text-sm text-muted-foreground">Strategies</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-chart-3">10+</div>
              <div className="text-sm text-muted-foreground">Assets</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose AI Signals Wired?</h2>
          <p className="text-xl text-muted-foreground">
            Professional-grade tools for serious traders
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-card/50 border-primary/20 hover:border-primary/40 transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Proven Strategies</CardTitle>
              <CardDescription>
                RSI, MACD, and TEMA momentum strategies with 65%+ win rates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 border-accent/20 hover:border-accent/40 transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>Real-Time Alerts</CardTitle>
              <CardDescription>
                Instant Discord webhooks and email notifications for every signal
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 border-chart-3/20 hover:border-chart-3/40 transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-chart-3" />
              </div>
              <CardTitle>Risk Management</CardTitle>
              <CardDescription>
                Built-in circuit breakers and position limits to protect your capital
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your trading style
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <div className="text-3xl font-bold mt-4">$0</div>
              <CardDescription>Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  3 signals per day
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Email notifications
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Basic strategy access
                </li>
              </ul>
              <a href={getLoginUrl()}>
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Premium Tier */}
          <Card className="bg-card/50 border-primary/40 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
              POPULAR
            </div>
            <CardHeader>
              <CardTitle>Premium</CardTitle>
              <div className="text-3xl font-bold mt-4">
                $29<span className="text-lg text-muted-foreground">/mo</span>
              </div>
              <CardDescription>For active traders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Unlimited signals
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Discord webhooks
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  All strategies
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Performance analytics
                </li>
              </ul>
              <a href={getLoginUrl()}>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Start Premium
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Elite Tier */}
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle>Elite</CardTitle>
              <div className="text-3xl font-bold mt-4">
                $99<span className="text-lg text-muted-foreground">/mo</span>
              </div>
              <CardDescription>For professional traders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Everything in Premium
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  API access
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Priority support
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Custom webhooks
                </li>
              </ul>
              <a href={getLoginUrl()}>
                <Button variant="outline" className="w-full">
                  Go Elite
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 border-primary/20">
          <CardContent className="py-16 text-center space-y-6">
            <h2 className="text-4xl font-bold">Ready to Level Up Your Trading?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join traders who are already using AI-powered signals to make smarter decisions
            </p>
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">
                © 2024 {APP_TITLE}. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/signals">
                <a className="hover:text-foreground transition-colors">Signals</a>
              </Link>
              <Link href="/dashboard">
                <a className="hover:text-foreground transition-colors">Dashboard</a>
              </Link>
              <a href="#" className="hover:text-foreground transition-colors">
                Docs
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Add marquee animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
