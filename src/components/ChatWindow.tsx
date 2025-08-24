import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Upload, Send, FileText, Bot, User, Stethoscope } from "lucide-react";

type ChatMessageType = {
  sender: "user" | "bot";
  text: string;
  pdf?: string;
};

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (userQuery: string, pdfFile?: File | null) => {
    if (!userQuery.trim() && !pdfFile) return;

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userQuery, pdf: pdfFile?.name },
    ]);

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("user_query", userQuery);
      if (pdfFile) formData.append("pdf_file", pdfFile);

      const res = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data: { response?: string } = await res.json();
      console.log("API Response:", data);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.response || "⚠️ No response field in server reply.",
        },
      ]);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error connecting to server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (inputText.trim() || pdfFile) {
      sendMessage(inputText, pdfFile);
      setInputText("");
      setPdfFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    }
  };

  const ChatMessage = ({ msg }: { msg: ChatMessageType }) => {
    const isUser = msg.sender === "user";
    
    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-slide-up`}>
        <div className={`flex items-start gap-3 max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          }`}>
            {isUser ? <User size={16} /> : <Bot size={16} />}
          </div>
          
          {/* Message bubble */}
          <div className={`rounded-2xl px-4 py-3 shadow-md ${
            isUser 
              ? "bg-primary text-primary-foreground rounded-br-md" 
              : "bg-card text-card-foreground border border-border rounded-bl-md"
          }`}>
            {msg.pdf && (
              <div className="flex items-center gap-2 mb-2 text-sm opacity-75">
                <FileText size={14} />
                <span>{msg.pdf}</span>
              </div>
            )}
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto h-[90vh] bg-background shadow-2xl rounded-2xl overflow-hidden border border-border">

      {/* Header */}
      <div className="bg-card/90 backdrop-blur-sm border-b border-border p-6">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Stethoscope className="text-primary-foreground" size={24} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              {path === "/chat"
                ? "AI Health Assistant 🩺"
                : path === "/abha-bot"
                ? "Virtual Doctor Appointments"
                : "Medical AI Chat"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Upload medical reports or ask health-related questions
            </p>
          </div>
        </div>
      </div>

      {/* Chat content area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
              <Bot className="text-accent-foreground" size={32} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Welcome to your AI Health Assistant
              </h3>
              <p className="text-muted-foreground max-w-md">
                I can help analyze medical reports, answer health questions, and provide medical insights. 
                Upload a PDF report or start a conversation!
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <ChatMessage key={idx} msg={msg} />
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <Bot size={16} className="text-secondary-foreground" />
              </div>
              <div className="bg-loading-pulse text-muted-foreground rounded-2xl rounded-bl-md px-4 py-3 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm">AI Doctor is analyzing...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-card/90 backdrop-blur-sm border-t border-border p-4">
        <div className="flex flex-col space-y-3">
          {/* PDF Upload indicator */}
          {pdfFile && (
            <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
              <FileText size={16} className="text-accent-foreground" />
              <span className="text-sm text-accent-foreground">{pdfFile.name}</span>
              <button
                onClick={() => setPdfFile(null)}
                className="ml-auto text-accent-foreground hover:text-destructive transition-colors"
              >
                ×
              </button>
            </div>
          )}

          {/* Input row */}
          <div className="flex items-end gap-3">
            {/* File upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="flex-shrink-0 w-10 h-10 bg-secondary text-secondary-foreground rounded-lg flex items-center justify-center hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              <Upload size={16} />
            </button>

            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about medical reports, symptoms, or health questions..."
                disabled={loading}
                className="w-full min-h-[44px] max-h-32 px-4 py-3 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                rows={1}
              />
            </div>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={loading || (!inputText.trim() && !pdfFile)}
              className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}