"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTrackingId = void 0;
const nanoid_1 = require("nanoid");
const generateTrackingId = () => {
    const datePart = new Date().toISOString().replace(/-/g, "").slice(0, 8); // YYYYMMDD
    const uniqueId = (0, nanoid_1.nanoid)(6).toUpperCase(); // 6-character random string (e.g., "A1B2C3")
    return `TRK-${datePart}-${uniqueId}`;
};
exports.generateTrackingId = generateTrackingId;
