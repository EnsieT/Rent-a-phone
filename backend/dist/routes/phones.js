"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    const { available } = req.query;
    let query = 'SELECT * FROM phones';
    if (available === 'true') {
        query += ' WHERE available = 1';
    }
    else if (available === 'false') {
        query += ' WHERE available = 0';
    }
    query += ' ORDER BY brand, model';
    const phones = db_1.default.prepare(query).all();
    res.json(phones);
});
router.get('/:id', (req, res) => {
    const phone = db_1.default
        .prepare('SELECT * FROM phones WHERE id = ?')
        .get(req.params.id);
    if (!phone) {
        res.status(404).json({ error: 'Phone not found' });
        return;
    }
    res.json(phone);
});
exports.default = router;
