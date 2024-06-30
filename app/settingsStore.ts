import { AvailableModels } from "./completionTaskStore";
import { createAtom, storage } from "./utils";

const createSettingsStore = () => {
  type SettingsStore = {
    model?: (typeof AvailableModels)[number]["value"];
    max_tokens?: number;
    temperature?: number;
    apiKey?: string;
  };

  const store = storage<SettingsStore>("settings");

  const atom = createAtom<SettingsStore>({
    model: AvailableModels[0].value,
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
