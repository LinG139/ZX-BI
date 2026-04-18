import React, {useState} from "react";
import Chat, {Bubble, useMessages} from "@chatui/core";
import "@chatui/core/dist/index.css";
import {genChatUsingPOST} from "@/services/yubi/aiController";
import {message} from "antd";

export default function App() {
  const {messages, appendMsg, setTyping} = useMessages([]);
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSend(type: string, val: string) {
    if (type === "text" && val.trim()) {
      appendMsg({
        type: "text",
        content: {text: val},
        position: "right"
      });

      setTyping(true);
      setLoading(true);

      try {
        const res = await genChatUsingPOST({message: val});
        if (!res?.data) {
          message.error("AI回复失败");
          appendMsg({
            type: "text",
            content: {text: "AI回复失败，请稍后重试"}
          });
        } else {
          appendMsg({
            type: "text",
            content: {text: res.data}
          });
        }
      } catch (e: any) {
        message.error("AI回复失败：" + e.message);
        appendMsg({
          type: "text",
          content: {text: "AI回复失败：" + e.message}
        });
      } finally {
        setTyping(false);
        setLoading(false);
      }
    }
  }

  function renderMessageContent(msg: any) {
    const {content} = msg;
    return <Bubble content={content.text}/>;
  }

  return (
    <Chat
      navbar={{title: "Ai 聊天"}}
      messages={messages}
      renderMessageContent={renderMessageContent}
      onSend={handleSend}
    />
  );
}
