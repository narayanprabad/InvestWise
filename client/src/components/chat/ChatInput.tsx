import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  isLoading
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend(value);
    }
  };

  return (
    <div className="border-t p-4 flex gap-2 items-end">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about investment advice..."
        className="min-h-[80px]"
      />
      <Button
        onClick={() => onSend(value)}
        disabled={isLoading || !value.trim()}
        size="icon"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
