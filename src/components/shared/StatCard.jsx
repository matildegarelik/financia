import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendUp, className }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className={cn("p-3 sm:p-5 relative overflow-hidden hover:shadow-md transition-shadow", className)}>
                <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">{title}</p>
                        <p className="text-lg sm:text-2xl font-bold tracking-tight truncate">{value}</p>
                        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                    </div>
                    {Icon && (
                        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 hidden sm:block">
                            <Icon className="h-4 w-4" />
                        </div>
                    )}
                </div>
                {trend && (
                    <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium",
                        trendUp ? "text-primary" : "text-destructive"
                    )}>
                        <span>{trendUp ? "↑" : "↓"} {trend}</span>
                    </div>
                )}
            </Card>
        </motion.div>
    );
}
