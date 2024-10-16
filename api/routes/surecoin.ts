import express from "express";
import Policy from "../models/Policy";
import surecoin from "../contracts/surecoin";
const router = express.Router();

router.get("/pricefeed", async (req, res) => {
  const minP = await Policy.find({}, { blockNumber: 1 })
    .sort({ salary: 1 })
    .limit(1);

  const events = await surecoin.getEvents.PriceChange({
    fromBlock: BigInt(minP[0]?.blockNumber),
  });

  res.send({ feed: events.map((e) => ({ ...e.args })) });
});

export default router;
