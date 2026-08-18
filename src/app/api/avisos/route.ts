import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Aviso } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const aviso: Aviso = await req.json();

    await query(
      `INSERT INTO avisos (id, titulo, mensagem, tipo, publicoAlvo, turmaId, turmaNome, data, autor, fixado, fotoUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         titulo=VALUES(titulo),
         mensagem=VALUES(mensagem),
         tipo=VALUES(tipo),
         publicoAlvo=VALUES(publicoAlvo),
         turmaId=VALUES(turmaId),
         turmaNome=VALUES(turmaNome),
         data=VALUES(data),
         autor=VALUES(autor),
         fixado=VALUES(fixado),
         fotoUrl=VALUES(fotoUrl)`,
      [
        aviso.id,
        aviso.titulo,
        aviso.mensagem,
        aviso.tipo || 'Geral',
        aviso.publicoAlvo || 'ambos',
        aviso.turmaId || null,
        aviso.turmaNome || null,
        aviso.data || new Date().toISOString().slice(0, 10),
        aviso.autor || 'Direção',
        aviso.fixado ? 1 : 0,
        aviso.fotoUrl || null,
      ]
    );

    return NextResponse.json({ success: true, id: aviso.id });
  } catch (error: any) {
    console.error('Erro na rota /api/avisos POST:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID do aviso obrigatório' }, { status: 400 });
    }

    await query('DELETE FROM avisos WHERE id = ?', [id]);

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Erro na rota /api/avisos DELETE:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
