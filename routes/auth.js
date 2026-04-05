var express = require("express");
var router = express.Router();
const authHandler = require("../utils/authHandler");
const authController = require("../controllers/authController");

// Register
router.post("/register", async function (req, res, next) {
  try {
    const result = await authController.Register(
      req.body.email,
      req.body.fullName,
      req.body.phone,
      req.body.password,
      req.body.role
    );

    res.cookie(authHandler.AUTH_COOKIE_NAME, result.token, {
      maxAge: 7 * 24 * 3600 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.status(201).send({ user: result.user });
  } catch (error) {
    next(error);
  }
});

// Login
router.post("/login", async function (req, res, next) {
  try {
    const result = await authController.Login(req.body.email, req.body.password);

    res.cookie(authHandler.AUTH_COOKIE_NAME, result.token, {
      maxAge: 7 * 24 * 3600 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.send({ user: result.user });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post("/logout", function (req, res, next) {
  try {
    res.clearCookie(authHandler.AUTH_COOKIE_NAME);
    res.send({ message: "Logged out." });
  } catch (error) {
    next(error);
  }
});

// Get Profile
router.get("/profile", authHandler.CheckLogin, async function (req, res, next) {
  try {
    const user = await authController.GetProfile(req.authUser.userId);
    res.send({ user });
  } catch (error) {
    next(error);
  }
});

// Update Profile
router.put("/profile", authHandler.CheckLogin, async function (req, res, next) {
  try {
    const user = await authController.UpdateProfile(
      req.authUser.userId,
      req.body.fullName,
      req.body.phone
    );
    res.send({ user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
