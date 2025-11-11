import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Activity, ArrowRight, Bell, Settings, TrendingUp, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();

  // Fetch user subscription and preferences
  const { data: subscription } = trpc.subscriptions.status.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: preferences } = trpc.subscriptions.preferences.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch user's recent signals
  const { data: recentSignals } = trpc.signals.latest.useQuery(
    { limit: 5 },
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <nav className="border-b border-border/40 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">{APP_TITLE}</span>
              </div>
            </Link>
            <a href={getLoginUrl()}>
              <Button variant="default">Sign In</Button>
            </a>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md mx-4">
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>
                Create a free account to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a href={getLoginUrl()}>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const tier = subscription?.tier || "free";
  const tierColors = {
    free: "text-muted-foreground",
    basic: "text-primary",
    premium: "text-accent",
    elite: "text-chart-3",
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                {APP_TITLE}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/signals">
              <Button variant="ghost">Signals</Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="ghost" onClick={() => logout()}>
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="border-b border-border/40 bg-card/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name || "Trader"}!</h1>
              <p className="text-muted-foreground">
                Your subscription:{" "}
                <span className={`font-bold uppercase ${tierColors[tier as keyof typeof tierColors]}`}>
                  {tier}
                </span>
              </p>
            </div>
            {tier === "free" && (
              <Link href="/#pricing">
                <Button className="bg-primary hover:bg-primary/90">
                  Upgrade Plan
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Stats */}
          <Card className="bg-card/50 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Subscription</CardTitle>
                <Activity className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${tierColors[tier as keyof typeof tierColors]}`}>
                {tier.toUpperCase()}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {tier === "free" ? "3 signals/day" : "Unlimited signals"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-accent/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Signals Today</CardTitle>
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {recentSignals?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Last 24 hours
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-chart-3/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                <Bell className="w-4 h-4 text-chart-3" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-3">
                {preferences?.emailNotifications ? "ON" : "OFF"}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Email alerts enabled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Signals */}
        <Card className="bg-card/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Signals</CardTitle>
                <CardDescription>Your latest trading opportunities</CardDescription>
              </div>
              <Link href="/signals">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentSignals && recentSignals.length > 0 ? (
              <div className="space-y-4">
                {recentSignals.map((signal) => (
                  <div
                    key={signal.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/40"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          signal.action === "BUY"
                            ? "bg-chart-3/20 text-chart-3"
                            : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {signal.action}
                      </div>
                      <div>
                        <div className="font-mono font-bold">{signal.asset}</div>
                        <div className="text-xs text-muted-foreground">{signal.strategyType}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-accent">${parseFloat(signal.entryPrice).toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(signal.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No signals yet. Check back soon!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade CTA for Free Users */}
        {tier === "free" && (
          <Card className="mt-8 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 border-primary/20">
            <CardContent className="py-8 text-center space-y-4">
              <h3 className="text-2xl font-bold">Unlock Unlimited Signals</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Upgrade to Premium for unlimited signals, Discord webhooks, and advanced analytics
              </p>
              <Link href="/#pricing">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  View Plans
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
