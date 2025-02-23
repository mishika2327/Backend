const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const TASKS_FILE = path.join(__dirname, 'tasks.json');

// Read tasks from tasks.json
const readTasks = () => {
    try {
        const data = fs.readFileSync(TASKS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

// Write tasks to tasks.json
const writeTasks = (tasks) => {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
};

// GET /tasks → Show all tasks
app.get('/tasks', (req, res) => {
    const tasks = readTasks();
    res.render('tasks', { tasks });
});

// GET /task?id=1 → Fetch a specific task
app.get('/task', (req, res) => {
    const tasks = readTasks();
    
    console.log("Available tasks:", tasks);
    console.log("Requested ID:", req.query.id);

    if (!req.query.id) {
        return res.status(400).send('Task ID is required');
    }

    const task = tasks.find(t => t.id === parseInt(req.query.id));

    if (!task) {
        return res.status(404).send('Task not found');
    }

    res.render('task', { task });
});

// POST /add-task → Add a new task
app.post('/add-task', (req, res) => {
    const tasks = readTasks();
    
    // Validate input
    if (!req.body.title || req.body.title.trim() === "") {
        return res.status(400).send("Task title cannot be empty");
    }

    const newTask = {
        id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
        title: req.body.title.trim(),
    };

    tasks.push(newTask);
    writeTasks(tasks);
    
    res.redirect('/tasks');  // Redirect to task list after adding
});


// GET /add-task → Render task addition form
app.get('/addTask', (req, res) => {
    res.render('addTask');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
