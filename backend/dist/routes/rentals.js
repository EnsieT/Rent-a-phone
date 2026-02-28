"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
function daysBetween(start, end) {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
function hasOverlap(phoneId, startDate, endDate, excludeId) {
    let query = `
    SELECT id FROM rentals
    WHERE phone_id = ?
      AND status NOT IN ('cancelled', 'completed')
      AND start_date < ?
      AND end_date > ?
  `;
    const params = [phoneId, endDate, startDate];
    if (excludeId !== undefined) {
        query += ' AND id != ?';
        params.push(excludeId);
    }
    const row = db_1.default.prepare(query).get(...params);
    return row !== undefined;
}
router.get('/', (req, res) => {
    const userId = req.user.userId;
    const rentals = db_1.default
        .prepare(`
      SELECT r.*, p.brand, p.model, p.image_url
      FROM rentals r
      JOIN phones p ON p.id = r.phone_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `)
        .all(userId);
    res.json(rentals);
});
router.post('/', (req, res) => {
    const userId = req.user.userId;
    const { phoneId, startDate, endDate } = req.body;
    if (!phoneId || !startDate || !endDate) {
        res.status(400).json({ error: 'phoneId, startDate, and endDate are required' });
        return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        return;
    }
    if (end <= start) {
        res.status(400).json({ error: 'endDate must be after startDate' });
        return;
    }
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    if (start < today) {
        res.status(400).json({ error: 'startDate cannot be in the past' });
        return;
    }
    const phone = db_1.default
        .prepare('SELECT id, price_per_day, available FROM phones WHERE id = ?')
        .get(phoneId);
    if (!phone) {
        res.status(404).json({ error: 'Phone not found' });
        return;
    }
    if (hasOverlap(phone.id, startDate, endDate)) {
        res.status(409).json({ error: 'Phone is already rented for the requested period' });
        return;
    }
    const days = daysBetween(startDate, endDate);
    const total_price = Math.round(days * phone.price_per_day * 100) / 100;
    const result = db_1.default
        .prepare(`
      INSERT INTO rentals (user_id, phone_id, start_date, end_date, status, total_price)
      VALUES (?, ?, ?, ?, 'pending', ?)
    `)
        .run(userId, phone.id, startDate, endDate, total_price);
    const rental = db_1.default
        .prepare('SELECT * FROM rentals WHERE id = ?')
        .get(result.lastInsertRowid);
    res.status(201).json(rental);
});
router.delete('/:id', (req, res) => {
    const userId = req.user.userId;
    const rentalId = Number(req.params.id);
    const rental = db_1.default
        .prepare('SELECT * FROM rentals WHERE id = ?')
        .get(rentalId);
    if (!rental) {
        res.status(404).json({ error: 'Rental not found' });
        return;
    }
    if (rental.user_id !== userId) {
        res.status(403).json({ error: 'Not authorized to cancel this rental' });
        return;
    }
    if (rental.status === 'cancelled') {
        res.status(400).json({ error: 'Rental is already cancelled' });
        return;
    }
    if (rental.status === 'completed') {
        res.status(400).json({ error: 'Cannot cancel a completed rental' });
        return;
    }
    db_1.default.prepare("UPDATE rentals SET status = 'cancelled' WHERE id = ?").run(rentalId);
    res.json({ message: 'Rental cancelled successfully' });
});
exports.default = router;
