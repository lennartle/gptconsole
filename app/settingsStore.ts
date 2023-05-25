import { createAtom, storage } from "./utils";

const createSettingsStore = () => {
  type SettingsStore = {
    model?: "gpt-3.5-turbo" | "gpt-4";
    max_tokens?: number;
    temperature?: number;
    apiKey?: string;
  };

  const store = storage<SettingsStore>("settings");

  const atom = createAtom<SettingsStore>({
    model: "gpt-3.5-turbo",
    max_tokens: 1024,
    temperature: 1,
    ...store.get(),
  });

  return {
    set: (data: SettingsStore) => {
      store.set(data);
      atom.set(() => data);
    },
    get: atom.get,
    subscribe: atom.subscribe,
  };
};

const settingsStore = createSettingsStore();

export { settingsStore };
