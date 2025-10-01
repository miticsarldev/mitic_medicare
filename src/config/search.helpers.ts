export function parseExperienceYears(exp?: string | null): number {
  if (!exp) return 0;
  const m = exp.match(/\d+/g);
  if (!m) return 0;
  // most common pattern: "10+" or "5-10" -> take the max number we see
  return Math.max(...m.map(Number));
}

export function average(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}
