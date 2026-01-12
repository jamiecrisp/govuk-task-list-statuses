//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// ============================================================================
// TASK CONFIGURATION
// ============================================================================
// To add a new task:
// 1. Create your question pages and check answers page
// 2. Update the task-list.html to include the new task
// 3. Add a new entry to this TASKS array below
// ============================================================================

const TASKS = [
  {
    key: 'task-1',
    secondQuestionRoute: '/task-1-question-2',
    checkAnswersRoute: '/check-answers-task-1'
  },
  {
    key: 'task-2',
    secondQuestionRoute: '/task-2-question-2',
    checkAnswersRoute: '/check-answers-task-2'
  },
  {
    key: 'task-3',
    secondQuestionRoute: '/task-3-question-2',
    checkAnswersRoute: '/check-answers-task-3'
  },
  {
    key: 'task-4',
    secondQuestionRoute: '/task-4-question-2',
    checkAnswersRoute: '/check-answers-task-4',
    dependsOn: 'task-3'
  },
  {
    key: 'task-5',
    secondQuestionRoute: '/task-5-question-2',
    checkAnswersRoute: '/check-answers-task-5'
  },
  {
    key: 'task-6',
    secondQuestionRoute: '/task-6-question-2',
    checkAnswersRoute: '/check-answers-task-6'
  },
  {
    key: 'task-7',
    secondQuestionRoute: '/task-7-question-2',
    checkAnswersRoute: '/check-answers-task-7',
    dependsOn: 'task-5'
  },
  {
    key: 'task-8',
    secondQuestionRoute: '/task-8-question-2',
    checkAnswersRoute: '/check-answers-task-8',
    dependsOn: ['task-6', 'task-7']
  },
  {
    key: 'task-9',
    checkAnswersRoute: '/check-answers-task-9'
    // Note: No secondQuestionRoute - this is a single question task
  }
]

// ============================================================================
// TASK MANAGEMENT FUNCTIONS
// ============================================================================

// Function to get task status
function getTaskStatus(req, taskKey) {
  const session = req.session.data || {}

  // Find the task configuration
  const task = TASKS.find(t => t.key === taskKey)

  // Check if task has dependencies that aren't met yet
  if (task && task.dependsOn) {
    // Handle both single dependency (string) and multiple dependencies (array)
    const dependencies = Array.isArray(task.dependsOn) ? task.dependsOn : [task.dependsOn]
    const allDependenciesMet = dependencies.every(dep =>
      session.completedTasks && session.completedTasks.includes(dep)
    )
    if (!allDependenciesMet) {
      return 'cannot-start-yet'
    }
  }

  // Check if task is completed
  if (session.completedTasks && session.completedTasks.includes(taskKey)) {
    return 'completed'
  }

  // Check if task is in progress (has any data saved)
  if (session[taskKey + '_started']) {
    return 'in-progress'
  }

  return 'not-started'
}

// Function to mark task as started
function markTaskAsStarted(req, taskKey) {
  req.session.data = req.session.data || {}
  req.session.data[taskKey + '_started'] = true
}

// Function to mark task as completed
function markTaskAsCompleted(req, taskKey) {
  req.session.data = req.session.data || {}
  req.session.data.completedTasks = req.session.data.completedTasks || []

  if (!req.session.data.completedTasks.includes(taskKey)) {
    req.session.data.completedTasks.push(taskKey)
  }
}

// Function to mark task as in progress (removes from completed, keeps as started)
function markTaskAsInProgress(req, taskKey) {
  req.session.data = req.session.data || {}
  req.session.data.completedTasks = req.session.data.completedTasks || []

  // Remove from completed tasks if present
  const index = req.session.data.completedTasks.indexOf(taskKey)
  if (index > -1) {
    req.session.data.completedTasks.splice(index, 1)
  }

  // Ensure task is marked as started
  req.session.data[taskKey + '_started'] = true
}

// Function to get all task statuses
function getAllTaskStatuses(req) {
  const statuses = {}
  TASKS.forEach(task => {
    statuses[task.key] = getTaskStatus(req, task.key)
  })
  return statuses
}

// Function to count completed tasks
function countCompletedTasks(req) {
  const statuses = getAllTaskStatuses(req)
  return Object.values(statuses).filter(status => status === 'completed').length
}

// ============================================================================
// ROUTES
// ============================================================================

// Task list page - inject task statuses
router.get('/task-list', function (req, res) {
  const taskStatuses = getAllTaskStatuses(req)
  const completedCount = countCompletedTasks(req)

  res.render('task-list', {
    taskStatuses: taskStatuses,
    completedCount: completedCount,
    totalTasks: TASKS.length
  })
})

// Automatically generate routes for all tasks
TASKS.forEach(task => {
  if (task.secondQuestionRoute) {
    // Task has 2 questions
    // POST route from first question to second question
    // If task was completed, mark as in-progress (answer changed)
    // Otherwise just mark as started
    router.post(task.secondQuestionRoute, function (req, res) {
      const currentStatus = getTaskStatus(req, task.key)
      if (currentStatus === 'completed') {
        markTaskAsInProgress(req, task.key)
      } else {
        markTaskAsStarted(req, task.key)
      }
      res.render(task.secondQuestionRoute.substring(1)) // Remove leading slash
    })
  }

  // POST route for check answers - marks task as completed
  router.post(task.checkAnswersRoute, function (req, res) {
    markTaskAsCompleted(req, task.key)
    res.redirect('/task-list')
  })
})

// ============================================================================
// Add your custom routes below
// ============================================================================
