import { useEffect, useState } from "react";

import { settingsStore } from "./settingsStore";
import { completionTaskStore, AvailableModels } from "./completionTaskStore";

const Header = () => {
  const [settings, setSettings] = useState(settingsStore.get());
  const [activeTasks, setActiveTasks] = useState(completionTaskStore.get());

  useEffect(() => {
    const unsubSettings = settingsStore.subscribe(setSettings);
    const unsubTasks = completionTaskStore.subscribe(setActiveTasks);

    return () => {
      unsubSettings();
      unsubTasks();
    };
  }, []);
  
  const handleModelSelect = (val: string) => {
    settingsStore.set({ ...settings, model: val as (typeof AvailableModels)[number]["value"] });
  };

  const handleApiKeyInput = (val: string) => {
    settingsStore.set({ ...settings, apiKey: val });
  };

  const handleTempInput = (val: number) => {
    settingsStore.set({ ...settings, temperature: val });
  };

  const handleMaxInput = (val: number) => {
    settingsStore.set({ ...settings, max_tokens: val });
  };

  return (
    <header className="flex p-2 w-full bg-[#00fffc] sticky top-0 gap-2 text-sm">
      <label className="px-2 py-1 bg-white">
        <span className="text-gray-500">API key: </span>
        <input
          type="password"
          className="w-20"
          value={settings.apiKey}
          onChange={(e) => handleApiKeyInput(e.target.value)}
        />
      </label>

      <label className="px-2 py-1 bg-white">
        <span className="text-gray-500">Model: </span>
        <select value={settings.model} onChange={(e) => handleModelSelect(e.target.value)}>
          {AvailableModels.map((model) => (
            <option key={model.value} value={model.value}>
              {model.label}
            </option>
          ))}
        </select>
      </label>

      <label className="px-2 py-1 bg-white">
        <span className="text-gray-500">Temperature: </span>
        <input
          value={settings.temperature}
          type="number"
          min="0"
          max="2"
          step={0.1}
          className="w-10"
          onChange={(e) => handleTempInput(Number(e.target.value))}
        />
      </label>

      <label className="px-2 py-1 bg-white">
        <span className="text-gray-500">Max tokens: </span>
        <input
          value={settings.max_tokens}
          type="number"
          min="0"
          max="10000"
          step={250}
          className="w-14"
          onChange={(e) => handleMaxInput(Number(e.target.value))}
        />
      </label>

      {activeTasks.length > 0 && <label className="px-2 py-1 bg-white ml-auto">💬{activeTasks.length}</label>}
    </header>
  );
};

export default Header;
