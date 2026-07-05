'use client';

import React from 'react';
import { Bot, User } from 'lucide-react';
import { Message } from '@/lib/types';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={`flex w-full items-start gap-2 md:gap-4 py-3 md:py-4 animate-fade-in-up ${
        isAssistant ? 'justify-start' : 'justify-end'
      }`}
    >
      {isAssistant && (
        <div className="flex h-8 w-8 md:h-9 md:w-9 shrink-0 select-none items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/50 p-1 md:p-1.5 shadow-sm">
          <img src="/logo-cropped.png" alt="Desenvolvem" className="h-full w-full object-contain" />
        </div>
      )}

      <div
        className={`relative max-w-[82%] sm:max-w-[80%] rounded-2xl px-3.5 py-2.5 md:px-4 md:py-3 text-sm md:text-base leading-relaxed shadow-sm transition-all duration-300 ${
          isAssistant
            ? 'bg-white text-slate-800 border border-slate-100 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/10'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <span
          className={`absolute bottom-0 w-2 h-2 rotate-45 ${
            isAssistant
              ? '-left-1 bg-white border-l border-b border-slate-100 dark:bg-zinc-900 dark:border-zinc-800'
              : '-right-1 bg-indigo-600'
          }`}
          style={{ bottom: '14px' }}
        />
      </div>

      {!isAssistant && (
        <div className="flex h-8 w-8 md:h-9 md:w-9 shrink-0 select-none items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-md shadow-slate-700/10 dark:from-zinc-700 dark:to-zinc-900">
          <User size={16} />
        </div>
      )}
    </div>
  );
}
