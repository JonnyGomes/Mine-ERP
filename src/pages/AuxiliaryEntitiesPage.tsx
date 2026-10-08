import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductGroup, ProductSubgroup, Supplier } from '../types';
import { Modal } from '../components/common/Modal';
import { formatPhone, formatCpfCnpj } from '../utils/formatters';
import {
  Layers,
  Truck,
  Plus,
  Trash2,
  FolderPlus,
} from 'lucide-react';

interface AuxiliaryEntitiesPageProps {
  initialTab?: 'GRUPOS' | 'FORNECEDORES';
}

export const AuxiliaryEntitiesPage: React.FC<AuxiliaryEntitiesPageProps> = ({ initialTab = 'GRUPOS' }) => {
  const { groups, subgroups, suppliers, addGroup, addSubgroup, addSupplier } = useApp();

  const [activeTab, setActiveTab] = useState<'GRUPOS' | 'FORNECEDORES'>(initialTab);

  // Modal Novo Grupo
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');

  // Modal Novo Subgrupo
  const [isSubgroupModalOpen, setIsSubgroupModalOpen] = useState(false);
  const [subgroupIdGroup, setSubgroupIdGroup] = useState(groups[0]?.id || '');
  const [subgroupName, setSubgroupName] = useState('');

  // Modal Novo Fornecedor
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supForm, setSupForm] = useState({
    code: '',
    name: '',
    tradeName: '',
    cnpj: '',
    ie: '',
    phone: '',
    email: '',
    city: 'São Paulo',
    state: 'SP',
    contactPerson: '',
    status: 'ATIVO' as Supplier['status'],
  });

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    addGroup({ name: groupName, description: groupDesc });
    setGroupName('');
    setGroupDesc('');
    setIsGroupModalOpen(false);
  };

  const handleSaveSubgroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subgroupName.trim()) return;
    addSubgroup({ groupId: subgroupIdGroup, name: subgroupName });
    setSubgroupName('');
    setIsSubgroupModalOpen(false);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supForm.name.trim()) return;
    addSupplier({
      ...supForm,
      code: supForm.code || String(suppliers.length + 1).padStart(3, '0'),
    });
    setIsSupplierModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {activeTab === 'GRUPOS' ? 'Grupos & Subgrupos de Produtos' : 'Fornecedores'}
          </h1>
          <p className="text-xs text-slate-500">
            Organização categórica e base de fornecedores para compras e reposição
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'GRUPOS' ? (
            <>
              <button
                onClick={() => setIsGroupModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Grupo</span>
              </button>
              <button
                onClick={() => setIsSubgroupModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-xs"
              >
                <FolderPlus className="w-4 h-4 text-purple-600" />
                <span>Novo Subgrupo</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setSupForm({
                  code: String(suppliers.length + 1).padStart(3, '0'),
                  name: '',
                  tradeName: '',
                  cnpj: '',
                  ie: '',
                  phone: '',
                  email: '',
                  city: 'São Paulo',
                  state: 'SP',
                  contactPerson: '',
                  status: 'ATIVO',
                });
                setIsSupplierModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Fornecedor</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-fit">
        <button
          onClick={() => setActiveTab('GRUPOS')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'GRUPOS'
              ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-blue-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Grupos & Subgrupos</span>
        </button>
        <button
          onClick={() => setActiveTab('FORNECEDORES')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'FORNECEDORES'
              ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-blue-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Fornecedores ({suppliers.length})</span>
        </button>
      </div>

      {/* TAB GRUPOS */}
      {activeTab === 'GRUPOS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Grupos */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Grupos Principais ({groups.length})
            </h2>
            <div className="space-y-2">
              {groups.map((g) => (
                <div
                  key={g.id}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white">
                      {g.name}
                    </div>
                    {g.description && (
                      <div className="text-[11px] text-slate-500">{g.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subgrupos */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Subgrupos ({subgroups.length})
            </h2>
            <div className="space-y-2">
              {subgroups.map((s) => {
                const parentGroup = groups.find((g) => g.id === s.groupId);
                return (
                  <div
                    key={s.id}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Grupo pai: <strong>{parentGroup?.name || 'Geral'}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* TAB FORNECEDORES */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Cód</th>
                <th className="py-2.5 px-3">Razão Social / Nome</th>
                <th className="py-2.5 px-3">CNPJ</th>
                <th className="py-2.5 px-3">Contato / Telefone</th>
                <th className="py-2.5 px-3">Cidade / UF</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {s.code}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900 dark:text-white">{s.name}</div>
                    {s.tradeName && <div className="text-[10px] text-slate-400">{s.tradeName}</div>}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                    {formatCpfCnpj(s.cnpj)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                    <div>{formatPhone(s.phone)}</div>
                    {s.contactPerson && (
                      <div className="text-[10px] text-slate-400">Resp: {s.contactPerson}</div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                    {s.city} - {s.state}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL GRUPO */}
      <Modal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        title="Novo Grupo de Produtos"
        subtitle="Agrupamento de itens por categoria"
        maxWidth="sm"
      >
        <form onSubmit={handleSaveGroup} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nome do Grupo *
            </label>
            <input
              type="text"
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descrição
            </label>
            <input
              type="text"
              value={groupDesc}
              onChange={(e) => setGroupDesc(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsGroupModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
            >
              Salvar Grupo
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL SUBGRUPO */}
      <Modal
        isOpen={isSubgroupModalOpen}
        onClose={() => setIsSubgroupModalOpen(false)}
        title="Novo Subgrupo"
        subtitle="Vincule um subgrupo ao grupo correspondente"
        maxWidth="sm"
      >
        <form onSubmit={handleSaveSubgroup} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Grupo Pai *
            </label>
            <select
              value={subgroupIdGroup}
              onChange={(e) => setSubgroupIdGroup(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nome do Subgrupo *
            </label>
            <input
              type="text"
              required
              value={subgroupName}
              onChange={(e) => setSubgroupName(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsSubgroupModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
            >
              Salvar Subgrupo
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL FORNECEDOR */}
      <Modal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        title="Novo Fornecedor"
        subtitle="Cadastro de fornecedor para compras e reposição"
        maxWidth="md"
      >
        <form onSubmit={handleSaveSupplier} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Razão Social *
              </label>
              <input
                type="text"
                required
                value={supForm.name}
                onChange={(e) => setSupForm({ ...supForm, name: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome Fantasia
              </label>
              <input
                type="text"
                value={supForm.tradeName}
                onChange={(e) => setSupForm({ ...supForm, tradeName: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                CNPJ *
              </label>
              <input
                type="text"
                required
                value={supForm.cnpj}
                onChange={(e) => setSupForm({ ...supForm, cnpj: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Telefone
              </label>
              <input
                type="text"
                value={supForm.phone}
                onChange={(e) => setSupForm({ ...supForm, phone: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cidade
              </label>
              <input
                type="text"
                value={supForm.city}
                onChange={(e) => setSupForm({ ...supForm, city: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pessoa de Contato
              </label>
              <input
                type="text"
                value={supForm.contactPerson}
                onChange={(e) => setSupForm({ ...supForm, contactPerson: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsSupplierModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
            >
              Salvar Fornecedor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
