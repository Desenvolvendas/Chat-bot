export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ContactDetails {
  nome: string;
  telefone: string;
  email: string;
}

export type Phase = 'chat' | 'confirm' | 'contact' | 'done';
