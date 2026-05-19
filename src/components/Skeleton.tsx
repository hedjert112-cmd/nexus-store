import React from 'react';
import { cn } from '../lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'rectangular' }) => {
  return (
    <div 
      className={cn(
        "animate-pulse bg-[#f0f0f0]", 
        variant === 'circular' ? 'rounded-full' : 'rounded-xl',
        className
      )} 
    />
  );
};

export const ProductCardSkeleton: React.FC = () => (
  <div className="flex flex-col gap-5">
    <Skeleton className="aspect-[4/5] w-full rounded-[40px]" />
    <div className="flex flex-col gap-2.5 px-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-2 w-16" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-3 w-12" />
      </div>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="w-2 h-2 rounded-full" />)}
      </div>
    </div>
  </div>
);
