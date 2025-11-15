import { Shield } from "lucide-react";

interface ScoreCardProps {
  score: number;
}

const ScoreCard = ({ score }: ScoreCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Good";
    if (score >= 60) return "Fair";
    return "Poor";
  };

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card p-8 rounded-xl animate-scale-in hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Cyber Health Score</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Comprehensive security assessment based on industry standards
          </p>
          <div className="flex items-baseline gap-4">
            <div className={`text-6xl font-bold tabular-nums ${getScoreColor(score)}`}>
              {score}
            </div>
            <div>
              <div className="text-lg font-semibold">{getScoreLabel(score)}</div>
              <div className="text-sm text-muted-foreground">out of 100</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <svg className="transform -rotate-90 w-64 h-64">
            {/* Background circle */}
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-muted/10"
            />
            {/* Progress circle */}
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out drop-shadow-lg"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--secondary))" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20`}>
              <Shield className={`w-16 h-16 ${getScoreColor(score)}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
