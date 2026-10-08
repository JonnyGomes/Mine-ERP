import React from 'react';
import { Sale, Order, Company } from '../../types';
import { formatCurrency, formatCpfCnpj, formatDateBR, formatPhone } from '../../utils/formatters';

interface PrintOrderA4Props {
  doc: Sale | Order;
  type: 'sale' | 'order';
  company: Company;
  footerMessage?: string;
}

export const PrintOrderA4: React.FC<PrintOrderA4Props> = ({
  doc,
  type,
  company,
  footerMessage = 'Obrigado pela preferência!',
}) => {
  const isSale = type === 'sale';
  const sale = isSale ? (doc as Sale) : null;
  const order = !isSale ? (doc as Order) : null;

  const paymentDisplay = isSale
    ? sale?.payments.map((p) => `${p.method}: ${formatCurrency(p.amount)}`).join(' | ')
    : order?.paymentMethodExpected;

  return (
    <div className="print-format-a4 bg-white text-black p-8 text-sm font-sans mx-auto max-w-[210mm] border border-slate-200 shadow-sm print:border-none print:shadow-none">
      {/* Cabeçalho da Empresa */}
      <div className="border-b-2 border-black pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase text-black">
              {company.tradeName || company.name}
            </h1>
            <p className="text-xs text-slate-700 font-semibold">{company.name}</p>
            <p className="text-xs text-slate-700 mt-1">
              CNPJ: {formatCpfCnpj(company.cnpj)} &nbsp;|&nbsp; IE: {company.stateRegistration}
            </p>
            <p className="text-xs text-slate-700">
              {company.street}, {company.number} {company.complement ? `- ${company.complement}` : ''} - {company.neighborhood} - {company.city}/{company.state}
            </p>
            <p className="text-xs text-slate-700">
              Tel: {formatPhone(company.phone)} &nbsp;|&nbsp; WhatsApp: {formatPhone(company.whatsapp)} &nbsp;|&nbsp; E-mail: {company.email}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-slate-100 border border-black font-bold text-xs uppercase tracking-wider">
              {isSale ? 'COMPROVANTE DE VENDA' : 'PEDIDO DE VENDA'}
            </span>
            <div className="mt-2 text-xl font-bold font-mono">
              Nº {doc.number}
            </div>
            <div className="text-xs text-slate-600">
              Emissão: {formatDateBR(doc.date)} às {doc.time}
            </div>
          </div>
        </div>
      </div>

      {/* Dados do Cliente e Venda */}
      <div className="border border-slate-300 rounded p-3 mb-4 bg-slate-50/50 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-semibold text-slate-600">CLIENTE: </span>
            <span className="font-bold uppercase text-slate-900">{doc.customerName}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-600">CPF/CNPJ: </span>
            <span className="font-mono text-slate-900">{formatCpfCnpj(doc.customerDocument) || 'Não informado'}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-600">VENDEDOR/OPERADOR: </span>
            <span className="text-slate-900">{doc.sellerName}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-600">SITUAÇÃO: </span>
            <span className="font-bold uppercase text-slate-900">{doc.status}</span>
          </div>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="mb-4">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-y-2 border-black bg-slate-100 text-slate-800 font-bold uppercase tracking-wider">
              <th className="py-1.5 px-2 text-left">Cód</th>
              <th className="py-1.5 px-2 text-left">Produto / Descrição</th>
              <th className="py-1.5 px-2 text-center">Un</th>
              <th className="py-1.5 px-2 text-right">Qtd</th>
              <th className="py-1.5 px-2 text-right">Vlr. Unit</th>
              <th className="py-1.5 px-2 text-right">Desc.</th>
              <th className="py-1.5 px-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {doc.items.map((it, idx) => (
              <tr key={it.id || idx} className="hover:bg-slate-50/50">
                <td className="py-1 px-2 font-mono text-slate-600">{it.code}</td>
                <td className="py-1 px-2 font-medium text-slate-900">
                  {it.name}
                  {it.notes && <span className="block text-[10px] text-slate-500 italic">{it.notes}</span>}
                </td>
                <td className="py-1 px-2 text-center uppercase text-slate-600">{it.unit || 'UN'}</td>
                <td className="py-1 px-2 text-right font-mono tabular-nums">{it.quantity}</td>
                <td className="py-1 px-2 text-right font-mono tabular-nums">{formatCurrency(it.unitPrice)}</td>
                <td className="py-1 px-2 text-right font-mono tabular-nums text-slate-500">
                  {it.discount > 0 ? formatCurrency(it.discount) : '-'}
                </td>
                <td className="py-1 px-2 text-right font-mono font-semibold tabular-nums text-slate-900">
                  {formatCurrency(it.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totais e Rodapé */}
      <div className="flex justify-between items-start pt-2 border-t border-slate-300 mb-6">
        <div className="w-1/2 pr-4 text-xs">
          <div className="font-semibold text-slate-700 mb-1">Forma(s) de Pagamento:</div>
          <div className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-800 font-mono">
            {paymentDisplay || 'Não informado'}
          </div>

          {doc.notes && (
            <div className="mt-2 text-xs text-slate-600">
              <span className="font-semibold">Observações:</span> {doc.notes}
            </div>
          )}
        </div>

        <div className="w-1/2 max-w-xs pl-4 space-y-1 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono tabular-nums font-semibold">{formatCurrency(doc.subtotal)}</span>
          </div>
          {doc.discount > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Desconto:</span>
              <span className="font-mono tabular-nums font-semibold">- {formatCurrency(doc.discount)}</span>
            </div>
          )}
          {doc.addition > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Acréscimo:</span>
              <span className="font-mono tabular-nums font-semibold">+ {formatCurrency(doc.addition)}</span>
            </div>
          )}
          <div className="flex justify-between border-t-2 border-black pt-1.5 text-base font-bold text-black">
            <span>TOTAL:</span>
            <span className="font-mono tabular-nums">{formatCurrency(doc.total)}</span>
          </div>
        </div>
      </div>

      {/* Assinaturas */}
      <div className="mt-12 pt-4 border-t border-dashed border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
        <div>
          <div className="border-b border-black w-3/4 mx-auto mb-1"></div>
          <span className="font-semibold uppercase text-slate-800">Assinatura do Cliente</span>
          <p className="text-[10px] text-slate-500">{doc.customerName}</p>
        </div>
        <div>
          <div className="border-b border-black w-3/4 mx-auto mb-1"></div>
          <span className="font-semibold uppercase text-slate-800">Assinatura do Vendedor / Responsável</span>
          <p className="text-[10px] text-slate-500">{doc.sellerName}</p>
        </div>
      </div>

      <div className="mt-8 text-center text-[10px] text-slate-500 italic">
        {footerMessage} &bull; JG_IERP Sistema de Gestão Empresarial
      </div>
    </div>
  );
};
