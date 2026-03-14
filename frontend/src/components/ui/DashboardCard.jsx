import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './Card';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

const DashboardCard = ({
    title,
    value,
    description,
    trend,
    trendValue,
    icon: Icon,
    className
}) => {
    return (
        <Card className={cn("overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-shadow", className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {title}
                </CardTitle>
                {Icon && <Icon className="w-4 h-4 text-primary" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-foreground">{value}</div>
                {(description || trendValue) && (
                    <div className="flex items-center gap-2 mt-1">
                        {trendValue && (
                            <div className={cn(
                                "flex items-center text-xs font-semibold",
                                trend === "up" ? "text-emerald-500" : "text-destructive"
                            )}>
                                {trend === "up" ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                {trendValue}
                            </div>
                        )}
                        {description && <p className="text-xs text-muted-foreground">{description}</p>}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export { DashboardCard };
export default DashboardCard;
