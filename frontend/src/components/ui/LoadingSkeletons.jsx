import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';

export const SkeletonPulse = ({ className = "" }) => (
  <div className={`bg-slate-200 animate-pulse rounded-md ${className}`}></div>
);

export const DashboardStatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i} className="rounded-2xl border-0 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-6 flex items-center gap-4">
          <SkeletonPulse className="w-14 h-14 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonPulse className="h-4 w-24" />
            <SkeletonPulse className="h-8 w-16" />
            <SkeletonPulse className="h-3 w-32" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <Card className="rounded-2xl border-0 shadow-sm bg-white overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <SkeletonPulse className="h-6 w-48" />
      <div className="flex gap-2">
        <SkeletonPulse className="h-4 w-16" />
        <SkeletonPulse className="h-4 w-16" />
      </div>
    </CardHeader>
    <CardContent className="h-[300px] mt-4 flex items-end gap-2 px-6">
      {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
        <SkeletonPulse key={i} className={`flex-1 rounded-t-sm`} style={{ height: `${h}%` }} />
      ))}
    </CardContent>
  </Card>
);

export const ListSkeleton = ({ rows = 5 }) => (
  <Card className="rounded-2xl border-0 shadow-sm bg-white overflow-hidden">
    <CardHeader className="pb-4 border-b border-slate-100">
      <SkeletonPulse className="h-6 w-40" />
    </CardHeader>
    <CardContent className="p-0">
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex gap-4 items-center">
            <SkeletonPulse className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonPulse className="h-4 w-3/4" />
              <SkeletonPulse className="h-3 w-1/2" />
            </div>
            <SkeletonPulse className="h-3 w-16" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const GridSkeleton = ({ count = 6 }) => (
  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="p-5 pb-3">
          <div className="flex justify-between items-start">
            <SkeletonPulse className="w-10 h-10 rounded-xl shrink-0" />
            <SkeletonPulse className="h-4 w-12 rounded-sm" />
          </div>
          <SkeletonPulse className="h-6 w-3/4 mt-3 rounded-sm" />
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <SkeletonPulse className="h-3 w-1/2 rounded-sm" />
          <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-slate-50">
            <SkeletonPulse className="h-3 w-full rounded-sm" />
            <SkeletonPulse className="h-3 w-3/4 rounded-sm" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const PageLoader = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="w-full h-full flex flex-col space-y-6"
  >
    <div className="flex justify-between items-center mb-2">
      <SkeletonPulse className="h-8 w-48" />
      <SkeletonPulse className="h-10 w-32 rounded-xl" />
    </div>
    <DashboardStatsSkeleton />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ChartSkeleton />
      </div>
      <div>
        <ListSkeleton />
      </div>
    </div>
  </motion.div>
);
