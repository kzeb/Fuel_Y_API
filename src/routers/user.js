const express = require("express");
const User = require("../models/User");
const Refueling = require("../models/Refueling");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/users", async (req, res) => {
  try {
    console.log(req.body);
    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    if (!user) {
      return res
        .status(401)
        .send({ error: "Login failed! Check authentication credentials" });
    }
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/refueling", auth, async (req, res) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const data = jwt.verify(token, process.env.JWT_KEY);
    const refueling = new Refueling({
      userId: data._id,
      amount: req.body.amount,
      distance: req.body.distance,
    });
    refueling.avg =
      (parseFloat(refueling.amount) / parseFloat(refueling.distance)) * 100;
    await refueling.save();
    res.status(201).send({ refueling });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/refueling", auth, async (req, res) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const data = jwt.verify(token, process.env.JWT_KEY);
    const refueling = await Refueling.find({ userId: data._id });
    res.status(200).send({ refueling });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/refueling/:id", auth, async (req, res) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const data = jwt.verify(token, process.env.JWT_KEY);
    const refueling = await Refueling.find({ _id: req.params.id });
    res.status(200).send({ refueling });
  } catch (error) {
    res.status(400).send({ error: "Object does not exist!" });
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

router.post("/users/me/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token;
    });
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/users/me/logoutall", auth, async (req, res) => {
  try {
    req.user.tokens.splice(0, req.user.tokens.length);
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
