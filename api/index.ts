import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import indexRouter from "./routes/_index";
import executor from "./executor";
import morgan from "morgan";

const PORT = Number(process.env.PORT) || 9000;

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded());
app.use(morgan("tiny"));

app.use("/", indexRouter);

setInterval(() => {
  try {
    executor.safeCheckAndExecute();
  } catch (err) {
    console.error(err);
  }
}, 1000);

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("Connection URI missing");
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`Server listening on PORT: ${PORT}`);
  });
}

main();
