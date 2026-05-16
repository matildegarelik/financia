import React from "react";

export default function PageHeader({ title, description, action }) {
    return (
        <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
