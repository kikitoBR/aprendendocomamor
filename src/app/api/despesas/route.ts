import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Despesa } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const despesa: Despesa = await req.json();

    await query(
      `INSERT INTO despesas (id, descricao, categoria, valor, mesReferencia, mesIndex, ano, dataVencimento, dataPagamento, status, formaPagamento, observacoes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         descricao=VALUES(descricao),
         categoria=VALUES(categoria),
         valor=VALUES(valor),
         mesReferencia=VALUES(mesReferencia),
         mesIndex=VALUES(mesIndex),
         ano=VALUES(ano),
         dataVencimento=VALUES(dataVencimento),
         dataPagamento=VALUES(dataPagamento),
         status=VALUES(status),
         formaPagamento=VALUES(formaPagamento),
         observacoes=VALUES(observacoes)`,
      [
        despesa.id,
        despesa.descricao,
        despesa.categoria || 'Manutenção & Despesas Gerais',
        despesa.valor || 0,
        despesa.mesReferencia || '',
        despesa.mesIndex || 1,
        despesa.ano || 2026,
        despesa.dataVencimento || null,
        despesa.dataPagamento || null,
        despesa.status || 'Pendente',
        despesa.formaPagamento || null,
        despesa.observacoes || '',
      ]
    );

    return NextResponse.json({ success: true, id: despesa.id });
  } catch (error: any) {
    console.error('Erro na rota /api/despesas POST:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID da despesa obrigatório' }, { status: 400 });
    }

    await query('DELETE FROM despesas WHERE id = ?', [id]);

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Erro na rota /api/despesas DELETE:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
