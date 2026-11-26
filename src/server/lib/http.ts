import { ZodError } from "zod";
import { AppError } from "./errors";

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

/** Wraps a route handler so thrown AppErrors / ZodErrors become JSON responses. */
export function route<C>(handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof AppError) {
        return Response.json({ error: { code: err.code, message: err.message, details: err.details } }, { status: err.status });
      }
      if (err instanceof ZodError) {
        return Response.json({ error: { code: "VALIDATION", message: "Invalid input", details: err.issues } }, { status: 422 });
      }
      console.error(err);
      return Response.json({ error: { code: "INTERNAL", message: "Something went wrong" } }, { status: 500 });
    }
  };
}
