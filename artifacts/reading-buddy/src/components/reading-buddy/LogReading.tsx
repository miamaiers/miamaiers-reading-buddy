import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addDays } from "date-fns";
import { BookOpen, Clock, Loader2, Check } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

import {
  useListReadingBuddyBooks,
  useCreateReadingBuddySession,
  useGetReadingBuddyStats,
  getGetReadingBuddyStatsQueryKey,
  getListReadingBuddyBooksQueryKey,
  getGetReadingBuddyActivityQueryKey,
  getGetReadingBuddyGoalsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const quickLogSchema = z.object({
  bookId: z.coerce.number().min(1, "Please select a book"),
  pagesRead: z.coerce.number().min(1, "Must read at least 1 page"),
});

const detailedLogSchema = z.object({
  bookId: z.coerce.number().min(1, "Please select a book"),
  pagesRead: z.coerce.number().min(1, "Must read at least 1 page"),
  minutesRead: z.coerce.number().min(1, "Must read for at least 1 minute"),
  date: z.string().optional(),
});

export default function LogReading() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("quick");

  const { data: books, isLoading: isLoadingBooks } = useListReadingBuddyBooks();
  const { data: stats } = useGetReadingBuddyStats();
  const createSession = useCreateReadingBuddySession();

  const activeBooks = books?.filter((b) => b.status === "currently_reading") || [];

  const quickForm = useForm<z.infer<typeof quickLogSchema>>({
    resolver: zodResolver(quickLogSchema),
    defaultValues: {
      bookId: undefined,
      pagesRead: undefined,
    },
  });

  const detailedForm = useForm<z.infer<typeof detailedLogSchema>>({
    resolver: zodResolver(detailedLogSchema),
    defaultValues: {
      bookId: undefined,
      pagesRead: undefined,
      minutesRead: undefined,
      date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const onLogSession = (data: z.infer<typeof quickLogSchema> | z.infer<typeof detailedLogSchema>) => {
    createSession.mutate(
      {
        data: {
          bookId: data.bookId,
          pagesRead: data.pagesRead,
          minutesRead: "minutesRead" in data ? data.minutesRead : undefined,
          loggedAt: "date" in data && data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Session logged!",
            description: `Great job! You read ${data.pagesRead} pages.`,
          });
          queryClient.invalidateQueries({ queryKey: getGetReadingBuddyStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListReadingBuddyBooksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetReadingBuddyActivityQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetReadingBuddyGoalsQueryKey() });
          
          quickForm.reset();
          detailedForm.reset();
        },
        onError: (error) => {
          toast({
            title: "Error logging session",
            description: "Please try again later.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const getEstimatedCompletion = (bookId: number) => {
    if (!bookId || !books || !stats?.averagePagesPerDay) return null;
    const book = books.find(b => b.id === bookId);
    if (!book || stats.averagePagesPerDay <= 0) return null;
    
    const remainingPages = book.totalPages - book.currentPage;
    if (remainingPages <= 0) return "Completed";
    
    const daysRemaining = Math.ceil(remainingPages / stats.averagePagesPerDay);
    return format(addDays(new Date(), daysRemaining), "MMM d, yyyy");
  };

  const selectedQuickBookId = quickForm.watch("bookId");
  const selectedDetailedBookId = detailedForm.watch("bookId");

  return (
    <div className="grid gap-6 md:grid-cols-12 items-start">
      <div className="md:col-span-8 space-y-6">
        <Card className="border-none shadow-sm bg-card overflow-hidden">
          <div className="bg-primary/10 px-6 py-4 border-b border-primary/20 flex items-center gap-3">
            <BookOpen className="text-primary" size={24} />
            <h2 className="text-2xl font-serif font-medium text-foreground m-0">Log Your Reading Session</h2>
          </div>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="quick" className="text-base rounded-md">Quick Log</TabsTrigger>
                <TabsTrigger value="detailed" className="text-base rounded-md">Detailed Log</TabsTrigger>
              </TabsList>
              
              <TabsContent value="quick">
                <Form {...quickForm}>
                  <form onSubmit={quickForm.handleSubmit(onLogSession)} className="space-y-6">
                    <FormField
                      control={quickForm.control}
                      name="bookId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Which book did you read?</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value?.toString() || ""}>
                            <FormControl>
                              <SelectTrigger className="h-12 text-base rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-ring">
                                <SelectValue placeholder="Select a book" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingBooks ? (
                                <div className="p-4 text-center text-muted-foreground text-sm">Loading...</div>
                              ) : activeBooks.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground text-sm">No active books. Add one in My Books.</div>
                              ) : (
                                activeBooks.map((book) => (
                                  <SelectItem key={book.id} value={book.id.toString()}>
                                    {book.title}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                          {selectedQuickBookId && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Est. Completion: <span className="font-medium text-foreground">{getEstimatedCompletion(Number(selectedQuickBookId)) || "Need more data"}</span>
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={quickForm.control}
                      name="pagesRead"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Pages Read</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              className="h-12 text-lg rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-ring"
                              placeholder="e.g. 25"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                      disabled={createSession.isPending}
                    >
                      {createSession.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
                      Log Pages
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="detailed">
                <Form {...detailedForm}>
                  <form onSubmit={detailedForm.handleSubmit(onLogSession)} className="space-y-6">
                    <FormField
                      control={detailedForm.control}
                      name="bookId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Which book did you read?</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value?.toString() || ""}>
                            <FormControl>
                              <SelectTrigger className="h-12 text-base rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-ring">
                                <SelectValue placeholder="Select a book" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {activeBooks.map((book) => (
                                <SelectItem key={book.id} value={book.id.toString()}>
                                  {book.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                          {selectedDetailedBookId && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Est. Completion: <span className="font-medium text-foreground">{getEstimatedCompletion(Number(selectedDetailedBookId)) || "Need more data"}</span>
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={detailedForm.control}
                        name="pagesRead"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Pages Read</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                className="h-12 text-lg rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-ring"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={detailedForm.control}
                        name="minutesRead"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Minutes</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                className="h-12 text-lg rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-ring"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={detailedForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              className="h-12 text-base rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-ring"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                      disabled={createSession.isPending}
                    >
                      {createSession.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
                      Log Detailed Session
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-4 space-y-6">
        <Card className="border-none shadow-sm bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-serif">Today's Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-end justify-between">
              <span className="text-3xl font-serif font-medium text-foreground">{stats?.pagesToday || 0}</span>
              <span className="text-muted-foreground mb-1">/ {stats?.dailyGoalPages || 0} pages</span>
            </div>
            <Progress 
              value={stats ? Math.min(100, ((stats.pagesToday || 0) / (stats.dailyGoalPages || 1)) * 100) : 0} 
              className="h-3 rounded-full"
            />
            {stats && stats.pagesToday >= stats.dailyGoalPages && (
              <p className="text-sm text-secondary font-medium mt-3 flex items-center gap-1">
                <Check size={16} /> Goal reached!
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-serif">Current Streak</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary/20 text-secondary flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <div className="text-2xl font-serif font-medium text-foreground">{stats?.currentStreakDays || 0} Days</div>
              <div className="text-sm text-muted-foreground">Keep it up!</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
