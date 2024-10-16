import express from "express";
import exampleRouter from "./example";
import userRouter from "./user";
import policyRouter from "./policy";
import functionsRouter from "./functions";
import surecoinRouter from "./surecoin";

const router = express.Router();

router.use("/example", exampleRouter);
router.use("/user", userRouter);
router.use("/policy", policyRouter);
router.use("/functions", functionsRouter);
router.use("/surecoin", surecoinRouter);

// @ts-ignore
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Something went wrong on the server" });
});

router.get("/", (req, res) => {
  res.send(
    `Backend running successfully on ${
      req.protocol + "://" + req.get("host") + req.originalUrl
    }`,
  );
});

export default router;
