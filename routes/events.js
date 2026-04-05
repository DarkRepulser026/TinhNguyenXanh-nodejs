var express = require("express");
var router = express.Router();
const authHandler = require("../utils/authHandler");
const eventController = require("../controllers/eventController");

// Get all events
router.get("/events", async function (req, res, next) {
  try {
    const result = await eventController.GetAllEvents(
      req.query.keyword,
      req.query.location,
      req.query.category,
      req.query.page,
      req.query.pageSize
    );
    res.send(result);
  } catch (error) {
    next(error);
  }
});

// Get event by id
router.get("/events/:id", async function (req, res, next) {
  try {
    const event = await eventController.GetEventById(req.params.id);
    res.send(event);
  } catch (error) {
    next(error);
  }
});

// Register event
router.post("/events/:id/register", authHandler.CheckLogin, async function (req, res, next) {
  try {
    const result = await eventController.RegisterEvent(
      req.params.id,
      req.authUser.userId,
      req.body.fullName,
      req.body.phone,
      req.body.reason
    );
    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
});

// Toggle favorite
router.post("/events/:id/favorite", authHandler.CheckLogin, async function (req, res, next) {
  try {
    const result = await eventController.ToggleFavorite(req.params.id, req.authUser.userId);
    if (result.status === "added") {
      res.status(201).send(result);
    } else {
      res.send(result);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
