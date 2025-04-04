import { 
  AlertCircle, 
  AlertTriangle, 
  Check, 
  Plus, 
  TrendingDown, 
  TrendingUp 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type IconName = "alert-circle" | "alert-triangle" | "check" | "plus";
type IconColor = "primary" | "amber" | "red" | "emerald";
type TrendType = "up" | "down" | "neutral";

interface MetricCardProps {
  title: string;
  value: number;
  iconName: IconName;
  iconColor: IconColor;
  trend?: string;
  trendUp?: boolean;
  trendType?: TrendType;
}

const MetricCard = ({
  title,
  value,
  iconName,
  iconColor,
  trend,
  trendUp,
  trendType = trendUp ? "up" : "down",
}: MetricCardProps) => {
  const getIcon = () => {
    switch (iconName) {
      case "alert-circle":
        return <AlertCircle className="h-6 w-6" />;
      case "alert-triangle":
        return <AlertTriangle className="h-6 w-6" />;
      case "check":
        return <Check className="h-6 w-6" />;
      case "plus":
        return <Plus className="h-6 w-6" />;
      default:
        return <Plus className="h-6 w-6" />;
    }
  };

  const getIconColorClass = () => {
    switch (iconColor) {
      case "primary":
        return "text-primary bg-primary/10";
      case "amber":
        return "text-amber-500 bg-amber-500/10";
      case "red":
        return "text-red-600 bg-red-600/10";
      case "emerald":
        return "text-emerald-500 bg-emerald-500/10";
      default:
        return "text-primary bg-primary/10";
    }
  };

  const getTrendIcon = () => {
    switch (trendType) {
      case "up":
        return <TrendingUp className="w-4 h-4 mr-1" />;
      case "down":
        return <TrendingDown className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  const getTrendColorClass = () => {
    switch (trendType) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-slate-600";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${getIconColorClass()}`}>
            {getIcon()}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-slate-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-semibold text-slate-800">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
        {trend && (
          <div className="mt-4 bg-slate-50 px-4 py-2 -mx-6 -mb-6">
            <div className={`text-sm flex items-center ${getTrendColorClass()}`}>
              {getTrendIcon()}
              <span className="font-medium">{trend}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
