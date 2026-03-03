import { useEffect, useRef, useState } from 'react';
import { BrainCircuit, Send, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useZenithChat } from './hooks/useZenithChat';
import { ZENITH_QUICK_REPLIES } from './quickReplies';

interface ZenithAssistantProps {
  userId: string;
}

const ZenithAssistant = ({ userId }: ZenithAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { messages, isTyping, respond, clearChat } = useZenithChat({ userId });

  useEffect(() => {
    if (!isOpen) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTyping, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    void respond(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[70]">
      <div
        className={cn(
          'mb-3 h-[72vh] w-[calc(100vw-2rem)] max-h-[620px] max-w-sm origin-bottom-right overflow-hidden rounded-2xl border border-border bg-background shadow-2xl transition-all duration-300',
          isOpen ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-3 scale-95 opacity-0',
        )}
      >
        <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground">
          <div>
            <h3 className="text-sm font-semibold">Zenith – AI Placement Assistant</h3>
            <p className="text-xs text-primary-foreground/80">Placement support for students</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            onClick={clearChat}
            aria-label="Clear chat"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="border-b border-border/70 px-3 py-2">
          <div className="flex flex-wrap gap-2">
            {ZENITH_QUICK_REPLIES.map((reply) => (
              <Button
                key={reply}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-full border-primary/30 px-3 text-[11px] text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => void respond(reply)}
              >
                {reply}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-8.8rem)] px-3 py-3">
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={cn('flex', message.sender === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[86%] whitespace-pre-line rounded-xl px-3 py-2 text-sm leading-relaxed',
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border/70 bg-card text-card-foreground',
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
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '120ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '240ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <form
          className="flex items-end gap-2 border-t border-border bg-background px-3 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
        >
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            rows={2}
            placeholder="Type your placement question..."
            className="min-h-[44px] resize-none"
          />
          <Button type="submit" size="icon" className="h-11 w-11 shrink-0" aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg ring-2 ring-primary/30 animate-pulse"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? 'Close Zenith' : 'Open Zenith'}
          >
            {isOpen ? <X className="h-6 w-6" /> : <BrainCircuit className="h-6 w-6" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">Chat with Zenith</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default ZenithAssistant;
