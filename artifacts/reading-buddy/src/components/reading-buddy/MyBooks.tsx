import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Plus, Book as BookIcon, Check, Loader2, MoreVertical } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  useListReadingBuddyBooks,
  useCreateReadingBuddyBook,
  useUpdateReadingBuddyBook,
  getListReadingBuddyBooksQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  totalPages: z.coerce.number().min(1, "Total pages must be greater than 0"),
});

export default function MyBooks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: books, isLoading } = useListReadingBuddyBooks();
  const createBook = useCreateReadingBuddyBook();
  const updateBook = useUpdateReadingBuddyBook();

  const form = useForm<z.infer<typeof bookSchema>>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      totalPages: undefined,
    },
  });

  const onSubmit = (data: z.infer<typeof bookSchema>) => {
    createBook.mutate(
      {
        data: {
          title: data.title,
          author: data.author,
          totalPages: data.totalPages,
          currentPage: 0,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Book added",
            description: `${data.title} has been added to your library.`,
          });
          queryClient.invalidateQueries({ queryKey: getListReadingBuddyBooksQueryKey() });
          form.reset();
          setIsAddOpen(false);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to add book. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const markAsCompleted = (bookId: number) => {
    const book = books?.find(b => b.id === bookId);
    if (!book) return;

    updateBook.mutate(
      {
        bookId,
        data: { status: "completed", currentPage: book.totalPages },
      },
      {
        onSuccess: () => {
          toast({
            title: "Book completed!",
            description: `Congratulations on finishing ${book.title}!`,
          });
          queryClient.invalidateQueries({ queryKey: getListReadingBuddyBooksQueryKey() });
        },
      }
    );
  };

  const currentlyReading = books?.filter(b => b.status === "currently_reading") || [];
  const completedBooks = books?.filter(b => b.status === "completed") || [];

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-serif font-medium text-foreground flex items-center gap-2">
          <BookIcon className="text-secondary" /> 
          Currently Reading
        </h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2">
              <Plus size={18} /> Add New Book
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif font-medium">Add to Library</DialogTitle>
              <DialogDescription>
                Add a new book to start tracking your reading progress.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="The Secret History" className="rounded-xl bg-muted/50 border-transparent h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <FormControl>
                        <Input placeholder="Donna Tartt" className="rounded-xl bg-muted/50 border-transparent h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalPages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Pages</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="559" className="rounded-xl bg-muted/50 border-transparent h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-2 flex justify-end gap-3">
                  <Button type="button" variant="outline" className="rounded-full" onClick={() => setIsAddOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-full bg-primary hover:bg-primary/90" disabled={createBook.isPending}>
                    {createBook.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Book
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border-none shadow-sm animate-pulse bg-card/50 h-[200px]" />
          ))}
        </div>
      ) : currentlyReading.length === 0 ? (
        <Card className="border-dashed border-2 border-border shadow-none bg-transparent">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
              <BookIcon size={32} />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No books currently reading</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Add a book to your library to start tracking your reading journey and building your habit.
            </p>
            <Button variant="outline" className="rounded-full" onClick={() => setIsAddOpen(true)}>
              <Plus size={18} className="mr-2" /> Add Your First Book
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentlyReading.map((book) => (
            <Card key={book.id} className="border-none shadow-sm bg-card hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
              <CardHeader className="pb-3 flex-row justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-lg font-serif line-clamp-2 leading-snug">{book.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full -mt-1 -mr-2 text-muted-foreground">
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem onClick={() => markAsCompleted(book.id)}>
                      <Check className="mr-2 h-4 w-4" />
                      Mark as Completed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="pb-4 mt-auto">
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span className="text-foreground">{book.currentPage} pages</span>
                  <span className="text-muted-foreground">{book.totalPages} total</span>
                </div>
                <Progress value={(book.currentPage / book.totalPages) * 100} className="h-2.5 rounded-full" />
                <div className="text-xs text-muted-foreground mt-3 flex justify-between">
                  <span>{Math.round((book.currentPage / book.totalPages) * 100)}% complete</span>
                  <span>Started {format(new Date(book.startedAt), "MMM d")}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {completedBooks.length > 0 && (
        <div className="pt-8 space-y-6">
          <h2 className="text-2xl font-serif font-medium text-foreground flex items-center gap-2">
            <Check className="text-secondary" /> 
            Completed Library
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {completedBooks.map((book) => (
              <Card key={book.id} className="border-none shadow-sm bg-card/60 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
                <CardContent className="p-5">
                  <h3 className="font-serif font-medium text-foreground line-clamp-2 mb-1">{book.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{book.author}</p>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Check size={12} className="text-secondary" />
                    Finished {book.completedAt ? format(new Date(book.completedAt), "MMM d, yyyy") : "Unknown"}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
