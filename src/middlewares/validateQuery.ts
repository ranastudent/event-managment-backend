import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { formatZodError } from "../app/utils/formatValidationErrors";

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.query);

    if (!parsed.success) {
      const formatted = formatZodError(parsed.error);
      res.status(400).json({ message: "Query validation failed", errors: formatted });
      return;
    }

    // ✅ If valid, override req.query with parsed values
    req.query = parsed.data;
    next();
  };
};
