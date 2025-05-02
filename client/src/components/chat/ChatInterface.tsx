import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Chat, ChatResponse, MarketCondition } from "@shared/schema";

interface ChatInterfaceProps {
  userId: number;
  selectedLocale?: string;
  marketCondition?: MarketCondition;
  userData?: any; // User data passed from parent component
}

export default function ChatInterface({ userId, selectedLocale = 'IN', marketCondition = 'neutral', userData: userDataProp }: ChatInterfaceProps) {
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Improved scroll to bottom helper function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    } else {
      // As a fallback, try to scroll the parent container
      const chatContainer = document.querySelector('.chat-messages-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  };
  
  // State to track additional market data from AI responses
  const [latestMarketData, setLatestMarketData] = useState<any>(null);
  
  // Fetch user profile data if not provided by prop
  const { data: userDataFromApi } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !userDataProp, // Only fetch if userDataProp is not provided
  });
  
  // Use either the prop passed in or data fetched from the API
  const userData = userDataProp || userDataFromApi;
  
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          message,
          locale: selectedLocale, // Pass the selected locale to the server
          response: "" // Will be filled by server
        })
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json() as Promise<ChatResponse & { marketData?: any }>;
    },
    onSuccess: (data) => {
      // Save the market data if it's available
      if (data.marketData) {
        setLatestMarketData(data.marketData);
        console.log("Received ML market prediction:", data.marketData);
      }
      
      queryClient.invalidateQueries({ queryKey: [`/api/chat/${userId}/history`] });
      setInputValue("");
      // Ensure we scroll to bottom after a successful message send
      // Use multiple timeouts to ensure scrolling works even if rendering takes time
      setTimeout(scrollToBottom, 100);
      setTimeout(scrollToBottom, 300);
      setTimeout(scrollToBottom, 500);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const { data: chatHistory = [] } = useQuery<Chat[]>({
    queryKey: [`/api/chat/${userId}/history`],
  });
  
  // Auto-scroll to bottom when new messages arrive or loading state changes
  useEffect(() => {
    // Multiple timeouts to ensure scrolling works even after delayed rendering
    scrollToBottom();
    setTimeout(scrollToBottom, 100);
    setTimeout(scrollToBottom, 300);
  }, [chatHistory, chatMutation.isPending]);
  
  // Also scroll to bottom when the component mounts
  useEffect(() => {
    scrollToBottom();
    
    // Set up a mutation observer to detect when chat messages are added to the DOM
    const chatContainer = document.querySelector('.chat-messages-container');
    if (chatContainer) {
      const observer = new MutationObserver(() => {
        scrollToBottom();
      });
      
      observer.observe(chatContainer, {
        childList: true,
        subtree: true
      });
      
      return () => observer.disconnect();
    }
  }, []);

  const handleSend = async (message: string) => {
    if (message.trim()) {
      chatMutation.mutate(message);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* User Profile Header */}
      <div className="p-3 border-b bg-secondary/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
            {userData?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-sm font-medium">{userData?.name || 'User'}</h3>
            <p className="text-xs text-muted-foreground">
              {userData?.riskProfile ? `${userData.riskProfile.charAt(0).toUpperCase() + userData.riskProfile.slice(1)} investor` : 'Loading profile...'}
              {userData?.location && ` · ${userData.location.split('_')[0]}`}
            </p>
          </div>
        </div>
        <div className="text-xs px-2 py-1 rounded-full bg-muted">
          Market: <span className="font-medium capitalize">{marketCondition}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 pb-4 h-full max-h-[calc(100vh-16rem)] overflow-auto chat-messages-container">
        {chatHistory.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            <p className="text-sm">No chat history yet. Ask your investment questions here.</p>
            <p className="mt-2 text-sm">Try asking:</p>
            <ul className="mt-1 space-y-1 text-xs">
              <li>"What portfolio allocation would suit my profile?"</li>
              <li>"Suggest top mutual funds for {selectedLocale === 'IN' ? 'long-term growth in India' : 'retirement in the US'}"</li>
              <li>"Tell me about {selectedLocale === 'IN' ? 'NIFTY large cap stocks' : 'S&P 500 blue-chip stocks'}"</li>
              <li>"What's the best SIP strategy for {selectedLocale === 'IN' ? 'Indian market' : 'US market'} right now?"</li>
              <li>"How should I invest during {marketCondition} market conditions?"</li>
            </ul>
          </div>
        ) : (
          <>
            {chatHistory.map((chat) => {
              let parsedResponse = null;
              try {
                parsedResponse = chat.response ? JSON.parse(chat.response) : null;
              } catch (error) {
                console.error("Error parsing chat response:", error);
              }

              // Check if this is the most recent chat message to show market data
              const isLatestMessage = chatHistory.length > 0 && chat.id === chatHistory[chatHistory.length - 1].id;

              return (
                <ChatMessage
                  key={chat.id}
                  message={chat.message}
                  response={parsedResponse}
                  timestamp={new Date(chat.createdAt || Date.now())}
                  isLoading={false}
                  marketData={isLatestMessage ? latestMarketData : undefined}
                />
              );
            })}
            {chatMutation.isPending && (
              <ChatMessage
                message={inputValue}
                response={null}
                timestamp={new Date()}
                isLoading={true}
              />
            )}
            {/* This div is used to scroll to the bottom */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="pt-3 border-t">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          isLoading={chatMutation.isPending}
        />
      </div>
    </div>
  );
}