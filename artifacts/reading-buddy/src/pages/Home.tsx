import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LogReading from "@/components/reading-buddy/LogReading";
import MyBooks from "@/components/reading-buddy/MyBooks";
import ReadingGoals from "@/components/reading-buddy/ReadingGoals";
import Settings from "@/components/reading-buddy/Settings";
import { BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground pb-20">
      <header className="pt-12 pb-8 px-6 md:px-12 max-w-5xl mx-auto flex items-center justify-center gap-3">
        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-sm">
          <BookOpen size={24} />
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground">
          Reading Buddy
        </h1>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-12">
        <Tabs defaultValue="log" className="w-full">
          <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 gap-6 overflow-x-auto flex-nowrap hide-scrollbar">
            <TabsTrigger
              value="log"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:text-accent data-[state=active]:bg-transparent px-2 py-3 text-base"
            >
              Log Reading
            </TabsTrigger>
            <TabsTrigger
              value="books"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:text-accent data-[state=active]:bg-transparent px-2 py-3 text-base"
            >
              My Books
            </TabsTrigger>
            <TabsTrigger
              value="goals"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:text-accent data-[state=active]:bg-transparent px-2 py-3 text-base"
            >
              Reading Goals
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:text-accent data-[state=active]:bg-transparent px-2 py-3 text-base"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="log" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <LogReading />
            </TabsContent>
            <TabsContent value="books" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <MyBooks />
            </TabsContent>
            <TabsContent value="goals" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <ReadingGoals />
            </TabsContent>
            <TabsContent value="settings" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <Settings />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
