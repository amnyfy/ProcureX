import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  User,
  AlertCircle,
  BookOpen,
  FileCheck2,
  Calendar,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";
import Card from "../common/Card";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";
import { askCopilot } from "../../api/ai";

const QUICK_QUESTIONS = [
  { label: "Am I eligible?", icon: FileCheck2 },
  { label: "Required documents", icon: BookOpen },
  { label: "Technical requirements", icon: Sparkles },
  { label: "Financial & turnover", icon: HelpCircle },
  { label: "Important dates", icon: Calendar },
  { label: "Main risks & evaluation", icon: ShieldAlert },
];

export default function TenderCopilot({ tenderId, tenderTitle }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  async function handleSendQuestion(questionText) {
    const query = (questionText || input).trim();
    if (!query || loading) return;

    setError(null);
    setInput("");

    // Append user message
    const userMsg = { role: "user", content: query };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);

    setLoading(true);

    try {
      // Build conversation history payload for backend
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await askCopilot(tenderId, query, historyPayload);

      const assistantMsg = {
        role: "assistant",
        content: res.answer,
        sources: res.sources,
        disclaimer: res.disclaimer,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to analyze this question right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleClearConversation() {
    setMessages([]);
    setError(null);
  }

  return (
    <Card className="border-brand-200 bg-gradient-to-br from-white via-slate-50/50 to-brand-50/20 shadow-sm">
      {/* Copilot Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
            <Bot size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-brand-950">AI Tender Copilot</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-[10px] font-extrabold text-brand-800 border border-brand-200">
                <Sparkles size={11} /> Grounded AI
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Ask any question about specifications, eligibility, required documents, or risks.
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <Button
            size="sm"
            variant="secondary"
            icon={RotateCcw}
            onClick={handleClearConversation}
            title="Reset conversation history"
          >
            Clear Conversation
          </Button>
        )}
      </div>

      {/* Quick Question Chips */}
      <div className="mt-4">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Quick Questions
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map((qq, idx) => {
            const Icon = qq.icon;
            return (
              <button
                key={idx}
                type="button"
                disabled={loading}
                onClick={() => handleSendQuestion(qq.label)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
              >
                <Icon size={13} className="text-brand-600" />
                {qq.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Stream Container */}
      <div className="mt-5 space-y-4 max-h-[480px] overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white/70 p-6 text-center">
            <Bot size={32} className="mx-auto text-brand-400 mb-2" />
            <p className="text-sm font-semibold text-brand-950">
              Have questions about this tender?
            </p>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              Select a quick question above or type your question below. ProcureX Copilot uses the actual tender specifications and metadata to provide grounded answers.
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                msg.role === "user"
                  ? "bg-brand-700 text-white"
                  : "bg-slate-900 text-white"
              }`}
            >
              {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-brand-600 text-white rounded-tr-none font-medium"
                  : "bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-none space-y-3"
              }`}
            >
              {msg.role === "user" ? (
                <p className="text-sm font-medium">{msg.content}</p>
              ) : (
                <>
                  <div className="whitespace-pre-line space-y-1 font-sans text-xs">
                    {msg.content}
                  </div>

                  {/* Sources Grounding */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <span className="font-bold text-slate-700">Sources:</span>
                      <ul className="mt-1 space-y-0.5 list-disc list-inside">
                        {msg.sources.map((src, i) => (
                          <li key={i}>{src}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* AI Disclaimer */}
                  {msg.disclaimer && (
                    <div className="flex items-start gap-1.5 rounded-lg bg-amber-50/70 p-2.5 border border-amber-200/60 text-[10px] text-amber-900">
                      <AlertCircle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>AI Disclaimer:</strong> {msg.disclaimer}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white animate-pulse">
              <Bot size={16} />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-white border border-slate-200 p-4 shadow-sm text-xs text-slate-500 flex items-center gap-2">
              <Sparkles size={14} className="animate-spin text-brand-600" />
              Analyzing tender document & specifications...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ErrorMessage message={error} onDismiss={() => setError(null)} />

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuestion();
        }}
        className="mt-4 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about this tender (e.g. Am I eligible? Required documents?)..."
          disabled={loading}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-brand-950 placeholder-slate-400 shadow-sm focus:border-brand-500 focus:outline-none disabled:opacity-50"
        />
        <Button
          type="submit"
          loading={loading}
          disabled={!input.trim() || loading}
          icon={Send}
        >
          Ask Copilot
        </Button>
      </form>
    </Card>
  );
}
