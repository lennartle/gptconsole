const storage = <T extends object>(key: string) => ({
  get: (): T => JSON.parse(localStorage?.getItem(key) || "{}"),
  set: (data: T) => localStorage?.setItem(key, JSON.stringify(data)),
  del: () => localStorage?.removeItem(key),
});

const createAtom = <T extends unknown>(initialValue: T) => {
  let value = initialValue;

  type Callback = (newValue: T) => void;

  const subscribers = new Set<Callback>();

  return {
    get: () => value,
    set: (updater: (currentValue: T) => T) => {
      value = updater(value);
      subscribers.forEach((callback) => callback(value));
    },
    subscribe: (callback: Callback) => {
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    },
  };
};

export { storage, createAtom };
