import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: [process.env.CORS_ORIGIN, "http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

//routes
app.use("/api", routes);

//error handling middleware
app.use(errorMiddleware);
export default app;
