// Authentication System JavaScript

class AuthSystem {
  constructor() {
    this.currentForm = "signIn"
    this.otpTimer = null
    this.otpTimeLeft = 60
    this.isDarkMode = localStorage.getItem("theme") === "dark"

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.initializeTheme()
    this.setupOTPInputs()
    this.setupPasswordStrength()
    this.setupPhoneNumberFormatting()
  }

  setupEventListeners() {
    // Form switching
    document.getElementById("showSignUp").addEventListener("click", () => {
      this.switchForm("signUp")
    })

    document.getElementById("showSignIn").addEventListener("click", () => {
      this.switchForm("signIn")
    })

    document.getElementById("forgotPasswordBtn").addEventListener("click", () => {
      this.switchForm("forgotPassword")
    })

    document.getElementById("backToSignIn").addEventListener("click", () => {
      this.switchForm("signIn")
    })

    // Theme toggle
    document.getElementById("authThemeToggle").addEventListener("click", () => {
      this.toggleTheme()
    })

    // Password toggles
    document.getElementById("toggleSignInPassword").addEventListener("click", () => {
      this.togglePassword("signInPassword", "toggleSignInPassword")
    })

    document.getElementById("toggleSignUpPassword").addEventListener("click", () => {
      this.togglePassword("signUpPassword", "toggleSignUpPassword")
    })

    // Form submissions
    document.getElementById("emailSignInForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleSignIn()
    })

