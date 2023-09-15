const { Machine, assign } = require('xstate');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const taskQueueFilePath = 'taskQueue.json';

// Function to save the task queue to the file
function saveTaskQueue(taskQueue) {
  fs.writeFileSync(taskQueueFilePath, JSON.stringify(taskQueue), 'utf8');
}

// Function to load the task queue from the file
function loadTaskQueue() {
  try {
    const data = fs.readFileSync(taskQueueFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist or there's an error, start with an empty queue
    return [];
  }
}

const taskQueueMachine = Machine(
  {
    id: 'taskQueue',
    initial: 'idle',
    context: {
      taskQueue: loadTaskQueue(), // Load the task queue from the file
    },
    states: {
      idle: {
        on: {
          ENQUEUE: {
            target: 'enqueueing',
            actions: ['enqueueTask'],
          },
          DEQUEUE: {
            target: 'dequeueing',
            cond: 'hasTasks',
          },
        },
      },
      enqueueing: {
        entry: 'generateTaskId',
        on: {
          DONE: 'idle',
        },
      },
      dequeueing: {
        on: {
          DONE: 'idle',
        },
      },
    },
  },
  {
    actions: {
      enqueueTask: assign({
        taskQueue: (context, event) => {
          const taskId = context.taskId;
          const task = { id: taskId, data: event.data };
          context.taskQueue.push(task);
          saveTaskQueue(context.taskQueue);
          return context.taskQueue;
        },
      }),
      generateTaskId: assign({
        taskId: () => uuidv4(),
      }),
    },
    guards: {
      hasTasks: (context) => context.taskQueue.length > 0,
    },
  }
);

module.exports = taskQueueMachine;
