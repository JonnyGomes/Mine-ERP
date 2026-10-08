import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Company, SystemSettings } from '../types';
import { StorageService } from '../services/storage';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  Building2,
  Printer,
  Sliders,
  Database,
  Save,
  RotateCcw,
  Download,
  Upload,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { company, updateCompany, settings, updateSettings, resetAllData, addToast } = useApp();

  const [companyForm, setCompanyForm] = useState<Company>({ ...company });
  const [settingsForm, setSettingsForm] = useState<SystemSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'EMPRESA' | 'IMPRESSAO' | 'REGRAS' | 'BACKUP'>('EMPRESA');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompany(companyForm);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
  };

  const handleExportBackup = () => {
    const jsonStr = StorageService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_jgierp_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Backup exportado com sucesso!', 'success');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importBackup(content);
      if (success) {
        addToast('Backup importado com sucesso! Recarregando sistema...', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        addToast('Falha ao importar o arquivo de backup.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Configurações do Sistema
        </h1>
        <p className="text-xs text-slate-500">
          Dados da empresa emitente, parâmetros de impressão, políticas fiscais e backup
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-fit">
        {[
          { id: 'EMPRESA', label: 'Dados da Empresa', icon: Building2 },
          { id: 'IMPRESSAO', label: 'Impressão & Cupom', icon: Printer },
          { id: 'REGRAS', label: 'Parâmetros & Regras', icon: Sliders },
          { id: 'BACKUP', label: 'Dados & Backup', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-blue-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DADOS DA EMPRESA */}
      {activeTab === 'EMPRESA' && (
        <form onSubmit={handleSaveCompany} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2 dark:border-slate-800">
            Identificação da Empresa (Emitente do Cupom / A4)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Razão Social *
              </label>
              <input
                type="text"
                required
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome Fantasia (Impresso na Bobina / Cabeçalho) *
              </label>
              <input
                type="text"
                required
                value={companyForm.tradeName}
                onChange={(e) => setCompanyForm({ ...companyForm, tradeName: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                CNPJ *
              </label>
              <input
                type="text"
                required
                value={companyForm.cnpj}
                onChange={(e) => setCompanyForm({ ...companyForm, cnpj: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Inscrição Estadual (IE)
              </label>
              <input
                type="text"
                value={companyForm.stateRegistration}
                onChange={(e) => setCompanyForm({ ...companyForm, stateRegistration: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Telefone Fixo
              </label>
              <input
                type="text"
                value={companyForm.phone}
                onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp de Atendimento
              </label>
              <input
                type="text"
                value={companyForm.whatsapp}
                onChange={(e) => setCompanyForm({ ...companyForm, whatsapp: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={companyForm.email}
                onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                CEP
              </label>
              <input
                type="text"
                value={companyForm.zipCode}
                onChange={(e) => setCompanyForm({ ...companyForm, zipCode: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Logradouro
              </label>
              <input
                type="text"
                value={companyForm.street}
                onChange={(e) => setCompanyForm({ ...companyForm, street: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Número
              </label>
              <input
                type="text"
                value={companyForm.number}
                onChange={(e) => setCompanyForm({ ...companyForm, number: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bairro
              </label>
              <input
                type="text"
                value={companyForm.neighborhood}
                onChange={(e) => setCompanyForm({ ...companyForm, neighborhood: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cidade
              </label>
              <input
                type="text"
                value={companyForm.city}
                onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estado (UF)
              </label>
              <input
                type="text"
                maxLength={2}
                value={companyForm.state}
                onChange={(e) => setCompanyForm({ ...companyForm, state: e.target.value.toUpperCase() })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Dados da Empresa</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: CONFIGURAÇÕES DE IMPRESSÃO (Requirement 17) */}
      {activeTab === 'IMPRESSAO' && (
        <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2 dark:border-slate-800">
            Configuração de Impressão de Pedidos e Vendas (A4 & Bobina Térmica)
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Tipo de Impressão Padrão:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'A4', label: 'Folha A4 (Ofício/Carta)', desc: 'Layout formal com cabeçalho completo, colunas amplas e linhas para assinaturas' },
                { id: '80MM', label: 'Bobina Térmica 80mm', desc: 'Impressoras térmicas padrão Epson/Bematech/Daruma (80mm)' },
                { id: '58MM', label: 'Bobina Térmica 58mm', desc: 'Mini impressoras portáteis ou compactas térmicas (58mm)' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`p-3 rounded-lg border cursor-pointer flex flex-col justify-between transition-all ${
                    settingsForm.defaultPrintFormat === opt.id
                      ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="defaultPrintFormat"
                      value={opt.id}
                      checked={settingsForm.defaultPrintFormat === opt.id}
                      onChange={() => setSettingsForm({ ...settingsForm, defaultPrintFormat: opt.id as any })}
                      className="text-blue-600"
                    />
                    <span className="font-bold text-xs">{opt.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-5">{opt.desc}</p>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={settingsForm.autoPrintSale}
                onChange={(e) => setSettingsForm({ ...settingsForm, autoPrintSale: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span>Abrir tela de impressão automaticamente ao finalizar venda no PDV</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={settingsForm.printDuplicate}
                onChange={(e) => setSettingsForm({ ...settingsForm, printDuplicate: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span>Imprimir 2ª via do pedido</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={settingsForm.printReceipt}
                onChange={(e) => setSettingsForm({ ...settingsForm, printReceipt: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span>Imprimir comprovante detalhado de pagamento</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mensagem de Agradecimento no Rodapé da Impressão
            </label>
            <input
              type="text"
              value={settingsForm.footerMessage}
              onChange={(e) => setSettingsForm({ ...settingsForm, footerMessage: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Preferências de Impressão</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: REGRAS & PARÂMETROS COMERCIAIS */}
      {activeTab === 'REGRAS' && (
        <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2 dark:border-slate-800">
            Políticas de Validação e Regras do PDV
          </h2>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 flex items-start gap-3">
              <input
                type="checkbox"
                id="allowNeg"
                checked={settingsForm.allowNegativeStock}
                onChange={(e) => setSettingsForm({ ...settingsForm, allowNegativeStock: e.target.checked })}
                className="mt-1 rounded text-blue-600"
              />
              <div>
                <label htmlFor="allowNeg" className="text-xs font-bold text-slate-900 dark:text-white cursor-pointer">
                  Permitir Venda com Estoque Negativo
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Quando desmarcado (padrão de segurança), o PDV bloqueia a finalização da venda se a quantidade solicitada for superior ao estoque atual do produto.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 flex items-start gap-3">
              <input
                type="checkbox"
                id="requireCx"
                checked={settingsForm.requireCashierForSale}
                onChange={(e) => setSettingsForm({ ...settingsForm, requireCashierForSale: e.target.checked })}
                className="mt-1 rounded text-blue-600"
              />
              <div>
                <label htmlFor="requireCx" className="text-xs font-bold text-slate-900 dark:text-white cursor-pointer">
                  Exigir Caixa Aberto para Operar Vendas no PDV
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Impede vendas se o operador ainda não tiver realizado a abertura do caixa do turno com o saldo inicial em dinheiro.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Parâmetros</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: DADOS & BACKUP */}
      {activeTab === 'BACKUP' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2 dark:border-slate-800">
            Segurança de Dados, Backup e Restauração
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <Download className="w-4 h-4 text-blue-600" />
                <span>Exportar Cópia de Segurança (Backup JSON)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Gera um arquivo com todos os cadastros, vendas, movimentações de estoque, contas e configurações do sistema.
              </p>
              <button
                type="button"
                onClick={handleExportBackup}
                className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                Baixar Arquivo de Backup
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Restaurar Backup a partir de Arquivo</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Restaura todo o banco de dados local a partir de um backup exportado anteriormente.
              </p>
              <label className="inline-block mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-xs">
                <span>Selecionar Arquivo JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-rose-600 dark:text-rose-400">
                  Restaurar Dados Iniciais de Demonstração
                </h4>
                <p className="text-[11px] text-slate-500">
                  Apaga modificações locais e reinstala os clientes, produtos e configurações padrão iniciais.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
              >
                Restaurar Padrão de Fábrica
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMAÇÃO DE RESTAURAÇÃO */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Restaurar Banco de Dados?"
        message="Deseja realmente restaurar os dados de demonstração originais? Todas as vendas e cadastros adicionados serão reiniciados."
        confirmText="Sim, Restaurar Dados"
        isDestructive={true}
        onConfirm={resetAllData}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
