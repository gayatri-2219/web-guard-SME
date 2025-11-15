import { LucideIcon } from "lucide-react";

interface SecurityCheckCardProps {
  title: string;
  status: "success" | "warning" | "error" | "info";
  icon: LucideIcon;
  details: string[];
}

const SecurityCheckCard = ({ title, status, icon: Icon, details }: SecurityCheckCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-success";
      case "warning":
        return "text-warning";
      case "error":
        return "text-destructive";
      case "info":
        return "text-info";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "success":
        return "bg-success/10 border-success/20";
      case "warning":
        return "bg-warning/10 border-warning/20";
      case "error":
        return "bg-destructive/10 border-destructive/20";
      case "info":
        return "bg-info/10 border-info/20";
      default:
        return "bg-muted/10 border-muted/20";
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-all duration-300 animate-slide-up">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${getStatusBg(status)}`}>
          <Icon className={`w-6 h-6 ${getStatusColor(status)}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <div className="space-y-1">
            {details.map((detail, index) => (
              <p key={index} className="text-sm text-muted-foreground">
                {detail}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityCheckCard;
