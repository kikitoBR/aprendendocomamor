import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Mensalidade } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const mensalidades: Mensalidade[] = Array.isArray(body) ? body : [body];

    for (const m of mensalidades) {
      await query(
        `INSERT INTO mensalidades (id, alunoId, alunoNome, turmaNome, mesReferencia, mesIndex, ano, numeroParcela, valorOriginal, desconto, acrescimo, valorFinal, dataVencimento, dataPagamento, status, formaPagamento, numeroRecibo, observacoes, pagoPor, registradoPor)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           alunoNome=VALUES(alunoNome),
           turmaNome=VALUES(turmaNome),
           valorOriginal=VALUES(valorOriginal),
           desconto=VALUES(desconto),
           acrescimo=VALUES(acrescimo),
           valorFinal=VALUES(valorFinal),
           dataVencimento=VALUES(dataVencimento),
           dataPagamento=VALUES(dataPagamento),
           status=VALUES(status),
           formaPagamento=VALUES(formaPagamento),
           numeroRecibo=VALUES(numeroRecibo),
           observacoes=VALUES(observacoes),
           pagoPor=VALUES(pagoPor),
           registradoPor=VALUES(registradoPor)`,
        [
          m.id,
          m.alunoId,
          m.alunoNome,
          m.turmaNome || '',
          m.mesReferencia || '',
          m.mesIndex || 1,
          m.ano || 2026,
          m.numeroParcela || 1,
          m.valorOriginal || 0,
          m.desconto || 0,
          m.acrescimo || 0,
          m.valorFinal || 0,
          m.dataVencimento || '',
          m.dataPagamento || null,
          m.status || 'Pendente',
          m.formaPagamento || null,
          m.numeroRecibo || null,
          m.observacoes || '',
          m.pagoPor || null,
          m.registradoPor || null,
        ]
      );
    }

    return NextResponse.json({ success: true, count: mensalidades.length });
  } catch (error: any) {
    console.error('Erro na rota /api/mensalidades POST:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, data }: { id: string; data: Partial<Mensalidade> } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID da mensalidade obrigatório' }, { status: 400 });
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.dataPagamento !== undefined) {
      fields.push('dataPagamento = ?');
      values.push(data.dataPagamento);
    }
    if (data.formaPagamento !== undefined) {
      fields.push('formaPagamento = ?');
      values.push(data.formaPagamento);
    }
    if (data.numeroRecibo !== undefined) {
      fields.push('numeroRecibo = ?');
      values.push(data.numeroRecibo);
    }
    if (data.desconto !== undefined) {
      fields.push('desconto = ?');
      values.push(data.desconto);
    }
    if (data.acrescimo !== undefined) {
      fields.push('acrescimo = ?');
      values.push(data.acrescimo);
    }
    if (data.valorFinal !== undefined) {
      fields.push('valorFinal = ?');
      values.push(data.valorFinal);
    }
    if (data.observacoes !== undefined) {
      fields.push('observacoes = ?');
      values.push(data.observacoes);
    }
    if (data.pagoPor !== undefined) {
      fields.push('pagoPor = ?');
      values.push(data.pagoPor);
    }
    if (data.registradoPor !== undefined) {
      fields.push('registradoPor = ?');
      values.push(data.registradoPor);
    }

    if (fields.length > 0) {
      values.push(id);
      await query(`UPDATE mensalidades SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Erro na rota /api/mensalidades PUT:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
