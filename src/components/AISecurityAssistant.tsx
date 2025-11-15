import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MessageSquare, Send, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AISecurityAssistantProps {
  recommendations: string[];
  scanData?: {
    url: string;
    score: number;
  };
}

const AISecurityAssistant = ({ recommendations, scanData }: AISecurityAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const streamChat = async (userMessage: string) => {
    setIsLoading(true);
    
    const newUserMessage: Message = { role: "user", content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setInput("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/security-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            message: userMessage,
            recommendations,
            scanData,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Failed to get AI response");
        setIsLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      if (!reader) {
        throw new Error("No response stream");
      }

      // Add initial empty assistant message
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim() || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return newMessages;
              });
            }
          } catch (e) {
            // Ignore parse errors for partial chunks
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to communicate with AI assistant");
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    streamChat(input);
  };

  if (!isOpen) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-primary/3 to-secondary/5 border-primary/20 hover:border-primary/30 transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-lg mb-2">AI Security Assistant</h4>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Get instant, expert guidance on implementing security fixes. Ask about best practices, code examples, or step-by-step instructions.
            </p>
            <Button onClick={() => setIsOpen(true)} className="gap-2 shadow-sm hover:shadow-md transition-all">
              <MessageSquare className="w-4 h-4" />
              Start Conversation
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-primary/3 to-secondary/5 border-primary/20 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-secondary/20">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h4 className="font-semibold">AI Security Assistant</h4>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="hover:bg-muted/50">
          Minimize
        </Button>
      </div>

      <div className="space-y-3 mb-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="p-4 rounded-full bg-primary/5 w-fit mx-auto mb-4">
              <MessageSquare className="w-10 h-10 opacity-40" />
            </div>
            <p className="text-sm font-medium mb-1">Ask me anything!</p>
            <p className="text-xs">Implementation steps, best practices, or code examples</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 shadow-sm ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground"
                  : "bg-card border border-border text-foreground"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-card border border-border rounded-lg p-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask about implementation, best practices, or get code examples..."
          className="min-h-[60px] resize-none bg-card border-muted"
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          size="icon"
          className="h-[60px] w-[60px] shadow-md hover:shadow-lg transition-all"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </Card>
  );
};

export default AISecurityAssistant;
