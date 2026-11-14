// Dates and times as they are on her clock and calendar, in Lithuania.
const where = { timeZone: "Europe/Vilnius" } as const;

/** "09:34" */
export const time = (at: string) => new Date(at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", ...where });

/** "Thu 12 Nov" */
export const day = (at: string) => new Date(at).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", ...where });

/** "Thursday 12 November" */
export const fullDate = (at: string) => new Date(at).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", ...where });

/** "Thursday" */
export const weekday = (at: string) => new Date(at).toLocaleDateString("en-GB", { weekday: "long", ...where });

/** "12" */
export const dateNumber = (at: string) => new Date(at).toLocaleDateString("en-GB", { day: "numeric", ...where });

/** "taken on call" → "Taken on call" */
export const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
