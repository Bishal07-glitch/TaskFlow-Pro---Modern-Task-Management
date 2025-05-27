// Backend API Endpoints (Node.js/Express simulation)

const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const rateLimit = require("express-rate-limit")
const cors = require("cors")

const app = express()

// Middleware
app.use(express.json())
app.use(cors())

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
})

// Mock database
const users = []
const otpStore = new Map()
const resetTokens = new Map()

// JWT secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Email transporter setup
const transporter = nodemailer.createTransporter({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Helper functions
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()
const generateResetToken = () => require("crypto").randomBytes(32).toString("hex")

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    })
    return true
  } catch (error) {
    console.error("Email sending failed:", error)
    return false
  }
}

// Routes

// Sign Up
app.post("/api/auth/signup", authLimiter, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      })
    }

    // Check if user already exists
    const existingUser = users.find((user) => user.email === email)
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate OTP
    const otp = generateOTP()
    otpStore.set(email, {
      otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      userData: { firstName, lastName, email, phone, password: hashedPassword },
    })

    // Send OTP email
    const emailSent = await sendEmail(
      email,
      "Verify Your TaskFlow Account",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5b82ff;">Welcome to TaskFlow!</h2>
          <p>Thank you for signing up. Please verify your email address using the code below:</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1a202c; font-size: 32px; letter-spacing: 4px; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `,
    )

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email",
      })
    }

    res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
      requiresVerification: true,
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Verify OTP
app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body

    const otpData = otpStore.get(email)
    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired",
      })
    }

    if (Date.now() > otpData.expires) {
      otpStore.delete(email)
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      })
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      })
    }

    // Create user
    const user = {
      id: users.length + 1,
      ...otpData.userData,
      verified: true,
      createdAt: new Date().toISOString(),
    }

    users.push(user)
    otpStore.delete(email)

    // Generate JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" })

    res.status(200).json({
      success: true,
      message: "Account verified successfully",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        verified: user.verified,
      },
      token,
    })
  } catch (error) {
    console.error("OTP verification error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Sign In
app.post("/api/auth/signin", authLimiter, async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body

    // Find user
    const user = users.find((u) => u.email === email)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Check if account is verified
    if (!user.verified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email address first",
      })
    }

    // Generate JWT
    const tokenExpiry = rememberMe ? "30d" : "7d"
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: tokenExpiry })

    res.status(200).json({
      success: true,
      message: "Sign in successful",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        verified: user.verified,
      },
      token,
    })
  } catch (error) {
    console.error("Signin error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Forgot Password
app.post("/api/auth/forgot-password", authLimiter, async (req, res) => {
  try {
    const { email } = req.body

    const user = users.find((u) => u.email === email)
    if (!user) {
      // Don't reveal if email exists or not
      return res.status(200).json({
        success: true,
        message: "If an account with this email exists, a reset link has been sent",
      })
    }

    // Generate reset token
    const resetToken = generateResetToken()
    resetTokens.set(email, {
      token: resetToken,
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    })

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`
    const emailSent = await sendEmail(
      email,
      "Reset Your TaskFlow Password",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5b82ff;">Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #5b82ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    )

    res.status(200).json({
      success: true,
      message: "If an account with this email exists, a reset link has been sent",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Reset Password
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body

    const resetData = resetTokens.get(email)
    if (!resetData || resetData.token !== token) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      })
    }

    if (Date.now() > resetData.expires) {
      resetTokens.delete(email)
      return res.status(400).json({
        success: false,
        message: "Reset token has expired",
      })
    }

    // Find and update user
    const userIndex = users.findIndex((u) => u.email === email)
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    users[userIndex].password = hashedPassword

    // Clean up reset token
    resetTokens.delete(email)

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Resend OTP
app.post("/api/auth/resend-otp", authLimiter, async (req, res) => {
  try {
    const { email } = req.body

    const otpData = otpStore.get(email)
    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "No pending verification found for this email",
      })
    }

    // Generate new OTP
    const otp = generateOTP()
    otpStore.set(email, {
      ...otpData,
      otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    })

    // Send new OTP email
    const emailSent = await sendEmail(
      email,
      "New Verification Code - TaskFlow",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5b82ff;">New Verification Code</h2>
          <p>Here's your new verification code:</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1a202c; font-size: 32px; letter-spacing: 4px; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    )

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email",
      })
    }

    res.status(200).json({
      success: true,
      message: "New verification code sent",
    })
  } catch (error) {
    console.error("Resend OTP error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token",
      })
    }
    req.user = user
    next()
  })
}

// Protected route example
app.get("/api/user/profile", authenticateToken, (req, res) => {
  const user = users.find((u) => u.id === req.user.userId)
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    })
  }

  res.status(200).json({
    success: true,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      verified: user.verified,
      createdAt: user.createdAt,
    },
  })
})

// Logout (optional - mainly handled on frontend)
app.post("/api/auth/logout", authenticateToken, (req, res) => {
  // In a real app, you might want to blacklist the token
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error)
  res.status(500).json({
    success: false,
    message: "Internal server error",
  })
})

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`)
})

module.exports = app
