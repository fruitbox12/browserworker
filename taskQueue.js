const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const taskQueueFilePath = 'taskQueue.json';

// Initialize an empty task queue or load an existing one
let taskQueue = [];

// Function to save the task queue to the file
function saveTaskQueue() {
  fs.writeFileSync(taskQueueFilePath, JSON.stringify(taskQueue), 'utf8');
}

// Function to load the task queue from the file
function loadTaskQueue() {
  try {
    const data = fs.readFileSync(taskQueueFilePath, 'utf8');
    taskQueue = JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist or there's an error, start with an empty queue
    taskQueue = [];
  }
}

// Enqueue a task
function enqueueTask(data) {
  const taskId = uuidv4(); // Generate a unique task ID
  const task = { id: taskId, data };
  taskQueue.push(task);
  saveTaskQueue();
  return taskId;
}

// Dequeue a task
function dequeueTask() {
  if (taskQueue.length === 0) {
    return null;
  }
  const task = taskQueue.shift();
  saveTaskQueue();
  return task.data;
}

// Load the task queue when the module is first imported
loadTaskQueue();

module.exports = {
  enqueueTask,
  dequeueTask,
};
