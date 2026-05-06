import type { ToolCall } from "@langchain/core/messages";
import type { AIMessage } from "@langchain/langgraph-sdk";

import { hasToolCalls } from "../messages/utils";

export function explainLastToolCall(message: AIMessage, t: (key: string, params?: Record<string, string>) => string) {
  if (hasToolCalls(message)) {
    const lastToolCall = message.tool_calls![message.tool_calls!.length - 1]!;
    return explainToolCall(lastToolCall, t);
  }
  return t("common.thinking");
}

export function explainToolCall(toolCall: ToolCall, t: (key: string, params?: Record<string, string>) => string) {
  if (toolCall.name === "web_search" || toolCall.name === "image_search") {
    return t("toolCalls.searchFor", { query: toolCall.args.query });
  } else if (toolCall.name === "web_fetch") {
    return t("toolCalls.viewWebPage");
  } else if (toolCall.name === "present_files") {
    return t("toolCalls.presentFiles");
  } else if (toolCall.name === "write_todos") {
    return t("toolCalls.writeTodos");
  } else if (toolCall.args.description) {
    return toolCall.args.description;
  } else {
    return t("toolCalls.useTool", { toolName: toolCall.name });
  }
}
