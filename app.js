import express from "express";
import cors from "cors"; // Import CORS middleware
import dotenv from "dotenv";
import "./config/db.js";
import productRouter from "./routes/productRoutes.js";
import userRouter from "./routes/userRoutes.js";
import mediaRouter from "./routes/mediaRoutes.js";
import SharedProductCollectionRouter from "./routes/sharedcollectionRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";

dotenv.config();

const app = express();

// CORS Middleware Configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://192.168.2.3:5173",
      "http://ceat-miles-admin.bespokesol.com",
      "http://ceat-miles.bespokesol.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/uploads", express.static("uploads"));

// User routes
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/media", mediaRouter);
app.use("/api/sharedcollection", SharedProductCollectionRouter);
app.use("/api/category", categoryRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