    document.getElementById("emailSignUpForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleSignUp()
    })

    document.getElementById("forgotPasswordEmailForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleForgotPassword()
    })

    document.getElementById("otpVerificationForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleOTPVerification()
    })

    // Social login buttons
    document.getElementById("googleSignIn").addEventListener("click", () => {
      this.handleSocialLogin("google")
    })

    document.getElementById("facebookSignIn").addEventListener("click", () => {
      this.handleSocialLogin("facebook")
    })

    document.getElementById("githubSignIn").addEventListener("click", () => {
      this.handleSocialLogin("github")
    })

    document.getElementById("googleSignUp").addEventListener("click", () => {
      this.handleSocialLogin("google")
    })

    document.getElementById("facebookSignUp").addEventListener("click", () => {
      this.handleSocialLogin("facebook")
    })

    document.getElementById("githubSignUp").addEventListener("click", () => {
      this.handleSocialLogin("github")
    })

    // OTP resend
    document.getElementById("resendOtp").addEventListener("click", () => {
      this.resendOTP()
    })

    // Go to dashboard
    document.getElementById("goToDashboard").addEventListener("click", () => {
      this.goToDashboard()
    })

    // Password strength monitoring
    document.getElementById("signUpPassword").addEventListener("input", (e) => {
      this.updatePasswordStrength(e.target.value)
    })

    // Real-time validation
    document.getElementById("confirmPassword").addEventListener("input", () => {
      this.validatePasswordMatch()
    })

    document.getElementById("signUpEmail").addEventListener("blur", () => {
      this.validateEmail(document.getElementById("signUpEmail").value)
    })
  }

  initializeTheme() {
    const savedTheme = localStorage.getItem("theme") || "light"
    document.documentElement.setAttribute("data-theme", savedTheme)
    this.isDarkMode = savedTheme === "dark"
    this.updateThemeIcon()
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode
    const theme = this.isDarkMode ? "dark" : "light"
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme)
    this.updateThemeIcon()
  }

  updateThemeIcon() {
    const icon = document.querySelector("#authThemeToggle i")
    icon.className = this.isDarkMode ? "fas fa-sun" : "fas fa-moon"
  }

  switchForm(formName) {
    // Hide all forms
    document.querySelectorAll(".auth-form").forEach((form) => {
      form.classList.remove("active")
    })

    // Show target form
    document.getElementById(`${formName}Form`).classList.add("active")
    this.currentForm = formName

    // Reset forms
    this.resetForms()
  }

  resetForms() {
    document.querySelectorAll("form").forEach((form) => {
      form.reset()
    })

    // Reset password strength
    this.updatePasswordStrength("")

    // Reset OTP inputs
    document.querySelectorAll(".otp-input").forEach((input) => {
      input.value = ""
      input.classList.remove("filled")
    })
  }

  togglePassword(inputId, buttonId) {
    const input = document.getElementById(inputId)
    const button = document.getElementById(buttonId)
    const icon = button.querySelector("i")

    if (input.type === "password") {
      input.type = "text"
      icon.className = "fas fa-eye-slash"
    } else {
      input.type = "password"
      icon.className = "fas fa-eye"
    }
  }

  setupOTPInputs() {
    const otpInputs = document.querySelectorAll(".otp-input")

    otpInputs.forEach((input, index) => {
      input.addEventListener("input", (e) => {
        const value = e.target.value

        if (value.length === 1) {
          input.classList.add("filled")
          // Move to next input
          if (index < otpInputs.length - 1) {
            otpInputs[index + 1].focus()
          }
        } else {
          input.classList.remove("filled")
        }
      })

      input.addEventListener("keydown", (e) => {
        // Handle backspace
        if (e.key === "Backspace" && !input.value && index > 0) {
          otpInputs[index - 1].focus()
        }
      })

      input.addEventListener("paste", (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData("text")
        const digits = pastedData.replace(/\D/g, "").slice(0, 6)

        digits.split("").forEach((digit, i) => {
          if (otpInputs[i]) {
            otpInputs[i].value = digit
            otpInputs[i].classList.add("filled")
          }
        })
      })
    })
  }

  setupPasswordStrength() {
    this.updatePasswordStrength("")
  }

  updatePasswordStrength(password) {
    const strengthBar = document.querySelector(".strength-fill")
    const strengthText = document.querySelector(".strength-text")

    if (!strengthBar || !strengthText) return

    let strength = 0
    let strengthLabel = "Very Weak"
    let color = "#ef4444"

    if (password.length >= 8) strength += 20
    if (/[a-z]/.test(password)) strength += 20
    if (/[A-Z]/.test(password)) strength += 20
    if (/[0-9]/.test(password)) strength += 20
    if (/[^A-Za-z0-9]/.test(password)) strength += 20

    if (strength >= 80) {
      strengthLabel = "Very Strong"
      color = "#10b981"
    } else if (strength >= 60) {
      strengthLabel = "Strong"
      color = "#059669"
    } else if (strength >= 40) {
      strengthLabel = "Medium"
      color = "#f59e0b"
    } else if (strength >= 20) {
      strengthLabel = "Weak"
      color = "#f97316"
    }

    strengthBar.style.width = `${strength}%`
    strengthBar.style.background = color
    strengthText.textContent = password ? strengthLabel : "Password strength"
    strengthText.style.color = password ? color : "var(--neutral-500)"
  }

  setupPhoneNumberFormatting() {
    const phoneInput = document.getElementById("phoneNumber")
    if (phoneInput) {
      phoneInput.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "")
        if (value.length >= 1) {
          value = `+1 (${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`
        }
        e.target.value = value
      })
    }
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const input = document.getElementById("signUpEmail")

    if (email && !emailRegex.test(email)) {
      input.style.borderColor = "var(--danger-500)"
      this.showToast("Please enter a valid email address", "error")
      return false
    } else if (email) {
      input.style.borderColor = "var(--success-500)"
    }
    return true
  }

  validatePasswordMatch() {
    const password = document.getElementById("signUpPassword").value
    const confirmPassword = document.getElementById("confirmPassword").value
    const confirmInput = document.getElementById("confirmPassword")

    if (confirmPassword && password !== confirmPassword) {
      confirmInput.style.borderColor = "var(--danger-500)"
      return false
    } else if (confirmPassword) {
      confirmInput.style.borderColor = "var(--success-500)"
    }
    return true
  }

  async handleSignIn() {
    const email = document.getElementById("signInEmail").value
    const password = document.getElementById("signInPassword").value
    const rememberMe = document.getElementById("rememberMe").checked

    if (!email || !password) {
      this.showToast("Please fill in all fields", "error")
      return
    }

    this.setButtonLoading("emailSignInForm", true)

    try {
      // Simulate API call
      await this.simulateAPICall()

      // Store user session
      const userData = {
        email,
        name: "John Doe",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
        loginTime: new Date().toISOString(),
        rememberMe,
      }

      localStorage.setItem("user", JSON.stringify(userData))

      this.showToast("Sign in successful!", "success")

      // Redirect to dashboard
      setTimeout(() => {
        this.goToDashboard()
      }, 1500)
    } catch (error) {
      this.showToast("Invalid email or password", "error")
    } finally {
      this.setButtonLoading("emailSignInForm", false)
    }
  }

  async handleSignUp() {
    const firstName = document.getElementById("firstName").value
    const lastName = document.getElementById("lastName").value
    const email = document.getElementById("signUpEmail").value
    const phone = document.getElementById("phoneNumber").value
    const password = document.getElementById("signUpPassword").value
    const confirmPassword = document.getElementById("confirmPassword").value
    const agreeTerms = document.getElementById("agreeTerms").checked

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      this.showToast("Please fill in all required fields", "error")
      return
    }

    if (!this.validateEmail(email)) return
    if (!this.validatePasswordMatch()) {
      this.showToast("Passwords do not match", "error")
      return
    }

    if (!agreeTerms) {
      this.showToast("Please agree to the terms and conditions", "error")
      return
    }

    this.setButtonLoading("emailSignUpForm", true)

    try {
      // Simulate API call
      await this.simulateAPICall()

      // Store user data temporarily
      const userData = {
        firstName,
        lastName,
        email,
        phone,
        verified: false,
      }

      sessionStorage.setItem("pendingUser", JSON.stringify(userData))

      this.showToast("Account created! Please verify your email.", "success")

      // Switch to OTP form
      setTimeout(() => {
        this.switchForm("otp")
        this.startOTPTimer()
      }, 1500)
    } catch (error) {
      this.showToast("Registration failed. Please try again.", "error")
    } finally {
      this.setButtonLoading("emailSignUpForm", false)
    }
  }

  async handleForgotPassword() {
    const email = document.getElementById("resetEmail").value

    if (!email) {
      this.showToast("Please enter your email address", "error")
      return
    }

    if (!this.validateEmail(email)) return

    this.setButtonLoading("forgotPasswordEmailForm", true)

    try {
      // Simulate API call
      await this.simulateAPICall()

      this.showToast("Password reset link sent to your email!", "success")

      setTimeout(() => {
        this.switchForm("signIn")
      }, 2000)
    } catch (error) {
      this.showToast("Failed to send reset link. Please try again.", "error")
    } finally {
      this.setButtonLoading("forgotPasswordEmailForm", false)
    }
  }

  async handleOTPVerification() {
    const otpInputs = document.querySelectorAll(".otp-input")
    const otp = Array.from(otpInputs)
      .map((input) => input.value)
      .join("")

    if (otp.length !== 6) {
      this.showToast("Please enter the complete 6-digit code", "error")
      return
    }

    this.setButtonLoading("otpVerificationForm", true)

    try {
      // Simulate API call
      await this.simulateAPICall()

      // Get pending user data
      const pendingUser = JSON.parse(sessionStorage.getItem("pendingUser"))

      // Create verified user
      const userData = {
        ...pendingUser,
        verified: true,
        name: `${pendingUser.firstName} ${pendingUser.lastName}`,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
        loginTime: new Date().toISOString(),
      }

      localStorage.setItem("user", JSON.stringify(userData))
      sessionStorage.removeItem("pendingUser")

      this.showToast("Account verified successfully!", "success")

      // Switch to success form
      setTimeout(() => {
        this.switchForm("success")
      }, 1500)
    } catch (error) {
      this.showToast("Invalid verification code", "error")
    } finally {
      this.setButtonLoading("otpVerificationForm", false)
    }
  }

  async handleSocialLogin(provider) {
    this.showToast(`Connecting to ${provider}...`, "info")

    try {
      // Simulate OAuth flow
      await this.simulateAPICall(2000)

      const userData = {
        email: `user@${provider}.com`,
        name: "John Doe",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
        provider,
        loginTime: new Date().toISOString(),
      }

      localStorage.setItem("user", JSON.stringify(userData))

      this.showToast(`Successfully signed in with ${provider}!`, "success")

      setTimeout(() => {
        this.goToDashboard()
      }, 1500)
    } catch (error) {
      this.showToast(`Failed to sign in with ${provider}`, "error")
    }
  }

  startOTPTimer() {
    this.otpTimeLeft = 60
    const timerElement = document.getElementById("otpTimer")
    const resendButton = document.getElementById("resendOtp")

    resendButton.disabled = true
    resendButton.style.opacity = "0.5"

    this.otpTimer = setInterval(() => {
      this.otpTimeLeft--
      timerElement.textContent = this.otpTimeLeft

      if (this.otpTimeLeft <= 0) {
        clearInterval(this.otpTimer)
        resendButton.disabled = false
        resendButton.style.opacity = "1"
        document.querySelector(".timer-text").style.display = "none"
      }
    }, 1000)
  }

  async resendOTP() {
    try {
      await this.simulateAPICall()
      this.showToast("New verification code sent!", "success")
      this.startOTPTimer()
    } catch (error) {
      this.showToast("Failed to resend code", "error")
    }
  }

  goToDashboard() {
    // Check if user is logged in
    const user = localStorage.getItem("user")
    if (user) {
      window.location.href = "index.html"
    } else {
      this.showToast("Please sign in first", "error")
    }
  }

  setButtonLoading(formId, loading) {
    const form = document.getElementById(formId)
    const button = form.querySelector('button[type="submit"]')

    if (loading) {
      button.classList.add("loading")
      button.disabled = true
    } else {
      button.classList.remove("loading")
      button.disabled = false
    }
  }

  async simulateAPICall(delay = 1500) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          resolve()
        } else {
          reject(new Error("API Error"))
        }
      }, delay)
    })
  }

  showToast(message, type = "info", title = "") {
    const container = document.getElementById("toastContainer")
    const toast = document.createElement("div")
    toast.className = `toast ${type}`

    const icons = {
      success: "fas fa-check",
      error: "fas fa-times",
      warning: "fas fa-exclamation",
      info: "fas fa-info",
    }

    const titles = {
      success: title || "Success",
      error: title || "Error",
      warning: title || "Warning",
      info: title || "Info",
    }

    toast.innerHTML = `
      <div class="toast-icon">
        <i class="${icons[type]}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${titles[type]}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">
        <i class="fas fa-times"></i>
      </button>
    `

    // Add close functionality
    toast.querySelector(".toast-close").addEventListener("click", () => {
      this.removeToast(toast)
    })

    container.appendChild(toast)

    // Show toast
    setTimeout(() => {
      toast.classList.add("show")
    }, 100)

    // Auto remove after 5 seconds
    setTimeout(() => {
      this.removeToast(toast)
    }, 5000)
  }

  removeToast(toast) {
    toast.classList.remove("show")
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }
}

