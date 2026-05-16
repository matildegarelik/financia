import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendUp, className }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className={cn("p-5 relative overflow-hidden group hover:shadow-lg transition-shadow", className)}>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold tracking-tight">{value}</p>
                        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                    </div>
                    {Icon && (
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                        </div>
                    )}
                </div>
                {trend && (
                    <div className={cn("flex items-center gap-1 mt-3 text-xs font-medium",
                        trendUp ? "text-primary" : "text-destructive"
                    )}>
                        <span>{trendUp ? "↑" : "↓"} {trend}</span>
                    </div>
                )}
            </Card>
        </motion.div>
    );
}