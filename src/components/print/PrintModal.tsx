import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { PrintOrderA4 } from './PrintOrderA4';
import { PrintOrderThermal } from './PrintOrderThermal';
import { Printer, FileText, Receipt, Check } from 'lucide-react';

export const PrintModal: React.FC = () => {
  const { printDoc, closePrintModal, company, settings } = useApp();
  const [selectedFormat, setSelectedFormat] = useState<'A4' | '58MM' | '80MM'>(
    printDoc?.format || settings.defaultPrintFormat || 'A4'
  );

  if (!printDoc) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Interactive Modal for Preview and Format Selection (Hidden when printing via .no-print in Modal) */}
      <Modal
        isOpen={Boolean(printDoc)}
        onClose={closePrintModal}
        title="Visualização e Impressão de Documento"
        subtitle={`Documento nº ${printDoc.doc.number} - Selecione o formato de saída`}
        maxWidth="4xl"
      >
        <div className="flex flex-col gap-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            {/* Format Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-900 rounded-lg">
              <button
                type="button"
                onClick={() => setSelectedFormat('A4')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  selectedFormat === 'A4'
                    ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-800 dark:text-blue-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Folha A4
              </button>
              <button
                type="button"
                onClick={() => setSelectedFormat('80MM')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  selectedFormat === '80MM'
                    ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-800 dark:text-blue-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                Bobina 80mm
              </button>
              <button
                type="button"
                onClick={() => setSelectedFormat('58MM')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  selectedFormat === '58MM'
                    ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-800 dark:text-blue-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                Bobina 58mm
              </button>
            </div>

            {/* Print Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closePrintModal}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                <Printer className="w-4 h-4" />
                Imprimir {selectedFormat} (Ctrl+P)
              </button>
            </div>
          </div>

          {/* Preview Container */}
          <div className="bg-slate-100 dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[58vh] flex justify-center">
            {selectedFormat === 'A4' && (
              <PrintOrderA4
                doc={printDoc.doc}
                type={printDoc.type}
                company={company}
                footerMessage={settings.footerMessage}
              />
            )}
            {selectedFormat === '80MM' && (
              <PrintOrderThermal
                doc={printDoc.doc}
                type={printDoc.type}
                company={company}
                width="80mm"
                footerMessage={settings.footerMessage}
              />
            )}
            {selectedFormat === '58MM' && (
              <PrintOrderThermal
                doc={printDoc.doc}
                type={printDoc.type}
                company={company}
                width="58mm"
                footerMessage={settings.footerMessage}
              />
            )}
          </div>
        </div>
      </Modal>

      {/* Target for Real Browser Print (@media print renders this specifically, while hiding everything else) */}
      <div id="printable-document" className="hidden print:block">
        {selectedFormat === 'A4' && (
          <PrintOrderA4
            doc={printDoc.doc}
            type={printDoc.type}
            company={company}
            footerMessage={settings.footerMessage}
          />
        )}
        {selectedFormat === '80MM' && (
          <PrintOrderThermal
            doc={printDoc.doc}
            type={printDoc.type}
            company={company}
            width="80mm"
            footerMessage={settings.footerMessage}
          />
        )}
        {selectedFormat === '58MM' && (
          <PrintOrderThermal
            doc={printDoc.doc}
            type={printDoc.type}
            company={company}
            width="58mm"
            footerMessage={settings.footerMessage}
          />
        )}
      </div>
    </>
  );
};
