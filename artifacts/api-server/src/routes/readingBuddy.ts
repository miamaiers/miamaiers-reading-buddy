import { desc, eq, gte } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateReadingBuddyBookBody,
  CreateReadingBuddySessionBody,
  GetReadingBuddyActivityResponse,
  GetReadingBuddyGoalsResponse,
  GetReadingBuddySettingsResponse,
  GetReadingBuddyStatsResponse,
  ListReadingBuddyBooksResponseItem,
  ListReadingBuddyBooksResponse,
  UpdateReadingBuddyBookBody,
  UpdateReadingBuddyBookParams,
  UpdateReadingBuddyBookResponse,
  UpdateReadingBuddySettingsBody,
  UpdateReadingBuddySettingsResponse,
} from "@workspace/api-zod";
import {
  db,
  readingBuddyBooksTable,
  readingBuddySessionsTable,
  readingBuddySettingsTable,
} from "@workspace/db";

const router: IRouter = Router();

const todayDate = () => new Date().toISOString().slice(0, 10);
let seedDataPromise: Promise<void> | null = null;

const toDateTime = (value: Date | string) =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

const mapBook = (book: typeof readingBuddyBooksTable.$inferSelect) => ({
  id: book.id,
  title: book.title,
  author: book.author,
  totalPages: book.totalPages,
  currentPage: book.currentPage,
  status: book.status as "currently_reading" | "completed",
  startedAt: book.startedAt,
  completedAt: book.completedAt,
  createdAt: toDateTime(book.createdAt),
});

const mapSettings = (
  settings: typeof readingBuddySettingsTable.$inferSelect,
) => ({
  id: settings.id,
  dailyGoalPages: settings.dailyGoalPages,
  reminderTime: settings.reminderTime,
  updatedAt: toDateTime(settings.updatedAt),
});

async function ensureSeedDataOnce() {
  const existingSettings = await db.select().from(readingBuddySettingsTable);

  if (existingSettings.length === 0) {
    await db.insert(readingBuddySettingsTable).values({
      dailyGoalPages: 25,
      reminderTime: "8:00 PM",
    });
  }

  const existingBooks = await db.select().from(readingBuddyBooksTable);

  if (existingBooks.length === 0) {
    const [bookOne, bookTwo, bookThree] = await db
      .insert(readingBuddyBooksTable)
      .values([
        {
          title: "Tomorrow, and Tomorrow, and Tomorrow",
          author: "Gabrielle Zevin",
          totalPages: 416,
          currentPage: 148,
          status: "currently_reading",
        },
        {
          title: "Braiding Sweetgrass",
          author: "Robin Wall Kimmerer",
          totalPages: 408,
          currentPage: 72,
          status: "currently_reading",
        },
        {
          title: "The Midnight Library",
          author: "Matt Haig",
          totalPages: 304,
          currentPage: 304,
          status: "completed",
          completedAt: todayDate(),
        },
      ])
      .returning();

    if (bookOne && bookTwo && bookThree) {
      await db.insert(readingBuddySessionsTable).values([
        {
          bookId: bookOne.id,
          pagesRead: 24,
          minutesRead: 32,
          loggedAt: new Date(),
        },
        {
          bookId: bookTwo.id,
          pagesRead: 18,
          minutesRead: 25,
          loggedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
          bookId: bookThree.id,
          pagesRead: 30,
          minutesRead: 40,
          loggedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ]);
    }
  }
}

async function ensureSeedData() {
  if (!seedDataPromise) {
    seedDataPromise = ensureSeedDataOnce().catch((error) => {
      seedDataPromise = null;
      throw error;
    });
  }

  await seedDataPromise;
}

async function getSettings() {
  await ensureSeedData();
  const [settings] = await db
    .select()
    .from(readingBuddySettingsTable)
    .orderBy(readingBuddySettingsTable.id)
    .limit(1);

  if (!settings) {
    const [created] = await db
      .insert(readingBuddySettingsTable)
      .values({})
      .returning();

    if (!created) {
      throw new Error("Unable to create Reading Buddy settings");
    }

    return created;
  }

  return settings;
}

router.get("/reading-buddy/books", async (_req, res): Promise<void> => {
  await ensureSeedData();
  const books = await db
    .select()
    .from(readingBuddyBooksTable)
    .orderBy(desc(readingBuddyBooksTable.createdAt));

  res.json(ListReadingBuddyBooksResponse.parse(books.map(mapBook)));
});

router.post("/reading-buddy/books", async (req, res): Promise<void> => {
  const parsed = CreateReadingBuddyBookBody.safeParse(req.body);

  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid book body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [book] = await db
    .insert(readingBuddyBooksTable)
    .values({
      title: parsed.data.title,
      author: parsed.data.author,
      totalPages: parsed.data.totalPages,
      currentPage: parsed.data.currentPage ?? 0,
      status:
        (parsed.data.currentPage ?? 0) >= parsed.data.totalPages
          ? "completed"
          : "currently_reading",
      completedAt:
        (parsed.data.currentPage ?? 0) >= parsed.data.totalPages
          ? todayDate()
          : null,
    })
    .returning();

  res.status(201).json(ListReadingBuddyBooksResponseItem.parse(mapBook(book)));
});

router.patch("/reading-buddy/books/:bookId", async (req, res): Promise<void> => {
  const params = UpdateReadingBuddyBookParams.safeParse(req.params);
  const body = UpdateReadingBuddyBookBody.safeParse(req.body);

  if (!params.success || !body.success) {
    res.status(400).json({
      error: params.success ? body.error.message : params.error.message,
    });
    return;
  }

  const updates = body.data;
  const status = updates.status;
  const [book] = await db
    .update(readingBuddyBooksTable)
    .set({
      ...updates,
      completedAt: status === "completed" ? todayDate() : undefined,
    })
    .where(eq(readingBuddyBooksTable.id, params.data.bookId))
    .returning();

  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }

  res.json(UpdateReadingBuddyBookResponse.parse(mapBook(book)));
});

