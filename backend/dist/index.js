"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("./db"); // initializes DB on startup
const auth_1 = __importDefault(require("./routes/auth"));
const phones_1 = __importDefault(require("./routes/phones"));
const rentals_1 = __importDefault(require("./routes/rentals"));
const app = (0, express_1.default)();
const PORT = process.env.PORT ?? 3001;
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
}));
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/phones', phones_1.default);
app.use('/api/rentals', rentals_1.default);
app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
exports.default = app;
