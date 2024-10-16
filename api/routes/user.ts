import express from "express";
import User from "../models/User";
import { generateRandomHex } from "../utils";
import { verifyMessage } from "viem";

const router = express.Router();

const userNonceStore: Record<string, string> = {};
router.post("/request-nonce", async (req, res) => {
  userNonceStore[req.body.address] = generateRandomHex(32);
  res.status(200).json({ nonce: userNonceStore[req.body.address] });
});

router.get("/check/:address", async (req, res) => {
  const user = await User.exists({ address: req.params.address });
  res.status(200).send({
    exists: user ? true : false,
  });
});

router.get("/get/:address", async (req, res) => {
  try {
    const user = await User.findOne({ address: req.params.address });
    res.status(200).send({ user });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// router.get("/holders/:address", async (req, res) => {
//   try {
//     const policyAddress = req.params.address;

//     if (!policyAddress) {
//       res.status(400).json({ message: "Policy address is required" });
//       return;
//     }

//     const holders = await User.find({
//       policiesOwned: { $elemMatch: { address: policyAddress } },
//     });

//     res.status(200).json({ holders });
//     return;
//   } catch (error: any) {
//     console.error(error);
//     if (!error.message) {
//       res.status(500).json({ message: "Internal Server Error" });
//     } else {
//       res.status(500).json({ message: error.message });
//     }
//     return;
//   }
// });

router.post("/create", async (req, res) => {
  try {
    const { address } = req.body;
    const user = await User.create({ address });
    await user.save();
    res.status(200).json({ user: user });
    return;
  } catch (error: any) {
    console.error(error);
    if (error.message) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
    return;
  }
});

router.post("/become-marketer", async (req, res) => {
  try {
    const { data, sign, address } = req.body;
    const { name, imageUrl } = data;

    const verified = await verifyMessage({
      address: address,
      message: `${JSON.stringify(data)}${userNonceStore[address]}`,
      signature: sign,
    });

    if (!verified) {
      res.status(401).json({ message: "Signature verification failed" });
      return;
    }

    const existingUser = await User.findOne({ address });

    if (!existingUser) {
      const newUser = await User.create({
        address,
        marketer: {
          name,
          image: imageUrl,
        },
      });
      await newUser.save();

      res.status(200).json({
        message: "Marketer created successfully",
        marketerID: newUser._id,
      });
      return;
    } else if (!existingUser.marketer) {
      existingUser.marketer = {
        name,
        image: imageUrl,
      };
      await existingUser.save();

      res.status(200).json({
        message: "Marketer updated successfully",
        marketerID: existingUser._id,
      });
      return;
    } else {
      res.status(400).json({ message: "User is already a marketer" });
      return;
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
    return;
  }
});

export default router;
