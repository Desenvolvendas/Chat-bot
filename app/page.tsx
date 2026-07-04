'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  ArrowRight,
  Send,
  Loader2,
  CheckCircle,
  Lightbulb,
  Sun,
  Moon,
  Building,
  RotateCcw
} from 'lucide-react';
import { Message, ContactDetails, Phase } from '@/lib/types';
import ChatMessage from '@/components/ChatMessage';
import DocumentPreview from '@/components/DocumentPreview';
import ContactForm from '@/components/ContactForm';
import { INITIAL_QUESTION } from '@/lib/prompts';

export default function Home() {
  const [phase, setPhase] = useState<Phase>('chat'); // start with chat to introduce welcome message, or build custom welcome phase
  const [isWelcomeScreen, setIsWelcomeScreen] = useState(true);
  const [initialIdea, setInitialIdea] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ideaDocument, setIdeaDocument] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [contactDetails, setContactDetails] = useState<ContactDetails | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Dark mode class toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Start the interview with initial idea
  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialIdea.trim()) return;

    setIsWelcomeScreen(false);
    setPhase('chat');

    // Add user's initial idea
    const userMsg: Message = { role: 'user', content: initialIdea };
    const welcomeMsg: Message = { role: 'assistant', content: INITIAL_QUESTION };

    setMessages([userMsg, welcomeMsg]);
    setInitialIdea('');
  };

  // Send a chat message
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: textToSend };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na conexão.');
      }

      // Add a placeholder for assistant message
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          const chunk = decoder.decode(value);
          assistantContent += chunk;

          setMessages((prev) => {
            const next = [...prev];
            if (next.length > 0 && next[next.length - 1].role === 'assistant') {
              next[next.length - 1].content = assistantContent;
            }
            return next;
          });

          // Check if document was completed in stream
          if (assistantContent.includes('## IDEIA EM UMA FRASE')) {
            const docIndex = assistantContent.indexOf('## IDEIA EM UMA FRASE');
            const docText = assistantContent.slice(docIndex);
            setIdeaDocument(docText);
          }

          if (done) {
            // Once complete, if there's a document, transition to confirm phase
            if (assistantContent.includes('## IDEIA EM UMA FRASE')) {
              setTimeout(() => {
                setPhase('confirm');
              }, 800);
            }
            break;
          }
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Desculpe, ocorreu um erro: ${error.message || 'Erro desconhecido'}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustDocument = () => {
    // Transition back to chat and prompt the user
    setPhase('chat');
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: 'Claro! O que você gostaria de ajustar no documento? Pode me dizer os detalhes e eu reescrevo.' }
    ]);
  };

  const handleConfirmDocument = () => {
    setPhase('contact');
  };

  const handleContactSubmit = async (details: ContactDetails) => {
    setContactDetails(details);

    const response = await fetch('/api/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: details.nome,
        telefone: details.telefone,
        email: details.email,
        documento: ideaDocument
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Falha ao enviar e-mail.');
    }

    setPhase('done');
  };

  const handleReset = () => {
    setIsWelcomeScreen(true);
    setPhase('chat');
    setMessages([]);
    setIdeaDocument(null);
    setContactDetails(null);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-zinc-950 text-zinc-50' : 'bg-slate-50 text-slate-900'}`}>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b bg-white/70 border-slate-200/50 dark:bg-zinc-900/70 dark:border-zinc-800/50 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo-icon.svg" alt="Desenvolvem Logo" className="h-9 w-auto" />
            <div>
              <span className="font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 text-xl">desenvolv<span className="text-[#22C55E]">em</span></span>
              <span className="text-[10px] block font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none">VALIDADOR DE IDEIAS</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-400 border border-transparent dark:border-zinc-800 transition-colors"
              title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {(!isWelcomeScreen || phase === 'done') && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-zinc-300 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-transparent dark:border-zinc-800 transition-colors"
              >
                <RotateCcw size={14} />
                Reiniciar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center max-w-6xl w-full mx-auto p-4 md:p-6">

        {isWelcomeScreen ? (
          /* Welcome Screen */
          <div className="max-w-2xl mx-auto w-full text-center py-12 md:py-20 animate-scale-up">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#22C55E]/10 to-[#FACC15]/10 text-[#22C55E] dark:text-[#22C55E] mb-6 shadow-sm border border-[#22C55E]/15">
              <Lightbulb size={28} className="animate-pulse" />
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Consolide sua ideia de{' '}
              <span className="bg-gradient-to-r from-[#22C55E] to-[#FACC15] bg-clip-text text-transparent">
                Negócio
              </span>
            </h1>

            <p className="text-lg text-slate-500 dark:text-zinc-400 max-w-lg mx-auto mb-10">
              Responda a algumas perguntas interativas. Nossa inteligência artificial vai estruturar um documento executivo para você submeter aos avaliadores.
            </p>

            <form onSubmit={handleStart} className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 p-5 rounded-3xl shadow-xl max-w-xl mx-auto">
              <label className="block text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2.5">
                Qual é a sua ideia?
              </label>
              <textarea
                required
                rows={3}
                value={initialIdea}
                onChange={(e) => setInitialIdea(e.target.value)}
                placeholder="Ex: Quero criar um aplicativo de delivery de comida caseira focado em dietas personalizadas..."
                className="w-full p-4 text-sm md:text-base rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 dark:focus:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:ring-emerald-500/10 dark:focus:border-emerald-500 resize-none transition-all"
              />
              <button
                type="submit"
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 font-semibold text-white bg-gradient-to-r from-[#22C55E] to-[#0F5132] hover:from-[#1eb054] hover:to-[#0b3c25] rounded-xl transition-all shadow-md shadow-emerald-500/15 hover:shadow-lg"
              >
                Começar Entrevista
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        ) : (
          /* Interview Workflow phases */
          <div className="flex-1 flex flex-col h-full justify-between">
            {phase === 'chat' && (
              /* Chat Workspace */
              <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto">
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-6" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                  {messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg} />
                  ))}

                  {loading && (
                    <div className="flex items-center gap-2 py-4 justify-start">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#0F5132] text-white shadow-md shadow-emerald-500/10">
                        <Loader2 className="animate-spin" size={16} />
                      </div>
                      <span className="text-sm font-medium text-slate-400 dark:text-zinc-500 animate-pulse">
                        desenvolvem está digitando...
                      </span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="border-t border-slate-200/50 dark:border-zinc-800/50 pt-4 bg-transparent">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      disabled={loading}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendMessage(input);
                      }}
                      placeholder="Digite sua resposta aqui..."
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:ring-emerald-500/10 dark:focus:border-emerald-500 transition-all text-sm md:text-base"
                    />
                    <button
                      onClick={() => handleSendMessage(input)}
                      disabled={loading || !input.trim()}
                      className="p-3 bg-gradient-to-r from-[#22C55E] to-[#0F5132] text-white rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-lg disabled:opacity-40 transition-all shrink-0"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {phase === 'confirm' && ideaDocument && (
              /* Document Confirmation Phase */
              <div className="flex-1 flex flex-col justify-center animate-fade-in">
                <DocumentPreview
                  document={ideaDocument}
                  onAdjust={handleAdjustDocument}
                  onConfirm={handleConfirmDocument}
                />
              </div>
            )}

            {phase === 'contact' && (
              /* Contact Info Phase */
              <div className="flex-1 flex flex-col justify-center">
                <ContactForm onSubmit={handleContactSubmit} />
              </div>
            )}

            {phase === 'done' && (
              /* Success Phase */
              <div className="max-w-md mx-auto w-full text-center py-16 animate-scale-up">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 mb-6 shadow-sm shadow-emerald-500/10 border border-emerald-500/10">
                  <CheckCircle size={36} className="animate-bounce" />
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight mb-3">
                  Ideia Enviada com Sucesso!
                </h1>

                <p className="text-slate-500 dark:text-zinc-400 mb-8 leading-relaxed">
                  {contactDetails?.nome}, obrigado por submeter a sua ideia de negócio. O documento estruturado já foi encaminhado para a equipe da desenvolvem. Entraremos em contato em breve através do e-mail <strong>{contactDetails?.email}</strong>.
                </p>

                <button
                  onClick={handleReset}
                  className="px-6 py-3 font-semibold text-white bg-gradient-to-r from-[#22C55E] to-[#0F5132] hover:from-[#1eb054] hover:to-[#0b3c25] rounded-xl transition-all shadow-md shadow-emerald-500/15 hover:shadow-lg"
                >
                  Submeter Nova Ideia
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200/50 dark:border-zinc-900 text-center text-xs text-slate-400 dark:text-zinc-600 transition-colors duration-300">
        <p>© 2026 desenvolvem. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
