import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getZenithResponse } from "./zenithEngine";

type Sender = "user" | "bot";

interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  createdAt: string;
}

interface ZenithChatbotProps {
  userId: string;
}

const QUICK_REPLIES = [
  "Upcoming Drives",
  "Resume Tips",
  "Interview Preparation",
  "Eligibility Criteria",
  "Application Status and deadlie of companies too",
];

const createMessage = (sender: Sender, text: string): ChatMessage => ({
  id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  sender,
  text,
  createdAt: new Date().toISOString(),
});

const createWelcomeMessage = (): ChatMessage =>
  createMessage(
    "bot",
    "Zenith – Placement Assistant is active. Ask placement-related questions about drives, eligibility, applications, resume guidance, interview preparation, or portal usage.",
  );

const ZenithChatbot = ({ userId }: ZenithChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<number | null>(null);

  const storageKey = useMemo(() => `zenith-chat-history:${userId}`, [userId]);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        } else {
          setMessages([createWelcomeMessage()]);
        }
      } catch {
        setMessages([createWelcomeMessage()]);
      }
    } else {
      setMessages([createWelcomeMessage()]);
    }

    setIsHydrated(true);

    return () => {
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }
    };
  }, [storageKey]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey, isHydrated]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping, isOpen]);

  const pushUserAndBotMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    const userMessage = createMessage("user", trimmed);
    setMessages((prev) => [...prev, userMessage]);

    setInputValue("");
    setIsTyping(true);

    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = window.setTimeout(() => {
      const responseText = getZenithResponse(trimmed);
      const botMessage = createMessage("bot", responseText);
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 650);
  };

  const handleClearChat = () => {
    const welcomeMessage = createWelcomeMessage();
    setMessages([welcomeMessage]);
    setIsTyping(false);
    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current);
    }
    localStorage.setItem(storageKey, JSON.stringify([welcomeMessage]));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <div
        className={cn(
          "mb-3 h-[70vh] w-[calc(100vw-2rem)] max-h-[580px] max-w-sm origin-bottom-right overflow-hidden rounded-2xl border border-border bg-background shadow-xl transition-all duration-300",
          isOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-3 scale-95 opacity-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground">
          <div>
            <p className="text-sm font-semibold">Zenith – Placement Assistant</p>
            <p className="text-xs text-primary-foreground/80">Placement queries only</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            onClick={handleClearChat}
            aria-label="Clear chat"
            title="Clear chat"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex h-[calc(100%-7.25rem)] flex-col">
          <div className="border-b border-border/70 px-3 py-2">
            <div className="flex flex-wrap gap-2">
              {QUICK_REPLIES.map((reply) => (
                <Button
                  key={reply}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-full border-primary/30 px-3 text-[11px] text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => pushUserAndBotMessage(reply)}
                >
                  {reply}
                </Button>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1 px-3 py-3">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border/70 bg-card text-card-foreground",
                    )}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-card px-3 py-2">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                      style={{ animationDelay: "120ms" }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                      style={{ animationDelay: "240ms" }}
                    />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </ScrollArea>
        </div>

        <form
          className="flex items-center gap-2 border-t border-border bg-background px-3 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            pushUserAndBotMessage(inputValue);
          }}
        >
          <Input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Ask placement-related questions"
            className="h-9"
          />
          <Button type="submit" size="icon" className="h-9 w-9" aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <Button
        type="button"
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close Zenith chatbot" : "Open Zenith chatbot"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
};

export default ZenithChatbot;