router.post("/reading-buddy/sessions", async (req, res): Promise<void> => {
  const parsed = CreateReadingBuddySessionBody.safeParse(req.body);

  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid session body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [book] = await db
    .select()
    .from(readingBuddyBooksTable)
    .where(eq(readingBuddyBooksTable.id, parsed.data.bookId));

  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }

  const nextPage = Math.min(book.totalPages, book.currentPage + parsed.data.pagesRead);
  const nextStatus = nextPage >= book.totalPages ? "completed" : "currently_reading";

  const [session] = await db
    .insert(readingBuddySessionsTable)
    .values({
      bookId: parsed.data.bookId,
      pagesRead: parsed.data.pagesRead,
      minutesRead: parsed.data.minutesRead ?? null,
      loggedAt: parsed.data.loggedAt ? new Date(parsed.data.loggedAt) : new Date(),
    })
    .returning();

  await db
    .update(readingBuddyBooksTable)
    .set({
      currentPage: nextPage,
      status: nextStatus,
      completedAt: nextStatus === "completed" ? todayDate() : null,
    })
    .where(eq(readingBuddyBooksTable.id, book.id));

  res.status(201).json({
    id: session.id,
    bookId: session.bookId,
    bookTitle: book.title,
    pagesRead: session.pagesRead,
    minutesRead: session.minutesRead,
    loggedAt: toDateTime(session.loggedAt),
  });
});

router.get("/reading-buddy/goals", async (_req, res): Promise<void> => {
  await ensureSeedData();
  const books = await db
    .select()
    .from(readingBuddyBooksTable)
    .orderBy(desc(readingBuddyBooksTable.createdAt));

  const settings = await getSettings();
  const rows = books.map((book) => {
    const remaining = Math.max(book.totalPages - book.currentPage, 0);
    const days = Math.max(Math.ceil(remaining / settings.dailyGoalPages), 0);
    const estimate = new Date();
    estimate.setDate(estimate.getDate() + days);

    return {
      bookId: book.id,
      bookName: book.title,
      pagesCompleted: book.currentPage,
      totalPages: book.totalPages,
      estimatedDateCompleted: book.completedAt ?? estimate.toISOString().slice(0, 10),
    };
  });

  res.json(GetReadingBuddyGoalsResponse.parse(rows));
});

router.get("/reading-buddy/stats", async (_req, res): Promise<void> => {
  await ensureSeedData();
  const settings = await getSettings();
  const books = await db.select().from(readingBuddyBooksTable);
  const sessions = await db.select().from(readingBuddySessionsTable);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todaySessions = await db
    .select()
    .from(readingBuddySessionsTable)
    .where(gte(readingBuddySessionsTable.loggedAt, startOfToday));

  const uniqueDays = new Set(
    sessions.map((session) => toDateTime(session.loggedAt).slice(0, 10)),
  );
  let streak = 0;
  const cursor = new Date();

  while (uniqueDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const totalPagesRead = sessions.reduce(
    (sum, session) => sum + session.pagesRead,
    0,
  );

  res.json(
    GetReadingBuddyStatsResponse.parse({
      pagesToday: todaySessions.reduce(
        (sum, session) => sum + session.pagesRead,
        0,
      ),
      dailyGoalPages: settings.dailyGoalPages,
      activeBooks: books.filter((book) => book.status === "currently_reading").length,
      completedBooks: books.filter((book) => book.status === "completed").length,
      currentStreakDays: streak,
      totalPagesRead,
      averagePagesPerDay:
        uniqueDays.size === 0 ? 0 : Number((totalPagesRead / uniqueDays.size).toFixed(1)),
    }),
  );
});

router.get("/reading-buddy/activity", async (_req, res): Promise<void> => {
  await ensureSeedData();
  const rows = await db
    .select({
      id: readingBuddySessionsTable.id,
      bookTitle: readingBuddyBooksTable.title,
      pagesRead: readingBuddySessionsTable.pagesRead,
      loggedAt: readingBuddySessionsTable.loggedAt,
    })
    .from(readingBuddySessionsTable)
    .innerJoin(
      readingBuddyBooksTable,
      eq(readingBuddySessionsTable.bookId, readingBuddyBooksTable.id),
    )
    .orderBy(desc(readingBuddySessionsTable.loggedAt))
    .limit(6);

  res.json(
    GetReadingBuddyActivityResponse.parse(
      rows.map((row) => ({
        ...row,
        loggedAt: toDateTime(row.loggedAt),
      })),
    ),
  );
});

router.get("/reading-buddy/settings", async (_req, res): Promise<void> => {
  const settings = await getSettings();
  res.json(GetReadingBuddySettingsResponse.parse(mapSettings(settings)));
});

router.patch("/reading-buddy/settings", async (req, res): Promise<void> => {
  const parsed = UpdateReadingBuddySettingsBody.safeParse(req.body);

  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid settings body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await getSettings();
  const [settings] = await db
    .update(readingBuddySettingsTable)
    .set(parsed.data)
    .where(eq(readingBuddySettingsTable.id, existing.id))
    .returning();

  res.json(UpdateReadingBuddySettingsResponse.parse(mapSettings(settings)));
});

export default router;