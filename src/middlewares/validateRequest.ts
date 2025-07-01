import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { formatZodError } from "../app/utils/formatValidationErrors";

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body); // ✅ Declare the variable properly

    if (!parsed.success) {
      const formatted = formatZodError(parsed.error);
      res.status(400).json({ message: "Validation failed", errors: formatted });
      return;
    }

    next();
  };
};
