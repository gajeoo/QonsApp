import { Bot, MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const KNOWLEDGE_BASE: Record<string, string> = {
  pricing:
    "QonsApp offers two plans:\n\n• **Starter** — $49/mo (up to 25 properties, staff mgmt, AI scheduling, GPS time tracking, payroll CSV export)\n• **Professional** — $149/mo (up to 150 properties, plus payroll integrations, executive analytics, amenity booking, team management)\n\nAll plans include a 14-day free trial with full access. No credit card required!",
  trial:
    "Every new QonsApp account starts with a **14-day free trial** with access to ALL features. No credit card required! After the trial, you'll need to choose a plan to continue. Sign up at the top of this page.",
  features:
    "QonsApp includes:\n\n• **AI-Powered Scheduling** — Auto-assign shifts based on availability & skills\n• **GPS Time Tracking** — Clock in/out with location verification\n• **Property Management** — Manage multiple properties from one dashboard\n• **Staff Management** — Track staff, certifications, and performance\n• **Payroll Integration** — Export to ADP, Paychex, QuickBooks\n• **Amenity Booking** — Resident reservations for pools, gyms, etc.\n• **HOA Management** — Violations, dues, board votes, ARC requests\n• **Resident Portal** — Communication, applications, screening\n• **Executive Analytics** — Real-time dashboards and reports",
  scheduling:
    "QonsApp's AI scheduling engine automatically assigns the right staff to shifts based on availability, skills, certifications, and labor rules. It reduces scheduling time by 20-30 hours per week.",
  demo: "You can start a free 14-day trial right now — no demo needed! Just click 'Start Free Trial' at the top of the page. If you'd prefer a guided tour, please reach out via our Contact page.",
  support:
    "For support, you can:\n\n1. Use this chat for quick questions\n2. Email us via the Contact page\n3. Your dedicated support team is available within your dashboard once logged in",
  hoa: "QonsApp's HOA Management suite includes:\n\n• Violation tracking and fine management\n• Dues collection with payment tracking\n• Board vote management\n• ARC (Architectural Review) requests\n• Reserve fund tracking\n• Resident messaging and announcements\n\nAvailable on the Enterprise plan or during your free trial.",
  contact:
    "You can reach us through our Contact page at /contact, or by submitting an inquiry there. Our team typically responds within 24 hours.",
};

function getAIResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes("pric") || msg.includes("cost") || msg.includes("plan") || msg.includes("how much"))
    return KNOWLEDGE_BASE.pricing;
  if (msg.includes("trial") || msg.includes("free"))
    return KNOWLEDGE_BASE.trial;
  if (msg.includes("feature") || msg.includes("what") || msg.includes("can") || msg.includes("do"))
    return KNOWLEDGE_BASE.features;
  if (msg.includes("schedul") || msg.includes("shift") || msg.includes("ai"))
    return KNOWLEDGE_BASE.scheduling;
  if (msg.includes("demo") || msg.includes("tour") || msg.includes("show"))
    return KNOWLEDGE_BASE.demo;
  if (msg.includes("support") || msg.includes("help") || msg.includes("issue") || msg.includes("problem"))
    return KNOWLEDGE_BASE.support;
  if (msg.includes("hoa") || msg.includes("association") || msg.includes("violation"))
    return KNOWLEDGE_BASE.hoa;
  if (msg.includes("contact") || msg.includes("email") || msg.includes("reach") || msg.includes("talk"))
    return KNOWLEDGE_BASE.contact;
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey"))
    return "Hello! 👋 Welcome to QonsApp. I'm here to help you learn about our AI-powered property operations platform. What would you like to know? I can tell you about our features, pricing, free trial, or anything else!";
  if (msg.includes("thank"))
    return "You're welcome! If you have any other questions, feel free to ask. Ready to try QonsApp? Start your free 14-day trial today!";

  return "I'd love to help! Here are some things I can tell you about:\n\n• **Features** — What QonsApp can do\n• **Pricing** — Our plans and costs\n• **Free Trial** — How to get started\n• **Scheduling** — AI-powered shift management\n• **HOA** — Association management tools\n\nJust ask about any of these, or describe what you need!";
}

function formatMessage(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br />");
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi there! 👋 I'm the QonsApp assistant. I can help you learn about our features, pricing, and how to get started. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const response = getAIResponse(text);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-teal px-5 py-3 text-white shadow-lg hover:bg-teal-dark transition-all hover:scale-105 active:scale-95"
        >
          <MessageCircle className="size-5" />
          <span className="text-sm font-medium hidden sm:inline">Chat with us</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[520px] max-h-[calc(100vh-100px)] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-teal text-white">
            <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">QonsApp Assistant</p>
              <p className="text-xs text-white/70">Always here to help</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="size-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-teal text-white rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: formatMessage(msg.content),
                  }}
                />
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <div className="size-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="size-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="size-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about QonsApp..."
                className="flex-1 rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim()}
                className="rounded-xl bg-teal hover:bg-teal-dark shrink-0"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
