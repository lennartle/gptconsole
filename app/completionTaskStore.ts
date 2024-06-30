import { request } from "https";
import { createAtom } from "./utils";

export const AvailableModels = [
  { label: "GPT 4o", value: "gpt-4o" },
  { label: "GPT 3.5T", value: "gpt-3.5-turbo" },
] as const;

type ChatCompletionOptions = {
  messages?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  model?: (typeof AvailableModels)[number]["value"];
  max_tokens?: number;
  stream?: boolean;
  temperature?: number;
};

type ChatCompletion = (props: {
  opts: ChatCompletionOptions;
  apiKey?: string;
  signal?: AbortSignal;
  onText: (text: string) => void;
}) => Promise<string>;

const chatCompletion: ChatCompletion = ({ opts, apiKey, onText, signal }) =>
  new Promise((resolve, reject) => {
    let fullText = "";

    const options = {
      method: "POST",
      hostname: "api.openai.com",
      path: "/v1/chat/completions",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    };

    const req = request(options, (res) => {
      const decoder = new TextDecoder("utf8");

      if (res.statusCode !== 200) {
        res.on("data", (chunk) => {
          reject(`OpenAI: ${res.statusCode} - ${JSON.parse(decoder.decode(chunk) || "{}")?.error?.code || "unknown"}`);
        });
        return;
      }

      res.on("data", (chunk) => {
        const dataMatches = decoder.decode(chunk).matchAll(/data: ({.*})\n/g);

        for (const match of dataMatches) {
          const { content } = JSON.parse(match[1]).choices[0].delta;

          if (!content) continue;

          fullText += content;

          onText(fullText);
        }
      });

      res.on("end", () => {
        resolve(fullText);
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(JSON.stringify(opts));

    req.end();

    if (signal) {
      signal.onabort = () => {
        req.destroy();
        resolve(fullText);
      };
    }
  });

const createCompletionTaskStore = () => {
  type CompletionTask = {
    id: string;
    result: ReturnType<typeof createAtom<string>>;
    abort: () => void;
  };

  const atom = createAtom<CompletionTask[]>([]);

  const storeTask = (task: CompletionTask) => atom.set((prev) => [...prev, task]);
  const removeTask = (id: string) => atom.set((prev) => [...prev].filter((task) => task.id !== id));

  type newTaskProps = {
    id: string;
    apiKey?: string;
    opts: ChatCompletionOptions;
    onText?: (text: string) => void;
    onDone?: (text: string) => void;
    onError?: (error: any) => void;
  };

  const newTask = ({ id, apiKey, opts, onText, onDone, onError }: newTaskProps) => {
    const result = createAtom("");

    const abortController = new AbortController();

    chatCompletion({
      opts,
      apiKey,
      signal: abortController.signal,
      onText: (text) => {
        result.set(() => text);
        onText?.(text);
      },
    })
      .then((text) => {
        result.set(() => text);
        onDone?.(text);
        removeTask(id);
      })
      .catch((error) => {
        result.set((current) => current);
        onError?.(error);
        removeTask(id);
      });

    storeTask({
      id,
      result,
      abort: () => abortController.abort(),
    });
  };

  return {
    newTask,
    get: atom.get,
    subscribe: atom.subscribe,
  };
};

const completionTaskStore = createCompletionTaskStore();

export { completionTaskStore };
