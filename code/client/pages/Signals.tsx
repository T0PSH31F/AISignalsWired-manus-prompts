import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowRight, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Signals() {
  const { user, isAuthenticated } = useAuth();

  // Fetch latest signals
  const { data: signals, isLoading } = trpc.signals.latest.useQuery(
    { limit: 20 },
    { refetchInterval: 15000 }
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
                <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  {APP_TITLE}
                </span>
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
                Create a free account to access live trading signals
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
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost">Settings</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="border-b border-border/40 bg-card/30">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-2">Live Trading Signals</h1>
          <p className="text-muted-foreground">
            Real-time signals from our AI-powered strategies
          </p>
        </div>
      </div>

      {/* Signals Grid */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : signals && signals.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {signals.map((signal) => {
              const isBuy = signal.action === "BUY";
              const confidence = signal.confidenceScore;
              const entryPrice = parseFloat(signal.entryPrice);
              const stopLoss = parseFloat(signal.stopLoss);
              const takeProfit = parseFloat(signal.takeProfit);
              const riskReward = ((takeProfit - entryPrice) / (entryPrice - stopLoss)).toFixed(2);

              return (
                <Card
                  key={signal.id}
                  className={`bg-card/50 border-2 transition-all hover:scale-105 ${
                    isBuy ? "border-chart-3/40 hover:border-chart-3" : "border-destructive/40 hover:border-destructive"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl font-mono">{signal.asset}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {signal.strategyType}
                        </CardDescription>
                      </div>
                      <div
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
                          isBuy
                            ? "bg-chart-3/20 text-chart-3"
                            : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {isBuy ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {signal.action}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Entry Price */}
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Entry Price</div>
                      <div className="text-2xl font-mono font-bold text-accent">
                        ${entryPrice.toFixed(2)}
                      </div>
                    </div>

                    {/* Stop Loss & Take Profit */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Stop Loss</div>
                        <div className="text-sm font-mono text-destructive">
                          ${stopLoss.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Take Profit</div>
                        <div className="text-sm font-mono text-chart-3">
                          ${takeProfit.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Confidence & R:R */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Confidence</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${confidence}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-primary">{confidence}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Risk:Reward</div>
                        <div className="text-sm font-mono text-foreground">1:{riskReward}</div>
                      </div>
                    </div>

                    {/* Rationale */}
                    {signal.rationale && (
                      <div className="pt-2 border-t border-border/40">
                        <div className="text-xs text-muted-foreground mb-1">Analysis</div>
                        <p className="text-xs text-foreground/80 line-clamp-2">
                          {signal.rationale}
                        </p>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="text-xs text-muted-foreground">
                      {new Date(signal.createdAt).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>No Signals Yet</CardTitle>
              <CardDescription>
                New signals are generated every 15 minutes. Check back soon!
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
