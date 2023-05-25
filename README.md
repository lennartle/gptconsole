## GPTconsole - editor, but for the gpt...

![preview](https://github.com/lennartle/gptconsole/assets/45395412/9a7ac37c-4ffc-4c9c-8335-0f3662a9161c)


To achieve the best results from GPT, there's already a concept known as "prompt engineering" but I think it goes beyond that. You need to consider performing the whole "dialogue engineering", which means you ought to be able to edit both requests and answers. However, the original client is more like a traditional chat.

So, I wanted to create a simple tool that falls somewhere between a code editor with git-like versions of messages and a chat, allowing the simplicity of conversation.

Key points:

- All data is stored in your browser for quick display.

- All messages act as branches.

- All messages are editable; [Ctrl+S] saves your edit to the current branch, and default [Enter] creates a new branch. This is useful in common scenario when GPT gives the wrong answer and you need to correct it before continuing the dialog in the context of the right answer. You can edit where GPT has been wrong and continue without losing much context. Or you can just model the initial dialog to fill the context.

- All GPT tasks are stored independently, allowing for multiple active responses. This is helpful when you need to create several variations at once and navigate different branches without stopping the response.

- Each assistant response can be continued from any point in time.

- Answers can have different versions at the same time, for example one GPT-3 another GPT-4.

- The dialogue depth is displayed for each branch, e.g., "[8]" before the prompt indicates eight messages in the current branch.
