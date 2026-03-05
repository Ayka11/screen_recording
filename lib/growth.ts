export type GrowthStage = 'Seed' | 'Sprout' | 'Sapling' | 'Mature Tree';

export function calculateGrowthStage(plantedAt: number, germinationDays: number): GrowthStage {
  const now = Date.now();
  const ageInMs = now - plantedAt;
  const ageInDays = ageInMs / (1000 * 60 * 60 * 24);

  // For testing purposes, let's speed up time or use a small scale.
  // But the prompt asks for real-time. We'll use real-time.
  // Seed: 0 to germinationDays
  // Sprout: germinationDays to germinationDays + 30
  // Sapling: germinationDays + 30 to germinationDays + 365
  // Mature: > germinationDays + 365

  if (ageInDays < germinationDays) return 'Seed';
  if (ageInDays < germinationDays + 30) return 'Sprout';
  if (ageInDays < germinationDays + 365) return 'Sapling';
  return 'Mature Tree';
}

export function getDaysUntilStratificationOver(plantedAt: number): number {
  const now = Date.now();
  const ageInMs = now - plantedAt;
  const ageInDays = ageInMs / (1000 * 60 * 60 * 24);
  const daysLeft = 90 - ageInDays;
  return Math.max(0, Math.ceil(daysLeft));
}