// Backend API Simulation
class AuthAPI {
  static async signIn(credentials) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock user database
    const users = [
      {
        email: "john@example.com",
        password: "password123",
        name: "John Doe",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      },
    ]

    const user = users.find((u) => u.email === credentials.email && u.password === credentials.password)

    if (user) {
      return {
        success: true,
        user: {
          id: 1,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          token: "mock-jwt-token",
        },
      }
    } else {
      throw new Error("Invalid credentials")
    }
  }

  static async signUp(userData) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Simulate email already exists check
    if (userData.email === "existing@example.com") {
      throw new Error("Email already exists")
    }

    return {
      success: true,
      message: "Account created successfully",
      requiresVerification: true,
    }
  }

  static async verifyOTP(otp) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock OTP verification (accept any 6-digit code)
    if (otp.length === 6) {
      return {
        success: true,
        message: "Account verified successfully",
      }
    } else {
      throw new Error("Invalid OTP")
    }
  }

  static async resetPassword(email) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      message: "Password reset link sent",
    }
  }

  static async socialLogin(provider) {
    // Simulate OAuth flow
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock social login success
    const socialUsers = {
      google: {
        email: "user@gmail.com",
        name: "John Doe",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      },
      facebook: {
        email: "user@facebook.com",
        name: "John Doe",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      },
      github: {
        email: "user@github.com",
        name: "John Doe",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      },
    }

    const user = socialUsers[provider]
    if (user) {
      return {
        success: true,
        user: {
          id: Math.floor(Math.random() * 1000),
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          provider,
          token: "mock-social-jwt-token",
        },
      }
    } else {
      throw new Error("Social login failed")
    }
  }
}

// Session Management
class SessionManager {
  static setUser(userData) {
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("authToken", userData.token)
  }

  static getUser() {
    const userData = localStorage.getItem("user")
    return userData ? JSON.parse(userData) : null
  }

  static isAuthenticated() {
    const token = localStorage.getItem("authToken")
    const user = this.getUser()
    return !!(token && user)
  }

  static logout() {
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")
    sessionStorage.clear()
    window.location.href = "auth.html"
  }

  static checkAuthOnLoad() {
    // Check if we're on auth page and user is already logged in
    if (window.location.pathname.includes("auth.html") && this.isAuthenticated()) {
      window.location.href = "index.html"
    }

    // Check if we're on dashboard and user is not logged in
    if (window.location.pathname.includes("index.html") && !this.isAuthenticated()) {
      window.location.href = "auth.html"
    }
  }
}

// Initialize the authentication system
document.addEventListener("DOMContentLoaded", () => {
  // Check authentication status
  SessionManager.checkAuthOnLoad()

  // Initialize auth system if on auth page
  if (window.location.pathname.includes("auth.html")) {
    new AuthSystem()
  }
})

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = { AuthSystem, AuthAPI, SessionManager }
}
