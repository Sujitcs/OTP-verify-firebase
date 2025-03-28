const express = require("express");
const protectedRoute = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

protectedRoute.get("/dashboard", authMiddleware, (req, res) => {
    const { phone, email } = req.user;
    const userIdentifier = phone || email;
    res.json({ Hello: `${userIdentifier}` });
});


module.exports = protectedRoute;
console.log('dashboard router is ready')
