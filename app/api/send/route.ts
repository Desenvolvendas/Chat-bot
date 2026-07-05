import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { nome, telefone, email, documento } = await req.json();

    if (!nome || !telefone || !email || !documento) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM;
    const to = process.env.RESEND_TO;

    if (!apiKey || !from || !to) {
      return NextResponse.json({ error: 'Resend configuration missing in environment variables' }, { status: 500 });
    }

    const resend = new Resend(apiKey);

    // Convert simple markdown structure to a well-styled email HTML
    const docHtml = documento
      .split('\n')
      .map((line: string) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('## ')) {
          return `<h3 style="color:#0f172a; font-size:16px; font-weight:bold; margin-top:20px; margin-bottom:8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em;">${trimmed.substring(3)}</h3>`;
        }
        if (trimmed.startsWith('- ')) {
          return `<li style="margin-left:15px; margin-bottom:4px; color:#334155; font-size: 14px;">${trimmed.substring(2)}</li>`;
        }
        if (trimmed === '') {
          return '';
        }
        const boldProcessed = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return `<p style="margin: 6px 0; color:#334155; font-size: 14px; line-height: 1.6;">${boldProcessed}</p>`;
      })
      .filter((line: string) => line !== '')
      .join('\n');

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 800; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Nova Ideia Recebida</h2>
        
        <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 20px; border-radius: 8px; margin-top: 20px; margin-bottom: 25px;">
          <h4 style="margin: 0 0 10px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Dados do Remetente</h4>
          <p style="margin: 6px 0; font-size: 14px; color: #0f172a;"><strong>Nome:</strong> ${nome}</p>
          <p style="margin: 6px 0; font-size: 14px; color: #0f172a;"><strong>Telefone:</strong> ${telefone}</p>
          <p style="margin: 6px 0; font-size: 14px; color: #0f172a;"><strong>E-mail:</strong> ${email}</p>
        </div>
        
        <div>
          ${docHtml}
        </div>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color:#94a3b8; font-size:11px; text-align: center; margin-bottom: 0; text-transform: uppercase; letter-spacing: 0.05em;">Enviado via chatbot de ideias — Desenvolvem</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: from,
      to: to,
      subject: `Nova ideia recebida — ${nome}`,
      html: htmlBody,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });

  } catch (error: any) {
    console.error('Error in send API route:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
