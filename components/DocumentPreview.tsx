'use client';

import React from 'react';
import {
  Lightbulb,
  ShieldAlert,
  Users,
  DollarSign,
  Target,
  AlertOctagon,
  Sparkles,
  Edit2,
  Check
} from 'lucide-react';

interface DocumentPreviewProps {
  document: string;
  onAdjust: () => void;
  onConfirm: () => void;
}

export default function DocumentPreview({ document, onAdjust, onConfirm }: DocumentPreviewProps) {
  // Parse document sections from markdown
  const parseSections = (text: string) => {
    const rawSections = text.split(/(?=##\s+)/);
    const parsed: { title: string; key: string; content: string }[] = [];

    for (const sec of rawSections) {
      const lines = sec.trim().split('\n');
      if (lines.length > 0 && lines[0].startsWith('## ')) {
        const title = lines[0].replace('## ', '').trim();
        const content = lines.slice(1).join('\n').trim();
        parsed.push({
          title: title,
          key: title.toUpperCase(),
          content: content
        });
      }
    }
    return parsed;
  };

  const sections = parseSections(document);

  const getIcon = (key: string) => {
    switch (key) {
      case 'IDEIA EM UMA FRASE':
        return <Lightbulb className="text-amber-500" size={20} />;
      case 'PROBLEMA QUE RESOLVE':
        return <ShieldAlert className="text-red-500" size={20} />;
      case 'CLIENTE FINAL DA IDEIA':
        return <Users className="text-blue-500" size={20} />;
      case 'MODELO DE RECEITA':
        return <DollarSign className="text-emerald-500" size={20} />;
      case 'REFERÊNCIAS E CONCORRENTES':
        return <Target className="text-indigo-500" size={20} />;
      case 'MAIOR OBSTÁCULO':
        return <AlertOctagon className="text-orange-500" size={20} />;
      case 'RECOMENDAÇÃO':
        return <Sparkles className="text-purple-500" size={20} />;
      default:
        return <Lightbulb className="text-blue-500" size={20} />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-slate-200/60 dark:border-zinc-800/60 rounded-3xl p-6 md:p-8 shadow-2xl transition-all duration-500 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-6 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
            Documento de Ideia Estruturado
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Aqui está a consolidação executiva da sua proposta de negócio.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onAdjust}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors border border-transparent dark:border-zinc-800"
          >
            <Edit2 size={16} />
            Ajustar Ideia
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/10 hover:shadow-lg"
          >
            <Check size={16} />
            Confirmar e Enviar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, idx) => {
          const isFullWidth =
            section.key === 'IDEIA EM UMA FRASE' || section.key === 'RECOMENDAÇÃO';
          const isRecommendation = section.key === 'RECOMENDAÇÃO';
          const isApproved = isRecommendation && section.content.toUpperCase().includes('SIM');

          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all duration-300 ${
                isRecommendation
                  ? isApproved
                    ? 'bg-emerald-50/50 border-emerald-200/50 dark:bg-emerald-950/10 dark:border-emerald-800/30'
                    : 'bg-rose-50/50 border-rose-200/50 dark:bg-rose-950/10 dark:border-rose-800/30'
                  : 'bg-slate-50/50 border-slate-100 dark:bg-zinc-900/20 dark:border-zinc-800/30'
              } ${isFullWidth ? 'md:col-span-2' : ''}`}
            >
              <div className="flex items-center gap-2.5 mb-3">
                {getIcon(section.key)}
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                  {section.title}
                </h3>
              </div>
              <div className="text-sm md:text-base leading-relaxed text-slate-600 dark:text-zinc-300 whitespace-pre-wrap">
                {section.content}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
