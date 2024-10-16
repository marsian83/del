import express from "express";
import executor from "../executor";

const router = express.Router();

router.get("/result/:key", (req, res) => {
  const r = executor.outputStore[req.params.key];
  res.status(200).send({ output: r.output, completed: r.completed });
  return;
});

export default router;
