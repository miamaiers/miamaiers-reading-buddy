import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Settings as SettingsIcon, Bell, Target, Save, Loader2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import {
  useGetReadingBuddySettings,
  useUpdateReadingBuddySettings,
  getGetReadingBuddySettingsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const settingsSchema = z.object({
  dailyGoalPages: z.coerce.number().min(1, "Goal must be at least 1 page").max(1000, "Be realistic!"),
  reminderTime: z.string(),
  remindersEnabled: z.boolean(),
});

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  const { data: settings, isLoading } = useGetReadingBuddySettings();
  const updateSettings = useUpdateReadingBuddySettings();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      dailyGoalPages: 20,
      reminderTime: "20:00",
      remindersEnabled: true,
    },
  });

  useEffect(() => {
    if (settings && !initialized.current) {
      form.reset({
        dailyGoalPages: settings.dailyGoalPages,
        reminderTime: settings.reminderTime,
        remindersEnabled: !!settings.reminderTime,
      });
      initialized.current = true;
    }
  }, [settings, form]);

  const onSubmit = (data: z.infer<typeof settingsSchema>) => {
    updateSettings.mutate(
      {
        data: {
          dailyGoalPages: data.dailyGoalPages,
          reminderTime: data.remindersEnabled ? data.reminderTime : "",
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Settings saved",
            description: "Your preferences have been updated.",
          });
          queryClient.invalidateQueries({ queryKey: getGetReadingBuddySettingsQueryKey() });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to save settings.",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto animate-pulse">
        <div className="h-[300px] bg-card rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-none shadow-sm bg-card">
        <CardHeader className="pb-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <SettingsIcon size={20} />
            </div>
            <div>
              <CardTitle className="text-xl font-serif">Preferences</CardTitle>
              <CardDescription>Manage your daily goals and notifications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Target size={16} /> Daily Goals
                </h3>
                <div className="bg-muted/30 p-5 rounded-2xl border border-border/50">
                  <FormField
                    control={form.control}
                    name="dailyGoalPages"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center mb-2">
                          <FormLabel className="text-base m-0">Pages Per Day</FormLabel>
                          <span className="font-serif text-2xl text-primary font-medium">{field.value}</span>
                        </div>
                        <FormDescription className="mb-4">
                          Set a realistic daily reading target to maintain your streak.
                        </FormDescription>
                        <FormControl>
                          <Input 
                            type="range" 
                            min="1" 
                            max="100" 
                            step="1"
                            className="w-full cursor-pointer accent-primary" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Bell size={16} /> Notifications
                </h3>
                <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 space-y-6">
                  <FormField
                    control={form.control}
                    name="remindersEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Daily Reminder</FormLabel>
                          <FormDescription>
                            Get a gentle nudge to read if you haven't logged pages yet.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("remindersEnabled") && (
                    <FormField
                      control={form.control}
                      name="reminderTime"
                      render={({ field }) => (
                        <FormItem className="pt-2 border-t border-border/50 mt-4">
                          <FormLabel>Reminder Time</FormLabel>
                          <FormControl>
                            <Input 
                              type="time" 
                              className="w-full sm:w-[200px] h-12 text-base rounded-xl bg-background" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 text-base font-medium"
                  disabled={updateSettings.isPending}
                >
                  {updateSettings.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                  Save Preferences
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
