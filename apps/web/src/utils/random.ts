// Generate random ID
export const randomId = () => Math.random().toString(36).substring(7)

// Generate a list of random IDs
export const generateIds = (count: number) => Array.from({ length: count }, () => randomId())
