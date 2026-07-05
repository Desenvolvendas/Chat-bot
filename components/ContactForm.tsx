'use client';

import React, { useState } from 'react';
import { Mail, Phone, User, Send, Loader2 } from 'lucide-react';
import { ContactDetails } from '@/lib/types';

interface ContactFormProps {
  onSubmit: (details: ContactDetails) => Promise<void>;
}

export default function ContactForm({ onSubmit }: ContactFormProps) {
  const [details, setDetails] = useState<ContactDetails>({
    nome: '',
    telefone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.nome.trim() || !details.telefone.trim() || !details.email.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit(details);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao enviar a sua ideia.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-slate-200/60 dark:border-zinc-800/60 rounded-3xl p-6 md:p-8 shadow-2xl transition-all duration-500 animate-scale-up">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
          Dados de Contato
        </h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
          Identifique-se para que possamos entrar em contato e enviar seu documento.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-150 rounded-xl dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
            Nome Completo
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-zinc-500">
              <User size={18} />
            </span>
            <input
              type="text"
              required
              disabled={loading}
              value={details.nome}
              onChange={(e) => setDetails({ ...details, nome: e.target.value })}
              placeholder="Ex: João Silva"
              className="w-full pl-10 pr-4 py-3 text-base rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 dark:focus:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:ring-blue-500/10 dark:focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
            Telefone
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-zinc-500">
              <Phone size={18} />
            </span>
            <input
              type="tel"
              required
              disabled={loading}
              value={details.telefone}
              onChange={(e) => setDetails({ ...details, telefone: e.target.value })}
              placeholder="Ex: (11) 99999-9999"
              className="w-full pl-10 pr-4 py-3 text-base rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 dark:focus:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:ring-blue-500/10 dark:focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
            E-mail
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-zinc-500">
              <Mail size={18} />
            </span>
            <input
              type="email"
              required
              disabled={loading}
              value={details.email}
              onChange={(e) => setDetails({ ...details, email: e.target.value })}
              placeholder="Ex: joao@empresa.com"
              className="w-full pl-10 pr-4 py-3 text-base rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 dark:focus:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:ring-blue-500/10 dark:focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 font-semibold text-white bg-gradient-to-r from-[#22C55E] to-[#0F5132] hover:from-[#1eb054] hover:to-[#0b3c25] rounded-xl transition-all shadow-md shadow-emerald-500/15 hover:shadow-lg disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Enviando ideia...
            </>
          ) : (
            <>
              <Send size={18} />
              Confirmar e Enviar Ideia
            </>
          )}
        </button>
      </form>
    </div>
  );
}
