export const generateTrackingId = (): string => {
  const datePart = new Date().toISOString().replace(/-/g, "").slice(0, 8); // YYYYMMDD
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 random chars
  return `TRK-${datePart}-${randomPart}`;
};
