export const isValidIntString = (value: string): boolean => {
  return /^-?\d+$/.test(value) && Number(value) >= 0;
};

export const inRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

export const isBoolString = (value: string): boolean => {
  return ["false", "true"].includes(value);
};

export const isFiveOrTenDivisible = (value: number): boolean => {
  return value % 10 === 0 || value % 5 === 0;
};
