const express = require('express');
const app = express();
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

app.use(express.json());

let tasks = [];

// Helper function to find a task by its ID
function findTask(taskId) {
    return tasks.find(task => task.id === taskId);
}

// POST /tasks - Create a new task
app.post('/tasks', (req, res) => {
    const { title, description, category } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const newTask = {
        id: uuidv4(),
        title,
        description: description || '',
        category: category || 'Uncategorized',
        created_at: moment().toISOString(),
        updated_at: moment().toISOString(),
        deleted: false
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
});

// GET /tasks - List all active tasks
app.get('/tasks', (req, res) => {
    const activeTasks = tasks.filter(task => !task.deleted);
    res.json(activeTasks);
});

// GET /tasks/:id - Get a specific task by ID
app.get('/tasks/:id', (req, res) => {
    const task = findTask(req.params.id);
    if (!task || task.deleted) {
        return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
});

// PUT /tasks/:id - Update a specific task by ID
app.put('/tasks/:id', (req, res) => {
    const task = findTask(req.params.id);
    if (!task || task.deleted) {
        return res.status(404).json({ error: 'Task not found' });
    }

    const { title, description, category } = req.body;
    task.title = title || task.title;
    task.description = description || task.description;
    task.category = category || task.category;
    task.updated_at = moment().toISOString();

    res.json(task);
});

// DELETE /tasks/:id - Mark a task as deleted (soft delete)
app.delete('/tasks/:id', (req, res) => {
    const task = findTask(req.params.id);
    if (!task || task.deleted) {
        return res.status(404).json({ error: 'Task not found' });
    }

    task.deleted = true;
    task.updated_at = moment().toISOString();
    res.json({ message: 'Task marked as deleted' });
});

// POST /tasks/:id/restore - Restore a deleted task
app.post('/tasks/:id/restore', (req, res) => {
    const task = findTask(req.params.id);
    if (!task || !task.deleted) {
        return res.status(404).json({ error: 'Task not found or not deleted' });
    }

    task.deleted = false;
    task.updated_at = moment().toISOString();
    res.json({ message: 'Task restored successfully' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});