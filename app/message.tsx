import { MutableRefObject, memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { nanoid } from "nanoid";

import Markdown from "./markdown";
import Textarea from "./textarea";

import { AvailableModels, completionTaskStore } from "./completionTaskStore";
import { settingsStore } from "./settingsStore";

import { storage } from "./utils";

type MsgStore = {
  weight?: number;
  content?: string;
  messages?: string[];
  select?: string | null;
  meta?: any;
  role: "user" | "assistant";
  id: string;
};

type MessageProps = {
  id: string;
  initialContent: { role: "user" | "assistant"; content: string }[];
  containerRef: MutableRefObject<HTMLElement | null>;
  onWeightChange?: () => void;
};

const newMessageCompletion = ({
  msgId,
  messages,
}: {
  msgId: string;
  messages: Parameters<typeof completionTaskStore.newTask>[0]["opts"]["messages"];
}) => {
  const { apiKey, model, max_tokens, temperature } = settingsStore.get();

  const msgStore = storage<MsgStore>(msgId);

  const msg = { ...msgStore.get(), meta: { model } };

  msgStore.set(msg);

  return completionTaskStore.newTask({
    id: msgId,
    apiKey,
    opts: {
      stream: true,
      model,
      max_tokens,
      messages,
      temperature,
    },
    onText: (text) => msgStore.set({ ...msg, content: (msg.content || "") + text + " " }),
    onError: (error) => {
      const freshMsg = msgStore.get();
      msgStore.set({ ...freshMsg, meta: { ...freshMsg.meta, error: JSON.stringify(error) } });
    },
  });
};

const Message = ({ id, initialContent, containerRef, onWeightChange }: MessageProps) => {
  const [parentMsg, setParentMsg] = useState(storage<MsgStore>(id).get());

  const childMsgs =
    parentMsg.messages?.map((_id) => ({
      ...storage<MsgStore>(_id).get(),
      task: completionTaskStore.get().find((task) => task.id === _id),
    })) || [];

  const weight = childMsgs.reduce((p, c) => p + 1 + (c.weight || 0), 0);

  const selectedMsg = childMsgs.find((msg) => msg.id === parentMsg?.select);

  const defaultChildRole = parentMsg?.role === "user" ? "assistant" : "user";

  const [isEditing, setIsEditing] = useState(defaultChildRole === "user");

  const refresh = useCallback(() => setParentMsg(storage<MsgStore>(id).get()), [id]);

  useLayoutEffect(() => {
    if (weight !== parentMsg.weight) {
      storage<MsgStore>(id).set({ ...parentMsg, weight });
      onWeightChange?.();
      refresh();
    }
  });

  const selectedMemoProps = useMemo(() => {
    if (!selectedMsg?.id) return;

    return {
      key: nanoid(5),
      data: {
        id: selectedMsg.id,
        role: selectedMsg.role,
        content: selectedMsg.content,
      },
      initialContent: [
        ...initialContent,
        ...(selectedMsg.role && selectedMsg.content ? [{ role: selectedMsg.role, content: selectedMsg.content }] : []),
      ],
      onWeightChange: () => refresh(),
    };
  }, [initialContent, selectedMsg?.id, selectedMsg?.content, selectedMsg?.role, refresh]);

  const ref = useRef<HTMLDivElement>(null);
  const prevPosRef = useRef<number>();
  const getCurrentPos = () => ref.current?.getBoundingClientRect().top;

  useEffect(() => {
    if (typeof prevPosRef.current !== "number") return;
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollTop + ((getCurrentPos() || 0) - prevPosRef.current),
    });
    prevPosRef.current = undefined;
  });

  useEffect(() => {
    const inProgressTasks = completionTaskStore.get().filter((task) => parentMsg?.messages?.includes(task.id)) || [];
    const unsubs = inProgressTasks.map((task) => task.result.subscribe(refresh));
    return () => unsubs.forEach((unsub) => unsub());
  });

  const newBranch = ({
    content,
    fillContent,
    addAnswer,
  }: {
    content?: string;
    fillContent?: boolean;
    addAnswer?: boolean;
  }) => {
    prevPosRef.current = -99999;

    const msgId = `#${nanoid(4)}`;

    let msg: MsgStore = {
      id: msgId,
      role: selectedMsg?.role || defaultChildRole,
      content,
    };

    if (addAnswer && content && msg.role === "user") {
      const childMsgId = `#${nanoid(4)}`;

      storage<MsgStore>(childMsgId).set({
        id: childMsgId,
        role: "assistant",
      });

      msg = {
        ...msg,
        messages: [childMsgId],
        select: childMsgId,
      };

      newMessageCompletion({ msgId: childMsgId, messages: [...initialContent, { role: msg.role, content }] });
    }

    storage<MsgStore>(msgId).set(msg);

    if (fillContent && !addAnswer && msg.role === "assistant") {
      newMessageCompletion({ msgId, messages: initialContent });
    }

    storage<MsgStore>(id).set({
      ...parentMsg,
      messages: [msgId, ...(parentMsg.messages || [])],
      select: msgId,
    });

    refresh();
  };

  const editSelect = (content: string) => {
    if (!selectedMsg) return;

    prevPosRef.current = getCurrentPos();

    storage<MsgStore>(selectedMsg.id).set({
      ...selectedMsg,
      content,
    });

    refresh();
  };

  const completeSelect = () => {
    if (!selectedMemoProps?.initialContent) return;

    prevPosRef.current = -99999;

    const endingString = selectedMemoProps.initialContent.at(-1)?.content.slice(-5);

    newMessageCompletion({
      msgId: selectedMemoProps.data.id,
      messages: [
        ...selectedMemoProps.initialContent,
        { role: "user", content: `!continue response, start after '${endingString}'!` },
      ],
    });

    refresh();
  };

  const handleItemDelete = (msgId: string) => {
    prevPosRef.current = getCurrentPos();

    const messages = parentMsg.messages || [];

    const deletedChatIndex = messages.indexOf(msgId);

    const newMsgs = messages.filter((_id) => _id !== msgId);
    const newSelected = parentMsg.select === msgId ? newMsgs[deletedChatIndex] || newMsgs[0] || null : parentMsg.select;

    storage<MsgStore>(id).set({
      ...parentMsg,
      select: newSelected,
      messages: newMsgs,
    });

    refresh();

    const recDel = (_id: string) => {
      const { messages } = storage<MsgStore>(_id).get();

      localStorage.removeItem(_id);

      completionTaskStore
        .get()
        .find((task) => task.id === _id)
        ?.abort();

      if (!messages) return;

      for (const msg of messages) {
        recDel(msg);
      }
    };

    recDel(msgId);
  };

  const handleItemClick = (msgId: string) => {
    prevPosRef.current = getCurrentPos();

    storage<MsgStore>(id).set({
      ...parentMsg,
      select: msgId,
    });

    refresh();
  };

  const style = {
    user: {
      bg: "bg-blue-500",
      bgAccent: "bg-blue-700",
      bgDark: "bg-[#100d26]",
    },
    assistant: {
      bg: "bg-pink-500",
      bgAccent: "bg-pink-700",
      bgDark: "bg-[#260d1a]",
    },
  }[selectedMsg?.role || defaultChildRole];

  return (
    <>
      <div className={`${style.bg} text-white p-2 flex flex-col w-full max-w-screen-lg`} ref={ref}>
        <div className="flex items-end ">
          <div className="w-full overflow-hidden">
            {childMsgs.map((msgData) => {
              const activeColor = selectedMsg?.id === msgData.id ? style.bgAccent : "";

              const weightText = msgData.weight ? `[${msgData.weight}] ` : "";
              const metaText = AvailableModels.find((m) => m.value === msgData?.meta?.model)?.label.concat(" : ") || "";
              const contentText = msgData.content?.slice(0, 200) || "...";

              return (
                <div className={`cursor-pointer w-fit max-w-full flex ${activeColor}`} key={msgData.id}>
                  {msgData.task && (
                    <button title="Stop response" onClick={() => msgData.task?.abort()}>
                      🛑
                    </button>
                  )}
                  <span className="truncate" onClick={() => handleItemClick(msgData.id)}>
                    {`${weightText}${metaText}${contentText}`}
                  </span>
                  <button title="Delete" onClick={() => handleItemDelete(msgData.id)}>
                    ❌
                  </button>
                </div>
              );
            })}
          </div>

          {selectedMsg?.role === "assistant" && (
            <>
              <button
                onClick={() => {
                  prevPosRef.current = getCurrentPos();
                  setIsEditing(!isEditing);
                }}
                title="Toggle editing"
              >
                ✍
              </button>
              <button
                className={`cursor-pointer`}
                onClick={() => newBranch({ fillContent: true })}
                title="Roll another response"
              >
                ♿️
              </button>
              {!selectedMsg.task && (
                <button className={`cursor-pointer`} onClick={() => completeSelect()} title="Continue response">
                  🗿
                </button>
              )}
            </>
          )}
        </div>

        {isEditing ? (
          <Textarea
            onSubmit={({ content, action }) => {
              switch (action) {
                case "send":
                  newBranch({ content, addAnswer: true });
                  break;
                case "save":
                  editSelect(content);
                  break;
              }
            }}
            defaultValue={selectedMemoProps?.data.content}
            key={selectedMemoProps?.key}
          />
        ) : (
          <article
            className={`${style.bgDark} leading-6 p-4 prose prose-invert max-w-none prose-code:before:content-none prose-code:after:content-none prose-pre:my-[1.5em] prose-pre:bg-[#4b556380]`}
          >
            <Markdown text={selectedMemoProps?.data.content} />
          </article>
        )}

        {selectedMsg?.meta?.error && <span className="m-auto">{"Error: " + selectedMsg.meta.error}</span>}

        {selectedMsg?.task && (
          <button className="m-auto font-bold" onClick={() => selectedMsg.task?.abort()}>
            Stop response
          </button>
        )}
      </div>

      {selectedMemoProps && !selectedMsg?.task && (
        <MemoMessage
          key={selectedMemoProps.key}
          id={selectedMemoProps.data.id}
          initialContent={selectedMemoProps.initialContent}
          onWeightChange={selectedMemoProps.onWeightChange}
          containerRef={containerRef}
        />
      )}
    </>
  );
};

const MemoMessage = memo(Message);

export default MemoMessage;
