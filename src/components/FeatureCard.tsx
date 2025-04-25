
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
  onClick?: () => void;
  badge?: string;
}

const FeatureCard = ({ 
  title, 
  description, 
  icon: Icon, 
  className, 
  onClick, 
  badge 
}: FeatureCardProps) => {
  return (
    <Card 
      className={cn(
        "card-hover border-2 border-border/50 h-full cursor-pointer", 
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="relative pb-2">
        {badge && (
          <span className="absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded-full bg-secondary/20 text-secondary">
            {badge}
          </span>
        )}
        <div className="icon-container mb-2">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
