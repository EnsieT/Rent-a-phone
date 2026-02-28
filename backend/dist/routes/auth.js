"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET ?? 'change-me-in-production';
const SALT_ROUNDS = 10;
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400).json({ error: 'name, email, and password are required' });
        return;
    }
    if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters' });
        return;
    }
    const existing = db_1.default.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
        res.status(409).json({ error: 'Email already registered' });
        return;
    }
    try {
        const password_hash = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        const result = db_1.default
            .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
            .run(name, email, password_hash);
        const user = db_1.default
            .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
            .get(result.lastInsertRowid);
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: '7d',
        });
        res.status(201).json({ token, user });
    }
    catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'email and password are required' });
        return;
    }
    const row = db_1.default
        .prepare('SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?')
        .get(email);
    if (!row) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
    }
    try {
        const match = await bcrypt_1.default.compare(password, row.password_hash);
        if (!match) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: row.id, email: row.email }, JWT_SECRET, {
            expiresIn: '7d',
        });
        const { password_hash: _ph, ...user } = row;
        res.json({ token, user });
    }
    catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
