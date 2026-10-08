import React from 'react';
import { Sale, Order, Company } from '../../types';
import { formatCurrency, formatCpfCnpj, formatDateBR, formatPhone } from '../../utils/formatters';

interface PrintOrderThermalProps {
  doc: Sale | Order;
  type: 'sale' | 'order';
  company: Company;
  width: '58mm' | '80mm';
  footerMessage?: string;
}

export const PrintOrderThermal: React.FC<PrintOrderThermalProps> = ({
  doc,
  type,
  company,
  width,
  footerMessage = 'Obrigado pela preferência!',
}) => {
  const isSale = type === 'sale';
  const sale = isSale ? (doc as Sale) : null;
  const order = !isSale ? (doc as Order) : null;
  const is58 = width === '58mm';

  const sepDouble = is58 ? '================================' : '================================================';
  const sepSingle = is58 ? '--------------------------------' : '------------------------------------------------';

  return (
    <div
      className={`font-mono-receipt bg-white text-black p-2 mx-auto leading-tight select-none border border-slate-300 shadow-sm print:border-none print:shadow-none ${
        is58 ? 'print-format-58mm max-w-[58mm] text-[10px]' : 'print-format-80mm max-w-[80mm] text-[11px]'
      }`}
    >
      {/* Header */}
      <div className="text-center">
        <div className="font-bold text-xs uppercase">{company.tradeName || company.name}</div>
        <div className="text-[9px]">{company.name}</div>
        <div className="text-[9px]">CNPJ: {formatCpfCnpj(company.cnpj)}</div>
        <div className="text-[9px]">TEL: {formatPhone(company.phone)}</div>
        <div className="text-[9px] truncate">{company.city}/{company.state}</div>
      </div>

      <div className="my-1 text-center overflow-hidden">{sepDouble}</div>

      <div className="text-center font-bold">
        {isSale ? 'CUPOM NÃO FISCAL / VENDA' : 'PEDIDO DE VENDA'}
      </div>
      <div className="flex justify-between text-[9px] mt-1">
        <span>Nº: {doc.number}</span>
        <span>DATA: {formatDateBR(doc.date)} {doc.time}</span>
      </div>

      <div className="text-[9px] mt-0.5 truncate">
        CLIENTE: {doc.customerName.toUpperCase()}
      </div>
      {doc.customerDocument && (
        <div className="text-[9px]">
          DOC: {formatCpfCnpj(doc.customerDocument)}
        </div>
      )}
      <div className="text-[9px]">OPERADOR: {doc.sellerName}</div>

      <div className="my-1 text-center overflow-hidden">{sepSingle}</div>

      {/* Columns Header */}
      <div className="flex justify-between font-bold text-[9px]">
        <span>ITEM / QTD x UNIT</span>
        <span>TOTAL</span>
      </div>
      <div className="my-0.5 text-center overflow-hidden">{sepSingle}</div>

      {/* Items */}
      <div className="space-y-1">
        {doc.items.map((it, idx) => (
          <div key={it.id || idx}>
            <div className="truncate font-semibold">{it.code} {it.name}</div>
            <div className="flex justify-between text-[9px] text-slate-800">
              <span>{it.quantity} {it.unit} x {formatCurrency(it.unitPrice)}</span>
              <span className="font-bold">{formatCurrency(it.total)}</span>
            </div>
            {it.discount > 0 && (
              <div className="text-[8px] text-right text-slate-600">
                (Desc: -{formatCurrency(it.discount)})
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="my-1 text-center overflow-hidden">{sepSingle}</div>

      {/* Totals */}
      <div className="space-y-0.5 text-[10px]">
        <div className="flex justify-between">
          <span>SUBTOTAL:</span>
          <span>{formatCurrency(doc.subtotal)}</span>
        </div>
        {doc.discount > 0 && (
          <div className="flex justify-between">
            <span>DESCONTO:</span>
            <span>-{formatCurrency(doc.discount)}</span>
          </div>
        )}
        {doc.addition > 0 && (
          <div className="flex justify-between">
            <span>ACRÉSCIMO:</span>
            <span>+{formatCurrency(doc.addition)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
          <span>TOTAL A PAGAR:</span>
          <span>{formatCurrency(doc.total)}</span>
        </div>
      </div>

      <div className="my-1 text-center overflow-hidden">{sepSingle}</div>

      {/* Payment details */}
      <div className="text-[9px]">
        <div className="font-bold">FORMA DE PAGAMENTO:</div>
        {isSale && sale?.payments ? (
          sale.payments.map((p, idx) => (
            <div key={p.id || idx} className="flex justify-between pl-2">
              <span>{p.method}</span>
              <span>{formatCurrency(p.amount)}</span>
            </div>
          ))
        ) : (
          <div className="pl-2">{order?.paymentMethodExpected || 'A Combinar'}</div>
        )}
      </div>

      {doc.notes && (
        <div className="mt-1 text-[8px]">
          <span className="font-semibold">OBS:</span> {doc.notes}
        </div>
      )}

      <div className="my-1 text-center overflow-hidden">{sepDouble}</div>

      <div className="text-center text-[9px] my-2">
        <div>{footerMessage}</div>
        <div className="text-[8px] mt-0.5 text-slate-600">JG_IERP Mini Gerencial</div>
      </div>
      <div className="my-1 text-center overflow-hidden">{sepDouble}</div>
    </div>
  );
};
