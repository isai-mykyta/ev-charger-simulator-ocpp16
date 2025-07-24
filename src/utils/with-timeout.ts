export const withTimeout = <T>(promise: Promise<T>, ms: number, error: string): Promise<T> => {
  return Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(error), ms))]);
};
