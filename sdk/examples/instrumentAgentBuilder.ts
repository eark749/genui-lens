import { startView, trackEvent } from "@genui-lens/sdk";

export function instrumentAgentBuilder(widget: any) {
  widget.on("userMessageSent", (message: string, threadId: string) => {
    trackEvent({
      eventType: "action",
      componentId: "user_message",
      actionType: "submit",
      payload: { message, threadId },
    });
  });

  widget.on(
    "generationEnded",
    (threadId: string, messageId: string, message: string) => {
      startView({
        intent: "agent_builder",
        library: "agent_builder",
        threadId,
        metadata: { messageId },
      });
      trackEvent({
        eventType: "view",
        componentId: "assistant_message",
        payload: { threadId, messageId },
      });
    }
  );

  widget.on("toolExecutionStarted", (threadId: string, toolName: string) => {
    trackEvent({
      eventType: "action",
      componentId: `tool.${toolName}`,
      actionType: "tool_call",
      payload: { threadId, toolName },
    });
  });

  return widget;
}
