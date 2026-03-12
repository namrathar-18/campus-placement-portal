import { useEffect, useRef, useState } from 'react';
import { BrainCircuit, Send, Trash2, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useZenithChat } from './hooks/useZenithChat';

interface ZenithChatbotProps {
  userId: string;
}

const QUICK_PROMPTS = [
  'View My Profile',
  'Best Companies For Me',
  'Resume Feedback',
  'Upcoming Drives',
  'Edit My Profile',
];

const ZenithChatbot = ({ userId }: ZenithChatbotProps) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);
  const { messages, isTyping, respond, clearChat } = useZenithChat({ userId });

  const isDashboardRoute = location.pathname === '/dashboard' || location.pathname === '/student/dashboard';

  useEffect(() => {
    if (!isOpen) return;
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (!isDashboardRoute) {
      setIsOpen(false);
    }
  }, [isDashboardRoute]);

  if (!isDashboardRoute) {
    return null;
  }

  const canSend = inputValue.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    void respond(inputValue);
    setInputValue('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[70]">
      <div
        className={cn(
          'mb-3 flex h-[560px] max-h-[calc(100dvh-6rem)] w-[360px] max-w-[calc(100vw-2rem)] flex-col origin-bottom-right overflow-hidden rounded-2xl border border-border bg-background shadow-2xl transition-all duration-300',
          isOpen ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-3 scale-95 opacity-0',
        )}
      >
        <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground">
          <h3 className="text-sm font-semibold">Zenith – AI Placement Assistant</h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            onClick={() => setIsOpen(false)}
            aria-label="Close Zenith"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 overflow-y-auto px-3 py-3">
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

            <div ref={endRef} />
          </div>
        </ScrollArea>

        <div className="flex items-center gap-2 border-t border-border bg-background px-3 py-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={clearChat}
            aria-label="Clear chat"
            title="Clear chat"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <Input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask your placement question..."
            className="h-10"
          />

          <Button
            type="button"
            size="icon"
            className="h-10 w-10"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="h-[60px] w-[60px] rounded-full gradient-primary shadow-lg transition-transform duration-200 hover:scale-105"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? 'Close Zenith' : 'Open Zenith'}
          >
            <BrainCircuit className="mx-auto h-6 w-6 text-primary-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">Chat with Zenith</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default ZenithChatbot;
