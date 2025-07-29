import { nanoid } from "nanoid";

export const generateTrackingId = (): string => {
  const datePart = new Date().toISOString().replace(/-/g, "").slice(0, 8); // YYYYMMDD
  const uniqueId = nanoid(6).toUpperCase(); // 6-character random string (e.g., "A1B2C3")
  return `TRK-${datePart}-${uniqueId}`;
};
