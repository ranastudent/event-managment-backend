import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  name: z.string().min(1, "Name is required"),
  dateTime: z.string().min(1, "Date/time is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(1, "Description is required"),
});

export const getEventsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional().transform(Number),
  limit: z.string().regex(/^\d+$/).optional().transform(Number),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
  filter: z.enum(["today", "currentWeek", "lastWeek", "currentMonth", "lastMonth"]).optional(),
});

export const updateEventSchema = z.object({
  title: z.string().optional(),
  name: z.string().optional(),
  dateTime: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});


