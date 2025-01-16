// server.js
import express from 'express';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import https from 'https';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import pool from './db.js'; // Import the database connection
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_SECRET = process.env.CLIENT_SECRET;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_URL = process.env.CLIENT_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json()); // To parse JSON bodies
app.use(session({
    secret: CLIENT_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

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
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }
    const { score } = req.body;
    const username = req.user.profile.name;
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

app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
        const user = req.user;
        console.log('user: ', user)
        res.json({
            username: user.profile.displayName
        });
    } else {
        res.status(401).json({
            error: 'Unauthorized'
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

// Google OAuth 2.0 configuration
passport.use(new GoogleStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: CLIENT_URL,
}, (accessToken, refreshToken, profile, done) => {
    return done(null, {
        profile,
        accessToken
    });
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile']
}));

app.get('/auth/google/callback', passport.authenticate('google', {
        failureRedirect: '/'
    }),
    (req, res) => {
        res.redirect('/');
    }
);

app.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
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
