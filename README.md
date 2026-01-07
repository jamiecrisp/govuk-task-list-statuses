# GOV.UK Prototype Kit - Task List Pattern

This prototype demonstrates a reusable task list pattern with automatic status tracking for multi-step journeys.

## Features

- **Automatic Status Tracking**: Tasks automatically update to show "Not started", "In progress", or "Completed"
- **Simple Configuration**: Add new tasks by editing a single array
- **Progress Counter**: Shows "You have completed X of Y sections"
- **Session-Based**: Progress is tracked in the user's session

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the prototype:
   ```bash
   npm start
   ```

3. Visit http://localhost:3000 and click "Apply for a business license"

## How It Works

### Task Status Flow

1. **Not started** (grey tag) - Default state for all tasks
2. **In progress** (blue tag) - Set when user visits the first question page
3. **Completed** (green tag) - Set when user submits the check answers page

### File Structure

```
app/
├── routes.js              # Task configuration and automatic route generation
├── views/
│   ├── task-list.html     # Main task list page
│   ├── [task-name].html   # First question page for each task
│   ├── [other-questions].html  # Subsequent question pages
│   └── check-answers-[task-name].html  # Check answers page for each task
```

## Adding a New Task

Follow these 3 simple steps:

### Step 1: Create Your Pages

Create your question pages and check answers page in `app/views/`:

- `my-new-task.html` - First question page
- `my-new-task-question-2.html` - Additional questions (optional)
- `check-answers-my-new-task.html` - Check answers page

### Step 2: Update the Task List UI

Edit `app/views/task-list.html` and add your task to the appropriate section:

```html
<li class="govuk-task-list__item govuk-task-list__item--with-link">
  <div class="govuk-task-list__name-and-hint">
    <a class="govuk-link govuk-task-list__link" href="/my-new-task" aria-describedby="my-new-task-status">
      My New Task Name
    </a>
  </div>
  <div class="govuk-task-list__status" id="my-new-task-status">
    {{ taskStatus(taskStatuses['my-new-task']) }}
  </div>
</li>
```

### Step 3: Add to TASKS Array

Edit `app/routes.js` and add your task to the `TASKS` array:

```javascript
const TASKS = [
  // ... existing tasks
  {
    key: 'my-new-task',
    firstQuestionRoute: '/my-new-task',
    checkAnswersRoute: '/check-answers-my-new-task'
  }
]
```

That's it! The routes and status tracking are automatically generated.

## Task Configuration Reference

Each task in the `TASKS` array requires:

| Property | Description | Example |
|----------|-------------|---------|
| `key` | Unique identifier (used for status tracking) | `'my-new-task'` |
| `firstQuestionRoute` | URL of the first question page | `'/my-new-task'` |
| `checkAnswersRoute` | URL of the check answers page | `'/check-answers-my-new-task'` |

## Question Page Flow

Each task follows this pattern:

```
First Question → Question 2 → ... → Check Answers → Task List
```

- Link subsequent questions together using standard form actions
- All intermediate questions should use regular POST routes (add custom routes if needed)
- Only the **first question** and **check answers** routes need to be in the TASKS array
- The check answers page should POST back to complete the task

## Example Task Journey

```
/task-1             (GET - marks as started)
    ↓
/task-1-question-2  (POST from task-1)
    ↓
/check-answers-task-1  (POST from task-1-question-2)
    ↓
/task-list          (POST completes task - redirects here)
```

## Customization

### Changing Status Labels

Edit the `taskStatus` macro in `app/views/task-list.html`:

```html
{% macro taskStatus(status) %}
  {% if status == 'completed' %}
    <strong class="govuk-tag">Completed</strong>
  {% elif status == 'in-progress' %}
    <strong class="govuk-tag govuk-tag--blue">In progress</strong>
  {% else %}
    <strong class="govuk-tag govuk-tag--grey">Not started</strong>
  {% endif %}
{% endmacro %}
```

### Adding Custom Routes

Add custom routes below the auto-generated ones in `app/routes.js`:

```javascript
// Add your custom routes below
// ============================================================================

router.post('/my-custom-route', function (req, res) {
  // Your custom logic
  res.redirect('/next-page')
})
```

## Resetting Progress

To clear session data and reset all task statuses:

1. Click "Clear data" in the footer
2. Or delete cookies for localhost:3000

## Structure Overview

### Main Components

- **TASKS Array** (`routes.js:18-64`) - Central configuration for all tasks
- **Status Functions** (`routes.js:70-116`) - Core logic for tracking status
- **Auto-generated Routes** (`routes.js:135-147`) - Automatically creates GET/POST routes
- **Task List Template** (`views/task-list.html`) - Displays all tasks with statuses

## Tips

- Keep task keys consistent (use lowercase with hyphens)
- Name check answers pages as `check-answers-[task-key].html`
- Use the same task key in the TASKS array and task-list.html
- The first question route must match the href in task-list.html

## Troubleshooting

**Task status not updating?**
- Check the task key matches in TASKS array and task-list.html
- Verify routes match the file names (without .html)
- Check browser console for errors

**Routes not working?**
- Restart the prototype (`npm start`)
- Check file names match route names exactly
- Ensure routes.js has no syntax errors

## Resources

- [GOV.UK Design System - Task List Pattern](https://design-system.service.gov.uk/patterns/task-list-pages/)
- [GOV.UK Prototype Kit Documentation](https://prototype-kit.service.gov.uk/)
