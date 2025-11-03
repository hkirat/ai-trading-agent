// Centralized frontend config
// Uses env when provided, falls back to the current production URL used in the project.
export const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || "https://api.ai-trading.100xdevs.com";


