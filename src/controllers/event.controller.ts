import { Request, Response } from "express";
import Event from "../models/event.model";
import moment from "moment";
import { AuthRequest } from "../middlewares/auth.middleware";
import mongoose from "mongoose";
import { createEventSchema } from "../validators/event.validator";
import { sendResponse } from "../app/utils/sendResponse";



export const addEvent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  console.log("🟡 Entered addEvent route");
  try {
    console.log("BODY: ", req.body);
    console.log("USER ID: ", req.userId);
    const { title, name, dateTime, location, description } = req.body;

    if (!title || !name || !dateTime || !location || !description) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const newEvent = await Event.create({
      title,
      name,
      dateTime,
      location,
      description,
      attendeeCount: 0,
      createdBy: req.userId,
    });

    // ✅ Use utility function here
    sendResponse(res, 201, "Event created successfully", newEvent);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    
    const { search, filter } = req.query;

    const query: any = {};

    // 🔍 Search by title
    if (search && typeof search === "string") {
      query.title = { $regex: search, $options: "i" };
    }

    // 🗓️ Filter by date range
    if (filter && typeof filter === "string") {
      const now = moment();
      let startDate;
      let endDate;

      switch (filter) {
        case "today":
          startDate = now.startOf("day").toDate();
          endDate = now.endOf("day").toDate();
          break;
        case "currentWeek":
          startDate = now.startOf("week").toDate();
          endDate = now.endOf("week").toDate();
          break;
        case "lastWeek":
          startDate = now.subtract(1, "weeks").startOf("week").toDate();
          endDate = moment(startDate).endOf("week").toDate();
          break;
        case "currentMonth":
          startDate = now.startOf("month").toDate();
          endDate = now.endOf("month").toDate();
          break;
        case "lastMonth":
          startDate = now.subtract(1, "months").startOf("month").toDate();
          endDate = now.endOf("month").toDate();
          break;
      }

      if (startDate && endDate) {
        query.dateTime = { $gte: startDate, $lte: endDate };
      }
    }

    // 🔢 Pagination and Sorting
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const allowedSortFields = ["title", "dateTime"];
    const sortBy = allowedSortFields.includes(req.query.sortBy as string)
      ? (req.query.sortBy as string)
      : "dateTime";

    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const events = await Event.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(query);

    res.status(200).json({
      total,
      page,
      limit,
      events,
    });
  } catch (error) {
    console.error("❌ getEvents error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


export const joinEvent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    console.log("🔐 USER ID:", req.userId);
    console.log("🆔 EVENT ID:", req.params.id);

    const event = await Event.findById(req.params.id);
    if (!event) {
      console.log("⚠️ Event not found");
      res.status(404).json({ message: "Event not found" });
      return;
    }

    if (event.joinedUsers.includes(new mongoose.Types.ObjectId(req.userId))) {
      console.log("⛔ Already joined");
      res.status(400).json({ message: "User already joined this event" });
      return;
    }

    event.attendeeCount += 1;
    event.joinedUsers.push(new mongoose.Types.ObjectId(req.userId));
    await event.save();

    console.log("✅ Join success");

    res.status(200).json({ message: "Successfully joined the event", event });
  } catch (error) {
    console.error("🔥 Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateEvent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const event = await Event.findById(id);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    if (event.createdBy !== userId) {
      res.status(403).json({ message: "Forbidden: You are not the creator" });
      return;
    }

    const { title, name, dateTime, location, description } = req.body;

    // Optional: Validate only if fields are present
    if (title !== undefined) event.title = title;
    if (name !== undefined) event.name = name;
    if (dateTime !== undefined) event.dateTime = dateTime;
    if (location !== undefined) event.location = location;
    if (description !== undefined) event.description = description;

    await event.save();

    res.status(200).json({ message: "Event updated", event });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteEvent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const event = await Event.findById(id);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    if (event.createdBy !== userId) {
      res.status(403).json({ message: "Forbidden: You are not the creator" });
      return;
    }

    await event.deleteOne();

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
