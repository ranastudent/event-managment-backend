import express from "express";
import {
  addEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  joinEvent,
} from "../controllers/event.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validateRequest";
import { createEventSchema, getEventsQuerySchema } from "../validators/event.validator";
import { updateEventSchema } from "../validators/event.validator";
import { validateObjectIdParam } from "../middlewares/paramValidator";
import { validateQuery } from "../middlewares/validateQuery";

const router = express.Router();

router.post(
  "/add",
  authenticateJWT,
  validateRequest(createEventSchema),
  addEvent
);
router.get("/", authenticateJWT, validateQuery(getEventsQuerySchema), getEvents);
router.post("/join/:id", authenticateJWT, validateObjectIdParam, joinEvent);
router.patch(
  "/:id",
  authenticateJWT,
  validateObjectIdParam,
  validateRequest(updateEventSchema),
  updateEvent
);
router.delete("/:id", authenticateJWT, validateObjectIdParam, deleteEvent);

export default router;
