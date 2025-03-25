const express = require("express");
const protectedRoute = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

protectedRoute.get("/dashboard", authMiddleware, (req, res) => {
    res.json({ Hello: `Welcome to Dashboard, User: ${req.user.phone}` });
});

module.exports = protectedRoute;
console.log('dashboard router is ready')
