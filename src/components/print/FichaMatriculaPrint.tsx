'use client';

import React from 'react';
import { Student, EscolaConfig } from '@/types';
import { formatarDataBR } from '@/utils/helpers';
import { Logo } from '@/components/Logo';
import { Printer, X } from 'lucide-react';

interface FichaMatriculaPrintProps {
  student: Student;
  config: EscolaConfig;
  onClose?: () => void;
}

export const FichaMatriculaPrint: React.FC<FichaMatriculaPrintProps> = ({
  student,
  config,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex justify-center items-start p-2 sm:p-4 print-only-modal print:p-0 print:m-0 print:bg-white print:static print:inset-auto">
      {/* Estilos Globais de Impressão para Garantir 1 Página A4 Rigorosa */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 4mm 6mm;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-only-modal {
            display: block !important;
            position: static !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          .ficha-a4-page {
            height: 285mm !important;
            max-height: 285mm !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Botões de Ação na Tela (escondidos na impressão) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 print:hidden bg-white/95 p-2 rounded-2xl shadow-2xl border border-slate-200 backdrop-blur">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-md transition text-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Ficha Oficial (1 Página A4)</span>
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            title="Fechar Visualização"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Folha A4 Oficial da Ficha (Preenche toda a altura de 285mm em 1 Página A4 Fixa) */}
      <div className="ficha-a4-page w-full max-w-[210mm] min-h-[285mm] bg-white text-black p-5 sm:p-6 shadow-2xl print:shadow-none print:p-0 print:m-0 border border-slate-200 print:border-none font-sans text-[11px] leading-tight flex flex-col justify-between my-2 sm:my-4">
        <div>
          {/* Cabeçalho Oficial com Logo e Foto */}
          <div className="border-2 border-black grid grid-cols-12 mb-2">
            {/* Logo e Dados da Escola */}
            <div className="col-span-9 p-3 border-r-2 border-black flex items-center gap-3.5">
              <div className="shrink-0">
                <Logo size="sm" showSubtitle={false} />
              </div>
              <div className="space-y-0.5 text-center flex-1 pr-1">
                <h2 className="font-black text-xs sm:text-sm tracking-wide text-black uppercase">
                  {config.nome}
                </h2>
                <p className="text-[10px] font-semibold text-slate-800">
                  Celular: {config.telefonePrincipal} / {config.telefoneSecundario}
                </p>
                <p className="text-[9.5px] text-slate-700">
                  {config.endereco}, {config.bairro} – {config.cidade}/{config.uf}. CEP: {config.cep}
                </p>
              </div>
            </div>

            {/* Quadrado para Foto do Aluno 3x4 */}
            <div className="col-span-3 p-1 flex flex-col items-center justify-center bg-slate-50/50 relative min-h-[90px]">
              {student.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={student.fotoUrl}
                  alt={student.nome}
                  className="w-18 h-22 object-cover rounded border border-black shadow-inner"
                />
              ) : (
                <div className="w-16 h-20 border-2 border-dashed border-slate-400 flex flex-col items-center justify-center text-slate-500 text-center p-1">
                  <span className="font-bold text-[10px] tracking-wider">FOTO</span>
                  <span className="text-[8px]">3 x 4</span>
                </div>
              )}
            </div>
          </div>

          {/* Título da Ficha */}
          <div className="border-2 border-black bg-slate-100 py-1 text-center font-black text-xs uppercase tracking-wider mb-2 shadow-2xs">
            FICHA DE MATRÍCULA ESCOLAR • ANO LETIVO {student.anoLetivo || config.anoLetivoAtivo}
          </div>

          {/* Nome do Aluno */}
          <div className="border-2 border-black p-1.5 mb-2 flex items-center gap-2 bg-slate-50/30">
            <span className="font-black text-[11px] tracking-wider">NOME DO ALUNO: </span>
            <span className="uppercase font-extrabold tracking-wide text-xs text-slate-950">{student.nome}</span>
          </div>

          {/* Tabela de Dados Civis */}
          <div className="border-2 border-black mb-2 divide-y-2 divide-black">
            <div className="grid grid-cols-12 divide-x-2 divide-black p-1.5">
              <div className="col-span-8">
                <span className="font-bold">CERTIDÃO DE NASCIMENTO: </span>
                <span className="font-medium">{student.certidaoNascimento?.numeroRegistro || '________________________________________'}</span>
              </div>
              <div className="col-span-4 pl-2">
                <span className="font-bold">NACIONALIDADE: </span>
                <span>{student.nacionalidade || 'Brasileira'}</span>
              </div>
            </div>

            <div className="grid grid-cols-12 divide-x-2 divide-black p-1.5">
              <div className="col-span-6">
                <span className="font-bold">Nº DE REGISTRO: </span>
                <span className="font-medium">{student.certidaoNascimento?.numeroRegistro?.split(' ')[0] || '-'}</span>
              </div>
              <div className="col-span-6 pl-2">
                <span className="font-bold">LIVRO E FOLHA: </span>
                <span className="font-medium">{student.certidaoNascimento?.livroEFolha || '-'}</span>
              </div>
            </div>

            <div className="grid grid-cols-12 divide-x-2 divide-black p-1.5">
              <div className="col-span-6">
                <span className="font-bold">IDENTIDADE (RG): </span>
                <span className="font-medium">{student.identidade || '-'}</span>
              </div>
              <div className="col-span-6 pl-2">
                <span className="font-bold">CPF: </span>
                <span className="font-mono font-bold">{student.cpf || '-'}</span>
              </div>
            </div>

            <div className="grid grid-cols-12 divide-x-2 divide-black p-1.5">
              <div className="col-span-5">
                <span className="font-bold">DATA DE NASCIMENTO: </span>
                <span className="font-bold">{formatarDataBR(student.dataNascimento)}</span>
              </div>
              <div className="col-span-4 pl-2">
                <span className="font-bold">MATRÍCULA: </span>
                <span className="font-mono font-black text-slate-900">{student.matricula}</span>
              </div>
              <div className="col-span-3 pl-2">
                <span className="font-bold">SEXO: </span>
                <span className="font-bold">M ( {student.sexo === 'M' ? 'X' : ' '} ) &nbsp; F ( {student.sexo === 'F' ? 'X' : ' '} )</span>
              </div>
            </div>
          </div>

          {/* Seção Responsáveis */}
          <div className="border-2 border-black mb-2">
            <div className="bg-slate-100 font-black text-center py-0.5 border-b-2 border-black uppercase text-[9.5px] tracking-wider">
              FILIAÇÃO E RESPONSÁVEIS LEGAIS
            </div>
            <div className="grid grid-cols-2 divide-x-2 divide-black p-2 gap-3">
              {/* Mãe */}
              <div className="space-y-1">
                <div>
                  <span className="font-bold">MÃE: </span>
                  <span className="font-bold uppercase">{student.responsaveis.mae.nome || '__________________________________'}</span>
                </div>
                <div>
                  <span className="font-bold">CPF: </span>
                  <span className="font-mono">{student.responsaveis.mae.cpf || '___.___.___-__'}</span>
                </div>
                <div>
                  <span className="font-bold">Local de trabalho: </span>
                  <span>{student.responsaveis.mae.localTrabalho || '__________________________________'}</span>
                </div>
                <div>
                  <span className="font-bold">Telefone: </span>
                  <span className="font-bold text-slate-900">{student.responsaveis.mae.telefone || '(__) _________'}</span>
                </div>
              </div>

              {/* Pai */}
              <div className="space-y-1 pl-3">
                <div>
                  <span className="font-bold">PAI: </span>
                  <span className="font-bold uppercase">{student.responsaveis.pai.nome || '__________________________________'}</span>
                </div>
                <div>
                  <span className="font-bold">CPF: </span>
                  <span className="font-mono">{student.responsaveis.pai.cpf || '___.___.___-__'}</span>
                </div>
                <div>
                  <span className="font-bold">Local de trabalho: </span>
                  <span>{student.responsaveis.pai.localTrabalho || '__________________________________'}</span>
                </div>
                <div>
                  <span className="font-bold">Telefone: </span>
                  <span className="font-bold text-slate-900">{student.responsaveis.pai.telefone || '(__) _________'}</span>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-black p-2 space-y-1 bg-slate-50/60 text-[10.5px]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-bold">Número de emergência: </span>
                  <span className="font-bold text-slate-900">{student.responsaveis.numeroEmergencia || '(__) _________'}</span>
                </div>
                <div>
                  <span className="font-bold">Número reserva: </span>
                  <span className="font-bold text-slate-900">{student.responsaveis.numeroReserva || '(__) _________'}</span>
                </div>
              </div>
              <div>
                <span className="font-bold">Email de contato: </span>
                <span>{student.responsaveis.email || '____________________________________________________'}</span>
              </div>
            </div>
          </div>

          {/* Seção Endereço */}
          <div className="border-2 border-black mb-2">
            <div className="bg-slate-100 font-black text-center py-0.5 border-b-2 border-black uppercase text-[9.5px] tracking-wider">
              ENDEREÇO RESIDENCIAL & TURNO
            </div>
            <div className="p-2 space-y-1.5">
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-8">
                  <span className="font-bold">RUA: </span>
                  <span>{student.endereco.rua} {student.endereco.complemento ? `, ${student.endereco.complemento}` : ''}</span>
                </div>
                <div className="col-span-4">
                  <span className="font-bold">BAIRRO: </span>
                  <span>{student.endereco.bairro}</span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4">
                  <span className="font-bold">NÚMERO: </span>
                  <span>{student.endereco.numeroCasa}</span>
                </div>
                <div className="col-span-4">
                  <span className="font-bold">UF: </span>
                  <span>{student.endereco.uf || 'RJ'}</span>
                </div>
                <div className="col-span-4">
                  <span className="font-bold">CEP: </span>
                  <span>{student.endereco.cep || 'Não informado'}</span>
                </div>
              </div>

              <div className="border-t border-black pt-1 mt-0.5 flex items-center justify-between text-[10.5px]">
                <div>
                  <span className="font-bold">Turno: </span>
                  <span className="font-bold">
                    ( {student.turno === 'Manhã' ? 'X' : ' '} ) Manhã &nbsp;&nbsp;&nbsp;
                    ( {student.turno === 'Tarde' ? 'X' : ' '} ) Tarde &nbsp;&nbsp;&nbsp;
                    ( {student.turno === 'Integral' ? 'X' : ' '} ) Integral
                  </span>
                </div>
                <div>
                  <span className="font-bold">Horário: </span>
                  <span className="font-bold">{student.horario || 'Das 13:00 às 17:00'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de Renovação da Matrícula */}
          <div className="border-2 border-black mb-2">
            <div className="bg-slate-100 font-black text-center py-0.5 border-b-2 border-black uppercase text-[9.5px] tracking-wider">
              HISTÓRICO E RENOVAÇÃO DA MATRÍCULA
            </div>
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-slate-50 text-[9.5px]">
                  <th className="border-r-2 border-black py-1 px-1.5 w-14">Ano</th>
                  <th className="border-r-2 border-black py-1 px-1.5 w-16">Idade</th>
                  <th className="border-r-2 border-black py-1 px-1.5">Turma</th>
                  <th className="border-r-2 border-black py-1 px-1.5 w-20">Matrícula</th>
                  <th className="border-r-2 border-black py-1 px-1.5 w-28">Data da Renovação</th>
                  <th className="py-1 px-1.5">Ass. do Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black text-[9.5px]">
                {student.renovacoes.map((renov, index) => (
                  <tr key={index} className="h-6">
                    <td className="border-r-2 border-black py-1 px-1.5 font-bold">{renov.ano}</td>
                    <td className="border-r-2 border-black py-1 px-1.5">{renov.idade}</td>
                    <td className="border-r-2 border-black py-1 px-1.5 font-semibold">{renov.turma}</td>
                    <td className="border-r-2 border-black py-1 px-1.5 font-mono font-bold">{renov.matricula}</td>
                    <td className="border-r-2 border-black py-1 px-1.5">{renov.dataRenovacao}</td>
                    <td className="py-1 px-1.5 text-slate-400 italic text-[8.5px]">
                      {student.responsaveis.mae.nome ? '(Assinado)' : '_________________'}
                    </td>
                  </tr>
                ))}
                {Array.from({ length: Math.max(0, 3 - student.renovacoes.length) }).map((_, i) => (
                  <tr key={`vazia-${i}`} className="h-6">
                    <td className="border-r-2 border-black"></td>
                    <td className="border-r-2 border-black"></td>
                    <td className="border-r-2 border-black"></td>
                    <td className="border-r-2 border-black"></td>
                    <td className="border-r-2 border-black"></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bloco de Saúde e Autorizações */}
          <div className="border-2 border-black bg-amber-50/30 p-2 mb-2 text-[10px] space-y-1">
            <p className="font-black text-slate-900 uppercase tracking-wider text-[9px]">
              OBSERVAÇÕES DE SAÚDE, ROTINA E RETIRADA:
            </p>
            <p>
              <strong>Alergias / Restrições:</strong>{' '}
              {student.saudeERotina?.alergias || 'Nenhuma informada'} |{' '}
              {student.saudeERotina?.restricoesAlimentares || 'Sem restrição alimentar'}
            </p>
            <p>
              <strong>Pessoas autorizadas a retirar a criança:</strong>{' '}
              {student.saudeERotina?.pessoasAutorizadasBusca || 'Apenas os pais/responsáveis legais'}
            </p>
          </div>

          {/* Termo de Declaração e Ciência */}
          <div className="border-2 border-black bg-slate-50/60 p-2 mb-2 text-[9.5px] leading-snug">
            <span className="font-bold uppercase tracking-wider block text-[9px] text-slate-900 mb-0.5">
              TERMO DE RESPONSABILIDADE & CIÊNCIA:
            </span>
            <p className="text-slate-800">
              Declaro que as informações prestadas nesta ficha são verdadeiras e assumo o compromisso de manter atualizados os contatos de emergência e endereço residencial, ciente das diretrizes e regimento da instituição.
            </p>
          </div>
        </div>

        {/* Bloco Inferior: Assinaturas com Altura Ampla para Assinatura à Caneta + Rodapé */}
        <div className="mt-auto pt-1">
          {/* Assinaturas com Altura Adequada para Assinar */}
          <div className="grid grid-cols-2 gap-8 mb-2 text-center">
            {/* Assinatura do Responsável */}
            <div className="flex flex-col justify-end">
              <div className="h-12 sm:h-14"></div>
              <div className="border-t-2 border-black pt-1 font-bold text-xs text-slate-900">
                Assinatura do(a) Responsável Legal
              </div>
              <p className="text-[9.5px] text-slate-600 mt-0.5 uppercase">
                {student.responsaveis.mae.nome || student.responsaveis.pai.nome || 'Responsável Legal'}
              </p>
            </div>

            {/* Assinatura do Funcionário */}
            <div className="flex flex-col justify-end">
              <div className="h-12 sm:h-14"></div>
              <div className="border-t-2 border-black pt-1 font-bold text-xs text-slate-900">
                Assinatura da Secretaria / Direção Escolar
              </div>
              <p className="text-[9.5px] text-slate-600 mt-0.5 uppercase">
                {config.nome}
              </p>
            </div>
          </div>

          {/* Rodapé Oficial Regulatório */}
          <div className="border-t-2 border-black pt-1.5 text-[9.5px] text-slate-700 flex items-center justify-between">
            <div>
              <p className="font-bold text-black">{config.resolucao}</p>
              <p>CNPJ: {config.cnpj}</p>
            </div>
            <div className="text-right">
              <p>Email: {config.email}</p>
              <p>Instagram: {config.instagram}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
