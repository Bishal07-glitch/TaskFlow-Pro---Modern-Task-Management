// Modern Professional Task Management Dashboard

class TaskManager {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem("tasks")) || []
    this.currentSection = "dashboard"
    this.currentMonth = new Date().getMonth()
    this.currentYear = new Date().getFullYear()
    this.editingTask = null
    this.isDarkMode = localStorage.getItem("theme") === "dark"

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.initializeTheme()
    this.renderDashboard()
    this.renderTasks()
    this.renderCalendar()
    this.renderAnalytics()
    this.updateStats()
    this.addSampleData()
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll(".nav-item a").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const section = e.target.closest("a").dataset.section
        this.switchSection(section)
      })
    })

    // Theme toggle
    document.getElementById("themeToggle").addEventListener("click", () => {
      this.toggleTheme()
    })

    // Sidebar toggle for mobile
    document.querySelector(".sidebar-toggle").addEventListener("click", () => {
      document.querySelector(".sidebar").classList.toggle("active")
    })

    // Task modal events
    document.getElementById("addTaskBtn").addEventListener("click", () => {
      this.openTaskModal()
    })

    document.getElementById("addTaskBtn2").addEventListener("click", () => {
      this.openTaskModal()
    })

    document.getElementById("closeModal").addEventListener("click", () => {
      this.closeTaskModal()
    })

    document.getElementById("cancelBtn").addEventListener("click", () => {
      this.closeTaskModal()
    })

    // Task form
    document.getElementById("taskForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.saveTask()
    })

    // Search functionality
    document.getElementById("searchInput").addEventListener("input", (e) => {
      this.searchTasks(e.target.value)
    })

    // Calendar navigation
    document.getElementById("prevMonth").addEventListener("click", () => {
      this.navigateMonth(-1)
    })

    document.getElementById("nextMonth").addEventListener("click", () => {
      this.navigateMonth(1)
    })

    // Close modal when clicking outside
    document.getElementById("taskModal").addEventListener("click", (e) => {
      if (e.target.id === "taskModal") {
        this.closeTaskModal()
      }
    })

    // Add task buttons in columns
    document.querySelectorAll(".add-task-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.openTaskModal()
      })
    })

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "k") {
          e.preventDefault()
          document.getElementById("searchInput").focus()
        }
      }
      if (e.key === "Escape") {
        this.closeTaskModal()
      }
    })

    // User menu dropdown
    document.getElementById("userMenuBtn").addEventListener("click", (e) => {
      e.stopPropagation()
      const dropdown = document.getElementById("userMenuDropdown")
      dropdown.classList.toggle("show")
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      const dropdown = document.getElementById("userMenuDropdown")
      const userMenu = document.querySelector(".user-menu")

      if (!userMenu.contains(e.target)) {
        dropdown.classList.remove("show")
      }
    })

    // Sidebar overlay for mobile
    const sidebarOverlay = document.createElement("div")
    sidebarOverlay.className = "sidebar-overlay"
    document.body.appendChild(sidebarOverlay)

    // Enhanced sidebar toggle for mobile
    document.querySelector(".sidebar-toggle").addEventListener("click", () => {
      const sidebar = document.querySelector(".sidebar")
      const overlay = document.querySelector(".sidebar-overlay")

      sidebar.classList.toggle("active")
      overlay.classList.toggle("active")
    })

    // Close sidebar when clicking overlay
    sidebarOverlay.addEventListener("click", () => {
      document.querySelector(".sidebar").classList.remove("active")
      sidebarOverlay.classList.remove("active")
    })

    // Close sidebar on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelector(".sidebar").classList.remove("active")
        document.querySelector(".sidebar-overlay").classList.remove("active")
        document.getElementById("userMenuDropdown").classList.remove("show")
      }
    })

    // Handle window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        document.querySelector(".sidebar").classList.remove("active")
        document.querySelector(".sidebar-overlay").classList.remove("active")
      }
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
    const icon = document.querySelector("#themeToggle i")
    icon.className = this.isDarkMode ? "fas fa-sun" : "fas fa-moon"
  }

  switchSection(section) {
    // Update navigation
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active")
    })
    document.querySelector(`[data-section="${section}"]`).closest(".nav-item").classList.add("active")

    // Update content
    document.querySelectorAll(".content-section").forEach((sec) => {
      sec.classList.remove("active")
    })
    document.getElementById(section).classList.add("active")

    // Update breadcrumb
    const pageNames = {
      dashboard: "Dashboard",
      tasks: "Tasks",
      calendar: "Calendar",
      analytics: "Analytics",
      projects: "Projects",
      team: "Team",
    }
    document.getElementById("currentPage").textContent = pageNames[section] || section

    this.currentSection = section

    // Render section-specific content
    if (section === "calendar") {
      this.renderCalendar()
    } else if (section === "analytics") {
      this.renderAnalytics()
    }
  }

  openTaskModal(task = null) {
    this.editingTask = task
    const modal = document.getElementById("taskModal")
    const form = document.getElementById("taskForm")

    if (task) {
      document.getElementById("modalTitle").textContent = "Edit Task"
      document.getElementById("taskTitle").value = task.title
      document.getElementById("taskDescription").value = task.description
      document.getElementById("taskPriority").value = task.priority
      document.getElementById("taskDueDate").value = task.dueDate
    } else {
      document.getElementById("modalTitle").textContent = "Create New Task"
      form.reset()
    }

    modal.classList.add("active")
    document.getElementById("taskTitle").focus()
  }

  closeTaskModal() {
    document.getElementById("taskModal").classList.remove("active")
    document.getElementById("taskForm").reset()
    this.editingTask = null
  }

  saveTask() {
    const title = document.getElementById("taskTitle").value.trim()
    const description = document.getElementById("taskDescription").value.trim()
    const priority = document.getElementById("taskPriority").value
    const dueDate = document.getElementById("taskDueDate").value

    if (!title) {
      this.showNotification("Please enter a task title", "error")
      return
    }

    const task = {
      id: this.editingTask ? this.editingTask.id : Date.now(),
      title,
      description,
      priority,
      dueDate,
      status: this.editingTask ? this.editingTask.status : "todo",
      createdAt: this.editingTask ? this.editingTask.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignee: "John Doe",
    }

    if (this.editingTask) {
      const index = this.tasks.findIndex((t) => t.id === this.editingTask.id)
      this.tasks[index] = task
      this.showNotification("Task updated successfully", "success")
    } else {
      this.tasks.push(task)
      this.showNotification("Task created successfully", "success")
    }

    this.saveTasks()
    this.renderAll()
    this.closeTaskModal()
  }

  deleteTask(taskId) {
    if (confirm("Are you sure you want to delete this task?")) {
      this.tasks = this.tasks.filter((task) => task.id !== taskId)
      this.saveTasks()
      this.renderAll()
      this.showNotification("Task deleted successfully", "success")
    }
  }

  updateTaskStatus(taskId, newStatus) {
    const task = this.tasks.find((t) => t.id === taskId)
    if (task) {
      task.status = newStatus
      task.updatedAt = new Date().toISOString()
      this.saveTasks()
      this.renderAll()
    }
  }

  saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks))
  }

  renderAll() {
    this.renderDashboard()
    this.renderTasks()
    this.updateStats()
  }

  renderTasks() {
    const todoList = document.getElementById("todoList")
    const inprogressList = document.getElementById("inprogressList")
    const completedList = document.getElementById("completedList")

    // Clear lists
    ;[todoList, inprogressList, completedList].forEach((list) => {
      list.innerHTML = ""
    })

    // Group tasks by status
    const tasksByStatus = {
      todo: this.tasks.filter((task) => task.status === "todo"),
      inprogress: this.tasks.filter((task) => task.status === "inprogress"),
      completed: this.tasks.filter((task) => task.status === "completed"),
    }

    // Update counts
    Object.keys(tasksByStatus).forEach((status) => {
      const count = document.getElementById(`${status}Count`)
      if (count) {
        count.textContent = tasksByStatus[status].length
      }
    })

    // Render tasks
    Object.keys(tasksByStatus).forEach((status) => {
      const list = document.getElementById(`${status}List`)
      tasksByStatus[status].forEach((task) => {
        const taskElement = this.createTaskElement(task)
        list.appendChild(taskElement)
      })
    })
  }

  createTaskElement(task) {
    const taskDiv = document.createElement("div")
    taskDiv.className = "task-item"
    taskDiv.draggable = true
    taskDiv.dataset.taskId = task.id

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed"
    const dueDateText = task.dueDate ? this.formatDate(new Date(task.dueDate)) : "No due date"

    taskDiv.innerHTML = `
            <div class="task-header">
                <div>
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                </div>
            </div>
            ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ""}
            <div class="task-footer">
                <span class="task-due-date ${isOverdue ? "text-danger" : ""}">${dueDateText}</span>
                <div class="task-actions">
                    <button onclick="taskManager.openTaskModal(taskManager.tasks.find(t => t.id === ${task.id}))" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="taskManager.deleteTask(${task.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `

    // Add drag event listeners
    taskDiv.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", task.id)
      taskDiv.classList.add("dragging")
    })

    taskDiv.addEventListener("dragend", () => {
      taskDiv.classList.remove("dragging")
    })

    return taskDiv
  }

  renderDashboard() {
    this.renderRecentActivity()
    this.renderProgressChart()
  }

  renderRecentActivity() {
    const activityList = document.getElementById("recentTasksList")
    if (!activityList) return

    const recentTasks = this.tasks.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5)

    activityList.innerHTML = recentTasks
      .map(
        (task) => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${task.status === "completed" ? "check" : "clock"}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${this.escapeHtml(task.title)}</div>
                    <div class="activity-time">${this.getRelativeTime(task.updatedAt)}</div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  renderProgressChart() {
    const canvas = document.getElementById("progressChart")
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const completed = this.tasks.filter((t) => t.status === "completed").length
    const total = this.tasks.length
    const progress = total > 0 ? (completed / total) * 100 : 0

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set up chart dimensions
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 20

    // Draw background circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = "#e8ecf0"
    ctx.lineWidth = 8
    ctx.stroke()

    // Draw progress arc
    if (progress > 0) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (2 * Math.PI * progress) / 100)
      ctx.strokeStyle = "#5b82ff"
      ctx.lineWidth = 8
      ctx.lineCap = "round"
      ctx.stroke()
    }

    // Draw center text
    ctx.fillStyle = "#1a202c"
    ctx.font = "bold 24px Inter"
    ctx.textAlign = "center"
    ctx.fillText(`${Math.round(progress)}%`, centerX, centerY - 5)

    ctx.font = "14px Inter"
    ctx.fillStyle = "#6b7684"
    ctx.fillText("Complete", centerX, centerY + 20)
  }

  updateStats() {
    const total = this.tasks.length
    const completed = this.tasks.filter((t) => t.status === "completed").length
    const pending = this.tasks.filter((t) => t.status !== "completed").length
    const overdue = this.tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed",
    ).length

    const elements = {
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: pending,
      overdueTasks: overdue,
    }

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id)
      if (element) {
        this.animateNumber(element, Number.parseInt(element.textContent) || 0, value)
      }
    })
  }

  animateNumber(element, start, end) {
    const duration = 1000
    const startTime = performance.now()

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      const current = Math.round(start + (end - start) * this.easeOutQuart(progress))
      element.textContent = current

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4)
  }

  navigateMonth(direction) {
    this.currentMonth += direction
    if (this.currentMonth < 0) {
      this.currentMonth = 11
      this.currentYear--
    } else if (this.currentMonth > 11) {
      this.currentMonth = 0
      this.currentYear++
    }
    this.renderCalendar()
  }

  renderCalendar() {
    const calendarGrid = document.getElementById("calendarGrid")
    const currentMonthElement = document.getElementById("currentMonth")

    if (!calendarGrid || !currentMonthElement) return

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    currentMonthElement.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`

    // Clear calendar
    calendarGrid.innerHTML = ""

    // Add day headers
    const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    dayHeaders.forEach((day) => {
      const dayHeader = document.createElement("div")
      dayHeader.style.cssText = `
                padding: 1rem;
                text-align: center;
                font-weight: 600;
                color: var(--neutral-600);
                background: var(--neutral-100);
                border-right: 1px solid var(--neutral-200);
                border-bottom: 1px solid var(--neutral-200);
                font-size: 0.875rem;
            `
      dayHeader.textContent = day
      calendarGrid.appendChild(dayHeader)
    })

    // Calculate calendar days
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay()
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate()
    const today = new Date()

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement("div")
      emptyDay.className = "calendar-day other-month"
      calendarGrid.appendChild(emptyDay)
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement("div")
      dayElement.className = "calendar-day"

      const currentDate = new Date(this.currentYear, this.currentMonth, day)
      const isToday = currentDate.toDateString() === today.toDateString()

      if (isToday) {
        dayElement.classList.add("today")
      }

      // Get tasks for this day
      const dayTasks = this.tasks.filter((task) => {
        if (!task.dueDate) return false
        const taskDate = new Date(task.dueDate)
        return taskDate.toDateString() === currentDate.toDateString()
      })

      dayElement.innerHTML = `
                <div class="calendar-day-number">${day}</div>
                ${dayTasks
                  .slice(0, 3)
                  .map(
                    (task) => `
                    <div class="calendar-task priority-${task.priority}" style="
                        font-size: 0.75rem;
                        padding: 0.25rem 0.5rem;
                        border-radius: 4px;
                        margin-bottom: 0.25rem;
                        background: var(--${task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "success"}-100);
                        color: var(--${task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "success"}-700);
                        cursor: pointer;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    " onclick="taskManager.openTaskModal(taskManager.tasks.find(t => t.id === ${task.id}))" title="${this.escapeHtml(task.title)}">
                        ${this.escapeHtml(task.title)}
                    </div>
                `,
                  )
                  .join("")}
                ${dayTasks.length > 3 ? `<div style="font-size: 0.75rem; color: var(--neutral-500);">+${dayTasks.length - 3} more</div>` : ""}
            `

      calendarGrid.appendChild(dayElement)
    }
  }

  renderAnalytics() {
    this.renderCompletionChart()
    this.renderPriorityChart()
  }

  renderCompletionChart() {
    const canvas = document.getElementById("completionChart")
    if (!canvas) return

    const ctx = canvas.getContext("2d")

    // Get completion data for last 7 days
    const days = []
    const completionData = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date.toLocaleDateString("en-US", { weekday: "short" }))

      const dayTasks = this.tasks.filter((task) => {
        if (task.status !== "completed") return false
        const taskDate = new Date(task.updatedAt)
        return taskDate.toDateString() === date.toDateString()
      })

      completionData.push(dayTasks.length)
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw chart
    const maxValue = Math.max(...completionData, 1)
    const barWidth = (canvas.width - 80) / days.length
    const maxBarHeight = canvas.height - 80

    days.forEach((day, index) => {
      const barHeight = (completionData[index] / maxValue) * maxBarHeight
      const x = 40 + index * barWidth
      const y = canvas.height - 40 - barHeight

      // Draw bar
      ctx.fillStyle = "#5b82ff"
      ctx.fillRect(x + 10, y, barWidth - 20, barHeight)

      // Draw day label
      ctx.fillStyle = "#6b7684"
      ctx.font = "12px Inter"
      ctx.textAlign = "center"
      ctx.fillText(day, x + barWidth / 2, canvas.height - 15)

      // Draw value
      if (completionData[index] > 0) {
        ctx.fillStyle = "#1a202c"
        ctx.fillText(completionData[index], x + barWidth / 2, y - 5)
      }
    })
  }

  renderPriorityChart() {
    const canvas = document.getElementById("priorityChart")
    if (!canvas) return

    const ctx = canvas.getContext("2d")

    const priorities = {
      high: this.tasks.filter((t) => t.priority === "high").length,
      medium: this.tasks.filter((t) => t.priority === "medium").length,
      low: this.tasks.filter((t) => t.priority === "low").length,
    }

    const total = Object.values(priorities).reduce((sum, count) => sum + count, 0)

    if (total === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#6b7684"
      ctx.font = "16px Inter"
      ctx.textAlign = "center"
      ctx.fillText("No tasks to display", canvas.width / 2, canvas.height / 2)
      return
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw pie chart
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 60

    const colors = {
      high: "#ef4444",
      medium: "#f59e0b",
      low: "#10b981",
    }

    let currentAngle = -Math.PI / 2

    Object.entries(priorities).forEach(([priority, count]) => {
      if (count === 0) return

      const sliceAngle = (count / total) * 2 * Math.PI

      // Draw slice
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = colors[priority]
      ctx.fill()

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2
      const labelX = centerX + Math.cos(labelAngle) * (radius + 30)
      const labelY = centerY + Math.sin(labelAngle) * (radius + 30)

      ctx.fillStyle = "#1a202c"
      ctx.font = "12px Inter"
      ctx.textAlign = "center"
      ctx.fillText(`${priority.toUpperCase()}`, labelX, labelY)
      ctx.fillText(`${count}`, labelX, labelY + 15)

      currentAngle += sliceAngle
    })
  }

  searchTasks(query) {
    const taskItems = document.querySelectorAll(".task-item")

    taskItems.forEach((item) => {
      const title = item.querySelector(".task-title")?.textContent.toLowerCase() || ""
      const description = item.querySelector(".task-description")?.textContent.toLowerCase() || ""

      if (title.includes(query.toLowerCase()) || description.includes(query.toLowerCase())) {
        item.style.display = "block"
      } else {
        item.style.display = query ? "none" : "block"
      }
    })
  }

  addSampleData() {
    if (this.tasks.length === 0) {
      const sampleTasks = [
        {
          id: 1,
          title: "Design new dashboard interface",
          description: "Create a modern and intuitive dashboard design for the task management application",
          priority: "high",
          status: "inprogress",
          dueDate: "2024-02-15",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          assignee: "John Doe",
        },
        {
          id: 2,
          title: "Implement user authentication",
          description: "Add secure login and registration functionality with JWT tokens",
          priority: "high",
          status: "todo",
          dueDate: "2024-02-20",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 7200000).toISOString(),
          assignee: "John Doe",
        },
        {
          id: 3,
          title: "Write API documentation",
          description: "Document all REST API endpoints with examples and response formats",
          priority: "medium",
          status: "completed",
          dueDate: "2024-02-10",
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          assignee: "John Doe",
        },
        {
          id: 4,
          title: "Set up CI/CD pipeline",
          description: "Configure automated testing and deployment pipeline using GitHub Actions",
          priority: "medium",
          status: "todo",
          dueDate: "2024-02-25",
          createdAt: new Date(Date.now() - 345600000).toISOString(),
          updatedAt: new Date(Date.now() - 10800000).toISOString(),
          assignee: "John Doe",
        },
        {
          id: 5,
          title: "Optimize database queries",
          description: "Review and optimize slow database queries to improve application performance",
          priority: "low",
          status: "inprogress",
          dueDate: "2024-03-01",
          createdAt: new Date(Date.now() - 432000000).toISOString(),
          updatedAt: new Date(Date.now() - 14400000).toISOString(),
          assignee: "John Doe",
        },
      ]

      this.tasks = sampleTasks
      this.saveTasks()
      this.renderAll()
    }
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div")
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            border-radius: 12px;
            color: white;
            font-weight: 500;
            z-index: 3000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        `

    // Set background color based on type
    const colors = {
      success: "#10b981",
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#5b82ff",
    }
    notification.style.background = colors[type] || colors.info
    notification.textContent = message

    document.body.appendChild(notification)

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)"
    }, 100)

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = "translateX(100%)"
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  formatDate(date) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  getRelativeTime(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }
}

