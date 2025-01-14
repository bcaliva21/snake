// server.js
import express from 'express';
import fs from 'fs';
import path, {
    dirname
} from 'path';
import {
    fileURLToPath
} from 'url';
import {
    WebSocketServer
} from 'ws';
import https from 'https';
import pool from './db.js'; // Import the database connection

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json()); // To parse JSON bodies

// Use your local cert and key
const privateKey = fs.readFileSync(path.join(__dirname, 'certs', 'private.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'certs', 'certificate.crt'), 'utf8');

// Create HTTPS service
const credentials = {
    key: privateKey,
    cert: certificate
};
const server = https.createServer(credentials, app);
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Server is healthy'
    });
});

// Endpoint to submit a new score
app.post('/api/scores', async (req, res) => {
    const {
        username,
        score
    } = req.body;
    try {
        const [result] = await pool.execute(
            'INSERT INTO scores (username, score) VALUES (?, ?)',
            [username, score]
        );
        res.status(201).json({
            id: result.insertId,
            username,
            score
        });
    } catch (error) {
        console.error('Error inserting score:', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

// Endpoint to get high scores
app.get('/api/scores/high', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT username, score FROM scores ORDER BY score DESC LIMIT 10'
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching high scores:', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
});

const serverApp = server.listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`);
});

// Create a WebSocket server
const wss = new WebSocketServer({
    server: serverApp
});

let playerSocket = null;

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === 'player') {
            playerSocket = ws;
        } else if (parsedMessage.type === 'viewer') {
            // Do nothing for now
        } else if (parsedMessage.type === 'gameState') {
            // Broadcast the game state to all viewers
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
        if (ws === playerSocket) {
            playerSocket = null;
        }
    });
});
