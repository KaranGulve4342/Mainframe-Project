const express = require("express")
const router = express.Router()
const { executeQuery, generateUniqueId } = require("../db")

// Create a new user
router.post("/", async (req, res) => {
  try {
    const { name, email, phone } = req.body

    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Name, email, and phone are required" })
    }

    // Check if user with this email already exists
    const existingUsers = await executeQuery("SELECT * FROM USERS WHERE EMAIL = ?", [email])

    if (existingUsers.length > 0) {
      // Return existing user
      return res.status(200).json({
        $id: existingUsers[0].USERID,
        name: existingUsers[0].NAME,
        email: existingUsers[0].EMAIL,
        phone: existingUsers[0].PHONE,
        $createdAt: existingUsers[0].CREATED_AT,
      })
    }

    // Create new user
    const userId = generateUniqueId()
    await executeQuery("INSERT INTO USERS (USERID, NAME, EMAIL, PHONE) VALUES (?, ?, ?, ?)", [
      userId,
      name,
      email,
      phone,
    ])

    const newUser = {
      $id: userId,
      name,
      email,
      phone,
      $createdAt: new Date(),
    }

    res.status(201).json(newUser)
  } catch (error) {
    console.error("Error creating user:", error)
    res.status(500).json({ error: "Failed to create user" })
  }
})

// Get user by ID
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    const users = await executeQuery("SELECT * FROM USERS WHERE USERID = ?", [userId])

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" })
    }

    const user = users[0]

    res.status(200).json({
      $id: user.USERID,
      name: user.NAME,
      email: user.EMAIL,
      phone: user.PHONE,
      $createdAt: user.CREATED_AT,
    })
  } catch (error) {
    console.error("Error getting user:", error)
    res.status(500).json({ error: "Failed to get user" })
  }
})

module.exports = router