// Drag and Drop functionality
function allowDrop(ev) {
  ev.preventDefault()
  ev.currentTarget.closest(".kanban-column").classList.add("drag-over")
}

function drop(ev) {
  ev.preventDefault()
  const column = ev.currentTarget.closest(".kanban-column")
  column.classList.remove("drag-over")

  const taskId = Number.parseInt(ev.dataTransfer.getData("text/plain"))
  const newStatus = column.dataset.status

  taskManager.updateTaskStatus(taskId, newStatus)
}

// Remove drag-over class when dragging leaves
document.addEventListener("dragleave", (e) => {
  if (e.target.classList.contains("kanban-column")) {
    e.target.classList.remove("drag-over")
  }
})

// Initialize the application
const taskManager = new TaskManager()

// Add some additional interactivity
document.addEventListener("DOMContentLoaded", () => {
  // Add smooth scrolling for better UX
  document.documentElement.style.scrollBehavior = "smooth"

  // Add loading states for better perceived performance
  const buttons = document.querySelectorAll(".btn")
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      if (!this.classList.contains("loading")) {
        const originalText = this.innerHTML
        this.classList.add("loading")
        this.innerHTML = '<div class="loading"></div>'

        setTimeout(() => {
          this.classList.remove("loading")
          this.innerHTML = originalText
        }, 500)
      }
    })
  })
})
