// Server.js

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const { TaskQueue } = require('./taskQueue'); // Implement task queue handling

// Store connected browser clients
const clients = new Set();

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('WebSocket connection established');

  // Add the connected client to the set
  clients.add(ws);

  // Handle client disconnection
  ws.on('close', () => {
    console.log('WebSocket connection closed');
    // Remove the disconnected client from the set
    clients.delete(ws);
  });
});

// Serve the index.html file when accessing the root URL
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
  
    // Read the HTML file and send it as a response
    fs.readFile(indexPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading HTML file:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.header('Content-Type', 'text/html');
        res.send(data);
      }
    });
  });

// Webhook endpoint to receive tasks
app.post('/webhook', (req, res) => {
  const taskData = req.body; // Extract task data from the request

  // Enqueue the task in the task queue
  TaskQueue.enqueue(taskData);

  // Handle task distribution logic (assign tasks to available browsers)
  distributeTasksToBrowsers();

  res.status(200).send('Task received and enqueued.');
});

// Function to distribute tasks to available browsers
function distributeTasksToBrowsers() {
  // Fetch a task from the task queue
  const task = TaskQueue.dequeue();

  if (!task) {
    console.log('No tasks to distribute.');
    return;
  }

  // Find an available browser (WebSocket connection) from the pool
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      // Assign the task to the browser
      client.send(task);

      // Break after assigning the task to one browser
      break;
    }
  }
}

// Start the Express server
const PORT = process.env.PORT || 3007;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
