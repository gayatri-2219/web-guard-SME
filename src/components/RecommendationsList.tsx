import { AlertTriangle, Lightbulb } from "lucide-react";
import AISecurityAssistant from "./AISecurityAssistant";

interface RecommendationsListProps {
  recommendations: string[];
  scanData?: {
    url: string;
    score: number;
  };
}

const RecommendationsList = ({ recommendations, scanData }: RecommendationsListProps) => {
  if (recommendations.length === 0) {
    return (
      <div className="glass-card p-8 rounded-xl text-center">
        <Lightbulb className="w-12 h-12 text-success mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">All Clear!</h3>
        <p className="text-muted-foreground">
          No security recommendations at this time. Great job!
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 rounded-xl animate-slide-up border-l-4 border-l-warning/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-warning/10">
          <AlertTriangle className="w-6 h-6 text-warning" />
        </div>
        <h2 className="text-2xl font-bold">Security Recommendations</h2>
      </div>

      <div className="space-y-3">
        {recommendations.map((recommendation, index) => (
          <div
            key={index}
            className="group flex items-start gap-4 p-4 rounded-lg bg-card border border-warning/20 hover:border-warning/40 transition-all duration-300 hover:shadow-md"
          >
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-warning/30 to-warning/10 flex items-center justify-center text-sm font-bold text-warning border border-warning/30">
              {index + 1}
            </div>
            <p className="flex-1 text-sm leading-relaxed text-foreground">{recommendation}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <AISecurityAssistant recommendations={recommendations} scanData={scanData} />
      </div>
    </div>
  );
};

export default RecommendationsList;
