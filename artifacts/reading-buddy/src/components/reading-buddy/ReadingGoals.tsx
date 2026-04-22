import React from "react";
import { format } from "date-fns";
import { Target, TrendingUp, Calendar, ChevronRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useGetReadingBuddyGoals } from "@workspace/api-client-react";

export default function ReadingGoals() {
  const { data: goals, isLoading } = useGetReadingBuddyGoals();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-[200px] bg-card rounded-2xl"></div>
        <div className="h-[400px] bg-card rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-primary/10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
            <Target size={120} />
          </div>
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
              <Target size={20} />
            </div>
            <h3 className="text-3xl font-serif font-medium text-foreground mb-1">
              {goals?.length || 0}
            </h3>
            <p className="text-muted-foreground font-medium">Active Goals</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-secondary/10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
            <TrendingUp size={120} />
          </div>
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-full bg-secondary/20 text-secondary flex items-center justify-center mb-4">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-3xl font-serif font-medium text-foreground mb-1">
              {goals?.reduce((acc, goal) => acc + goal.pagesCompleted, 0) || 0}
            </h3>
            <p className="text-muted-foreground font-medium">Total Pages Read</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-accent/10 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
            <Calendar size={120} />
          </div>
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center mb-4">
              <Calendar size={20} />
            </div>
            <h3 className="text-xl font-serif font-medium text-foreground mb-1">
              {goals && goals.length > 0
                ? format(new Date(Math.min(...goals.map((g) => new Date(g.estimatedDateCompleted).getTime()))), "MMM d, yyyy")
                : "N/A"}
            </h3>
            <p className="text-muted-foreground font-medium">Next Completion</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-card overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4 border-b border-border/50 px-6 py-5">
          <CardTitle className="text-xl font-serif">Completion Estimates</CardTitle>
          <CardDescription>Based on your average reading speed</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {(!goals || goals.length === 0) ? (
            <div className="p-12 text-center text-muted-foreground">
              No active reading goals found. Add a book and log some pages to see estimates.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-[40%] font-medium text-muted-foreground py-4 px-6">Book</TableHead>
                  <TableHead className="w-[30%] font-medium text-muted-foreground py-4">Progress</TableHead>
                  <TableHead className="text-right font-medium text-muted-foreground py-4 px-6">Est. Completion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goals.map((goal) => (
                  <TableRow key={goal.bookId} className="border-border/50 hover:bg-muted/30 transition-colors">
                    <TableCell className="font-serif font-medium text-base py-4 px-6">
                      {goal.bookName}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{goal.pagesCompleted} / {goal.totalPages} p.</span>
                          <span>{Math.round((goal.pagesCompleted / goal.totalPages) * 100)}%</span>
                        </div>
                        <Progress value={(goal.pagesCompleted / goal.totalPages) * 100} className="h-2 rounded-full" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-4 px-6">
                      <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-sm font-medium">
                        {format(new Date(goal.estimatedDateCompleted), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
