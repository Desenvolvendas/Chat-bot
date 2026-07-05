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

          // Check if document was completed in stream using regex
          const docRegex = /##\s*IDEIA\s+EM\s+U[MN]A\s+FRASE/i;
          const hasDoc = docRegex.test(assistantContent);

          if (hasDoc) {
            const match = assistantContent.match(docRegex);
            if (match && match.index !== undefined) {
              const docText = assistantContent.slice(match.index);
              setIdeaDocument(docText);
            }
          }

          if (done) {
            // Once complete, if there's a document, transition to confirm phase
            if (hasDoc) {
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
    setIdeaDocument(null); // Clear document so they can type adjustment
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
    <div className={`min-h-screen flex flex-col w-full max-w-full overflow-x-hidden transition-colors duration-300 ${darkMode ? 'bg-zinc-950 text-zinc-50' : 'bg-slate-50 text-slate-900'}`}>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b bg-white/70 border-slate-200/50 dark:bg-zinc-900/70 dark:border-zinc-800/50 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-2.5">
            <img src="/logo-cropped.png" alt="Desenvolvem Logo" className="h-8 md:h-9 w-auto object-contain shrink-0" />
            <div>
              <span className="font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 text-lg md:text-xl">Desenvolve<span className="text-[#22C55E]">m</span></span>
              <span className="text-[9px] md:text-[10px] block font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider md:tracking-widest leading-none mt-0.5">VALIDADOR DE IDEIAS</span>
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
                <span className="hidden sm:inline">Reiniciar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Sticky Stepper progress bar (visible when not on welcome screen) */}
      {!isWelcomeScreen && (
        <div className="sticky top-[64px] z-30 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-zinc-900/50 py-2 md:py-3 transition-all duration-300">
          <div className="max-w-xl mx-auto w-full px-4 md:px-6">
            <div className="flex items-center justify-between relative">
              {/* Background Progress Line */}
              <div className="absolute left-4 right-4 top-[14px] md:top-[16px] h-0.5 bg-slate-200 dark:bg-zinc-800 -z-10">
                <div 
                  className="h-full bg-gradient-to-r from-[#22C55E] to-teal-500 transition-all duration-500" 
                  style={{ 
                    width: `${
                      phase === 'chat' ? 0 : 
                      phase === 'confirm' ? 33.3 : 
                      phase === 'contact' ? 66.6 : 100
                    }%` 
                  }}
                />
              </div>
              
              {[
                { id: 'chat', label: 'Entrevista' },
                { id: 'confirm', label: 'Revisão' },
                { id: 'contact', label: 'Dados' },
                { id: 'done', label: 'Concluído' }
              ].map((step, idx) => {
                const phaseOrder = ['chat', 'confirm', 'contact', 'done'];
                const currentIdx = phaseOrder.indexOf(phase);
                const stepIdx = phaseOrder.indexOf(step.id);
                const status = currentIdx > stepIdx ? 'completed' : currentIdx === stepIdx ? 'active' : 'upcoming';
                
                return (
                  <div key={step.id} className="flex flex-col items-center relative z-10">
                    <div 
                      className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                        status === 'completed'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : status === 'active'
                          ? 'bg-white border-emerald-500 text-emerald-500 dark:bg-zinc-950 dark:border-emerald-400 dark:text-emerald-400 shadow-md shadow-emerald-500/10 scale-110'
                          : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-600'
                      }`}
                    >
                      {status === 'completed' ? (
                        <CheckCircle size={14} className="md:w-4 md:h-4" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span 
                      className={`text-[9px] md:text-xs font-semibold mt-1.5 transition-colors duration-300 ${
                        status === 'active'
                          ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                          : status === 'completed'
                          ? 'text-slate-700 dark:text-zinc-300'
                          : 'text-slate-400 dark:text-zinc-600'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
                className="w-full p-4 text-base rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 dark:focus:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:ring-emerald-500/10 dark:focus:border-emerald-500 resize-none transition-all"
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
          <div className="flex-1 flex flex-col h-full justify-between animate-fade-in">
            {phase === 'chat' && (
              /* Chat Workspace */
              <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto">
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-6 max-h-[calc(100vh-340px)] md:max-h-[calc(100vh-270px)]">
                  {messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg} />
                  ))}

                  {loading && (
                    <div className="flex items-center gap-2 py-4 justify-start">
                      <div className="flex h-8 w-8 md:h-9 md:w-9 shrink-0 select-none items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/50 p-1 md:p-1.5 shadow-sm">
                        <img src="/logo-cropped.png" alt="Desenvolvem" className="h-full w-full object-contain animate-pulse" />
                      </div>
                      <span className="text-sm font-medium text-slate-400 dark:text-zinc-500">
                        Desenvolvem está digitando...
                      </span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar or Action Banner */}
                <div className="border-t border-slate-200/50 dark:border-zinc-800/50 pt-4 bg-transparent">
                  {ideaDocument && !loading ? (
                    <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in mb-4">
                      <div className="flex items-center gap-3 text-left">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                          <Sparkles size={20} className="animate-pulse" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-200">
                            Documento de Ideia Gerado!
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">
                            O consultor inteligente concluiu a análise da sua ideia.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setPhase('confirm')}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 font-bold text-white bg-gradient-to-r from-[#22C55E] to-[#0F5132] hover:from-[#1eb054] hover:to-[#0b3c25] rounded-xl transition-all shadow-md shadow-emerald-500/15 hover:shadow-lg animate-bounce-slow shrink-0 cursor-pointer"
                      >
                        Revisar e Prosseguir
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  ) : (
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
                        className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:ring-emerald-500/10 dark:focus:border-emerald-500 transition-all text-base"
                      />
                      <button
                        onClick={() => handleSendMessage(input)}
                        disabled={loading || !input.trim()}
                        className="p-2.5 md:p-3 bg-gradient-to-r from-[#22C55E] to-[#0F5132] text-white rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-lg disabled:opacity-40 transition-all shrink-0"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  )}
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
                  {contactDetails?.nome}, obrigado por submeter a sua ideia de negócio. O documento estruturado já foi encaminhado para a equipe da Desenvolvem. Entraremos em contato em breve através do e-mail <strong>{contactDetails?.email}</strong>.
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
        <p>© 2026 Desenvolvem. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
