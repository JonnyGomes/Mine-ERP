import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Barcode,
  Layers,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { products, groups, subgroups, suppliers, addProduct, updateProduct, deleteProduct } = useApp();

  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    barcode: '',
    name: '',
    description: '',
    unit: 'UN' as Product['unit'],
    groupId: '',
    subgroupId: '',
    brand: '',
    supplierId: '',
    reference: '',
    ncm: '21069090',
    cest: '',
    cfop: '5102',
    cst: '00',
    csosn: '102',
    costPrice: 0,
    salePrice: 0,
    minPrice: 0,
    currentStock: 0,
    minStock: 5,
    maxStock: 100,
    location: '',
    active: true,
  });

  const handleOpenNew = () => {
    setEditingProduct(null);
    const nextCode = String(products.length + 1).padStart(4, '0');
    setFormData({
      code: nextCode,
      barcode: '7891' + Math.floor(1000 + Math.random() * 9000),
      name: '',
      description: '',
      unit: 'UN',
      groupId: groups[0]?.id || '',
      subgroupId: '',
      brand: '',
      supplierId: suppliers[0]?.id || '',
      reference: '',
      ncm: '21069090',
      cest: '',
      cfop: '5102',
      cst: '00',
      csosn: '102',
      costPrice: 0,
      salePrice: 0,
      minPrice: 0,
      currentStock: 10,
      minStock: 5,
      maxStock: 100,
      location: '',
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      code: p.code,
      barcode: p.barcode,
      name: p.name,
      description: p.description || '',
      unit: p.unit,
      groupId: p.groupId,
      subgroupId: p.subgroupId || '',
      brand: p.brand || '',
      supplierId: p.supplierId || '',
      reference: p.reference || '',
      ncm: p.ncm,
      cest: p.cest || '',
      cfop: p.cfop,
      cst: p.cst || '',
      csosn: p.csosn || '',
      costPrice: p.costPrice,
      salePrice: p.salePrice,
      minPrice: p.minPrice,
      currentStock: p.currentStock,
      minStock: p.minStock,
      maxStock: p.maxStock,
      location: p.location || '',
      active: p.active,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const groupObj = groups.find((g) => g.id === formData.groupId);
    const groupName = groupObj ? groupObj.name : 'Geral';
    const subgObj = subgroups.find((s) => s.id === formData.subgroupId);
    const subgroupName = subgObj ? subgObj.name : undefined;
    const supObj = suppliers.find((s) => s.id === formData.supplierId);
    const supplierName = supObj ? supObj.name : undefined;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...formData,
        groupName,
        subgroupName,
        supplierName,
      });
    } else {
      addProduct({
        ...formData,
        groupName,
        subgroupName,
        supplierName,
      });
    }
    setIsModalOpen(false);
  };

  // Filter Products
  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q);
    const matchGroup = filterGroup === 'ALL' || p.groupId === filterGroup;
    const matchStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'ACTIVE' && p.active) ||
      (filterStatus === 'INACTIVE' && !p.active);
    return matchSearch && matchGroup && matchStatus;
  });

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Cadastro de Produtos
          </h1>
          <p className="text-xs text-slate-500">
            Gerenciamento completo do catálogo, preços, códigos fiscais e estoque
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Produto</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, código de barras ou nome do produto..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Group Filter */}
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
          >
            <option value="ALL">Todos os Grupos</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
          >
            <option value="ALL">Todos os Status</option>
            <option value="ACTIVE">Somente Ativos</option>
            <option value="INACTIVE">Somente Inativos</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Cód / Barras</th>
                <th className="py-2.5 px-3">Nome do Produto</th>
                <th className="py-2.5 px-3">Grupo</th>
                <th className="py-2.5 px-3 text-right">Custo</th>
                <th className="py-2.5 px-3 text-right">Preço Venda</th>
                <th className="py-2.5 px-3 text-right">Estoque</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center w-20">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isLow = p.currentStock <= p.minStock;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono">
                        <div className="font-bold text-slate-900 dark:text-white">{p.code}</div>
                        <div className="text-[10px] text-slate-400">{p.barcode}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{p.name}</div>
                        {p.reference && (
                          <div className="text-[10px] text-slate-400">Ref: {p.reference}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                        {p.groupName}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">
                        {formatCurrency(p.costPrice)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                        {formatCurrency(p.salePrice)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        <span className={isLow ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-200'}>
                          {p.currentStock} {p.unit}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            p.active
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {p.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1 text-slate-500 hover:text-blue-600 rounded"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingProductId(p.id)}
                            className="p-1 text-slate-500 hover:text-rose-600 rounded"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
        subtitle="Preencha os dados cadastrais, comerciais e fiscais do produto"
        maxWidth="4xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Código Interno *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Código de Barras (EAN/GTIN)
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unidade
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              >
                <option value="UN">UN - Unidade</option>
                <option value="KG">KG - Quilograma</option>
                <option value="CX">CX - Caixa</option>
                <option value="LT">LT - Litro</option>
                <option value="FD">FD - Fardo</option>
                <option value="MT">MT - Metro</option>
                <option value="PC">PC - Peça</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome do Produto *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Referência
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Grupo
              </label>
              <select
                value={formData.groupId}
                onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
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
                Fornecedor
              </label>
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              >
                <option value="">Nenhum</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Localização Física
              </label>
              <input
                type="text"
                placeholder="Ex: Prateleira B, Gaveta 3"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Preços e Estoque */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-2">
              Valores Comerciais & Estoque
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Preço Custo (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-1">
                  Preço Venda (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border border-blue-300 dark:border-blue-700 rounded-lg text-xs font-mono font-bold dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Estoque Atual
                </label>
                <input
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Estoque Mínimo
                </label>
                <input
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono dark:bg-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Dados Fiscais Preparatórios */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-2">
              Estrutura Fiscal (NF-e / NFC-e)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  NCM
                </label>
                <input
                  type="text"
                  value={formData.ncm}
                  onChange={(e) => setFormData({ ...formData, ncm: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  CEST
                </label>
                <input
                  type="text"
                  value={formData.cest}
                  onChange={(e) => setFormData({ ...formData, cest: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  CFOP
                </label>
                <input
                  type="text"
                  value={formData.cfop}
                  onChange={(e) => setFormData({ ...formData, cfop: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  CSOSN / CST
                </label>
                <input
                  type="text"
                  value={formData.csosn}
                  onChange={(e) => setFormData({ ...formData, csosn: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono dark:bg-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span>Produto Ativo para Venda</span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs"
              >
                Salvar Produto
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* CONFIRMAÇÃO DE EXCLUSÃO */}
      <ConfirmDialog
        isOpen={Boolean(deletingProductId)}
        title="Excluir Produto"
        message="Tem certeza que deseja remover este produto? Esta ação não pode ser desfeita."
        confirmText="Sim, Excluir"
        isDestructive={true}
        onConfirm={() => {
          if (deletingProductId) {
            deleteProduct(deletingProductId);
            setDeletingProductId(null);
          }
        }}
        onCancel={() => setDeletingProductId(null)}
      />
    </div>
  );
};
