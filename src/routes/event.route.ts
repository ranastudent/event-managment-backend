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
import { authorizeRole } from "../middlewares/authorizeRole";
import { checkVerifiedUser } from "../middlewares/checkVerifiedUser";

const router = express.Router();

router.post(
  "/add",
  authenticateJWT,
  authorizeRole("admin"),
  checkVerifiedUser,
  validateRequest(createEventSchema),
  addEvent,
  
);
router.get("/", authenticateJWT,checkVerifiedUser, validateQuery(getEventsQuerySchema), getEvents);
router.post("/join/:id", authenticateJWT,checkVerifiedUser, validateObjectIdParam, joinEvent);
router.patch(
  "/:id",
  authenticateJWT, checkVerifiedUser, authorizeRole("admin"),
  validateObjectIdParam,
  validateRequest(updateEventSchema),
  updateEvent,
);
router.delete("/:id", authenticateJWT, checkVerifiedUser, authorizeRole("admin"), validateObjectIdParam, deleteEvent,);

export default router;
