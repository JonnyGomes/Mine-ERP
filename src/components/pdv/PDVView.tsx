import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { SaleItem, SalePayment, Product, Customer, PaymentMethodType } from '../../types';
import { formatCurrency, formatCpfCnpj } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  User as UserIcon,
  Tag,
  DollarSign,
  Printer,
  PauseCircle,
  PlayCircle,
  XCircle,
  Barcode,
  CheckCircle2,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const PDVView: React.FC = () => {
  const {
    products,
    customers,
    cashRegister,
    settings,
    createSale,
    suspendSale,
    resumeSale,
    suspendedSales,
    removeSuspendedSale,
    openPrintModal,
    addToast,
    openCashier,
  } = useApp();

  const { hasPermission } = useAuth();

  // Active Sale State
  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust_consumer');
  const [discount, setDiscount] = useState<number>(0);
  const [addition, setAddition] = useState<number>(0);
  const [saleNotes, setSaleNotes] = useState<string>('');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(-1);

  // Search Input State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Modals State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuspendedModalOpen, setIsSuspendedModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isQuickCashierOpen, setIsQuickCashierOpen] = useState(false);

  // Discount Modal Inputs
  const [discountType, setDiscountType] = useState<'VALUE' | 'PERCENT'>('VALUE');
  const [discountInputValue, setDiscountInputValue] = useState<string>('0');

  // Payment Modal Inputs
  const [payments, setPayments] = useState<SalePayment[]>([]);
  const [currentPayMethod, setCurrentPayMethod] = useState<PaymentMethodType>('DINHEIRO');
  const [payAmountInput, setPayAmountInput] = useState<string>('');
  const [cashGivenInput, setCashGivenInput] = useState<string>('');

  // Selected Customer Details
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Totals calculations
  const subtotal = items.reduce((acc, it) => acc + it.total, 0);
  const total = Math.max(0, subtotal - discount + addition);
  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const remainingAmount = Math.max(0, total - totalPaid);

  // Cash change calculation
  const cashPaidAmount = payments.find((p) => p.method === 'DINHEIRO')?.amount || 0;
  const cashGiven = parseFloat(cashGivenInput.replace(',', '.')) || 0;
  const changeAmount = cashGiven > cashPaidAmount ? cashGiven - cashPaidAmount : 0;

  // Auto focus search on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Keyboard Shortcuts Listener (F2, F3, F4, F5, F6, F7, F8, F9, F10)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in a modal text input unless F-keys
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === 'F3') {
        e.preventDefault();
        setIsCustomerModalOpen(true);
      } else if (e.key === 'F4') {
        e.preventDefault();
        setIsDiscountModalOpen(true);
      } else if (e.key === 'F5') {
        e.preventDefault();
        if (items.length === 0) {
          addToast('Adicione ao menos um produto antes de finalizar a venda!', 'warning');
          return;
        }
        openPaymentModal();
      } else if (e.key === 'F6') {
        e.preventDefault();
        handleSuspendSale();
      } else if (e.key === 'F7') {
        e.preventDefault();
        setIsSuspendedModalOpen(true);
      } else if (e.key === 'F8') {
        e.preventDefault();
        handleRemoveSelectedItem();
      } else if (e.key === 'F9') {
        e.preventDefault();
        if (items.length > 0) setIsCancelConfirmOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Handle Search Input Change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowProductDropdown(false);
      return;
    }

    const q = query.toLowerCase().trim();
    const filtered = products.filter(
      (p) =>
        p.active &&
        (p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.barcode.toLowerCase().includes(q) ||
          (p.reference && p.reference.toLowerCase().includes(q)))
    );
    setSearchResults(filtered);
    setShowProductDropdown(filtered.length > 0);
  };

  // Add Product to Cart (from barcode scan, search enter, or click)
  const addProductToCart = (product: Product, quantity = 1) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((it) => it.productId === product.id);

      if (existingIndex >= 0) {
        // Increment quantity
        const updated = [...prevItems];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + quantity;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          total: Math.max(0, newQty * existing.unitPrice - existing.discount),
        };
        setSelectedItemIndex(existingIndex);
        return updated;
      } else {
        // Add new item
        const newItem: SaleItem = {
          id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 3),
          productId: product.id,
          code: product.code,
          barcode: product.barcode,
          name: product.name,
          unit: product.unit,
          quantity,
          unitPrice: product.salePrice,
          discount: 0,
          total: product.salePrice * quantity,
        };
        const next = [...prevItems, newItem];
        setSelectedItemIndex(next.length - 1);
        return next;
      }
    });

    setSearchQuery('');
    setShowProductDropdown(false);
    searchInputRef.current?.focus();
  };

  // Barcode or Search Submit via Enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const clean = searchQuery.trim().toLowerCase();

    // 1. Exact match on barcode or code
    const exact = products.find(
      (p) =>
        p.active &&
        (p.barcode.toLowerCase() === clean || p.code.toLowerCase() === clean)
    );

    if (exact) {
      addProductToCart(exact, 1);
      return;
    }

    // 2. If first search result exists
    if (searchResults.length > 0) {
      addProductToCart(searchResults[0], 1);
      return;
    }

    addToast(`Produto não encontrado com o termo: "${searchQuery}"`, 'error');
  };

  // Update item quantity
  const updateItemQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      removeItem(index);
      return;
    }

    setItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      updated[index] = {
        ...item,
        quantity: newQty,
        total: Math.max(0, newQty * item.unitPrice - item.discount),
      };
      return updated;
    });
  };

  // Update item discount
  const updateItemDiscount = (index: number, discountVal: number) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      const validDiscount = Math.max(0, Math.min(item.quantity * item.unitPrice, discountVal));
      updated[index] = {
        ...item,
        discount: validDiscount,
        total: Math.max(0, item.quantity * item.unitPrice - validDiscount),
      };
      return updated;
    });
  };

  // Remove Item
  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    if (selectedItemIndex === index) {
      setSelectedItemIndex(-1);
    }
  };

  const handleRemoveSelectedItem = () => {
    if (selectedItemIndex >= 0 && selectedItemIndex < items.length) {
      removeItem(selectedItemIndex);
      addToast('Item removido da venda.', 'info');
    } else if (items.length > 0) {
      removeItem(items.length - 1);
      addToast('Último item removido da venda.', 'info');
    }
  };

  // Open Payment Modal
  const openPaymentModal = () => {
    if (settings.requireCashierForSale && (!cashRegister || cashRegister.status !== 'ABERTO')) {
      setIsQuickCashierOpen(true);
      return;
    }

    // Default to full payment in DINHEIRO or PIX
    setPayments([
      {
        id: 'pay_' + Date.now(),
        method: 'DINHEIRO',
        amount: total,
      },
    ]);
    setPayAmountInput(total.toFixed(2));
    setCashGivenInput(total.toFixed(2));
    setIsPaymentModalOpen(true);
  };

  // Add multiple payment
  const handleAddPayment = () => {
    const amount = parseFloat(payAmountInput.replace(',', '.')) || 0;
    if (amount <= 0) {
      addToast('Informe um valor de pagamento válido.', 'warning');
      return;
    }

    setPayments((prev) => {
      // check if method already exists
      const existingIdx = prev.findIndex((p) => p.method === currentPayMethod);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].amount += amount;
        return updated;
      }
      return [
        ...prev,
        {
          id: 'pay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 3),
          method: currentPayMethod,
          amount,
        },
      ];
    });

    const newRemaining = Math.max(0, remainingAmount - amount);
    setPayAmountInput(newRemaining > 0 ? newRemaining.toFixed(2) : '0.00');
  };

  const handleRemovePayment = (payId: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== payId));
  };

  // Finalize Sale
  const handleConfirmFinalizeSale = () => {
    if (items.length === 0) return;

    if (totalPaid < total - 0.05) {
      addToast(
        `Faltam ${formatCurrency(total - totalPaid)} para cobrir o total da venda.`,
        'error'
      );
      return;
    }

    const sale = createSale({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerDocument: selectedCustomer.document,
      items,
      payments,
      discount,
      addition,
      notes: saleNotes,
    });

    if (sale) {
      setIsPaymentModalOpen(false);
      // Open Print Modal for finalized sale
      openPrintModal(sale, 'sale');

      // Clear PDV state
      setItems([]);
      setDiscount(0);
      setAddition(0);
      setSaleNotes('');
      setSelectedCustomerId('cust_consumer');
      setPayments([]);
      setCashGivenInput('');

      // Focus back to search
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 200);
    }
  };

  // Suspend Sale
  const handleSuspendSale = () => {
    if (items.length === 0) {
      addToast('Não há itens na venda para suspender.', 'warning');
      return;
    }

    const tempSale: any = {
      id: 'susp_' + Date.now(),
      number: 'SUSP-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerDocument: selectedCustomer.document,
      sellerId: 'user_caixa',
      sellerName: 'Operador',
      subtotal,
      discount,
      addition,
      total,
      status: 'SUSPENSA',
      notes: saleNotes,
      items,
      payments: [],
    };

    suspendSale(tempSale);
    setItems([]);
    setDiscount(0);
    setAddition(0);
    setSaleNotes('');
    searchInputRef.current?.focus();
  };

  // Resume Suspended Sale
  const handleResumeSale = (saleId: string) => {
    const sale = resumeSale(saleId);
    if (sale) {
      setItems(sale.items);
      setDiscount(sale.discount);
      setAddition(sale.addition);
      setSaleNotes(sale.notes || '');
      setSelectedCustomerId(sale.customerId);
      setIsSuspendedModalOpen(false);
      searchInputRef.current?.focus();
    }
  };

  // Cancel entire current sale
  const handleConfirmCancelCurrentSale = () => {
    setItems([]);
    setDiscount(0);
    setAddition(0);
    setSaleNotes('');
    setSelectedCustomerId('cust_consumer');
    setIsCancelConfirmOpen(false);
    addToast('Venda cancelada e PDV limpo.', 'info');
    searchInputRef.current?.focus();
  };

  // Mandatory Test Scenario Button (Requirement 36)
  const handleRunRequirement36Test = () => {
    // 1. Locate João da Silva, Produto A and Produto B
    const joao = customers.find((c) => c.name.toLowerCase().includes('joão da silva')) || customers[0];
    const prodA = products.find((p) => p.name.includes('Produto A') || p.code === '0001');
    const prodB = products.find((p) => p.name.includes('Produto B') || p.code === '0002');

    if (!prodA || !prodB) {
      addToast('Produto A ou B não encontrado nos registros.', 'error');
      return;
    }

    // Set up exact items:
    // Produto A: 2 x R$ 25,00 = R$ 50,00
    // Produto B: 1 x R$ 15,00 = R$ 15,00
    // Subtotal = R$ 65,00
    // Desconto = R$ 5,00
    // Total = R$ 60,00
    // Pagamento: PIX
    const itemA: SaleItem = {
      id: 'item_test_a',
      productId: prodA.id,
      code: prodA.code,
      barcode: prodA.barcode,
      name: prodA.name,
      unit: prodA.unit,
      quantity: 2,
      unitPrice: 25.0,
      discount: 0,
      total: 50.0,
    };

    const itemB: SaleItem = {
      id: 'item_test_b',
      productId: prodB.id,
      code: prodB.code,
      barcode: prodB.barcode,
      name: prodB.name,
      unit: prodB.unit,
      quantity: 1,
      unitPrice: 15.0,
      discount: 0,
      total: 15.0,
    };

    setItems([itemA, itemB]);
    setSelectedCustomerId(joao.id);
    setDiscount(5.0);
    setAddition(0);
    setSaleNotes('Cenário de Teste Obrigatório Requisito 36');

    // Pre-populate payment modal with PIX R$ 60.00
    setPayments([
      {
        id: 'pay_test_pix',
        method: 'PIX',
        amount: 60.0,
      },
    ]);
    setPayAmountInput('60.00');

    addToast('Cenário Obrigatório R$ 60,00 (João da Silva, PIX) carregado no PDV!', 'success');
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] bg-slate-100 dark:bg-slate-950 p-2 sm:p-3 overflow-hidden select-none">
      {/* Top Quick Bar: Search, Customer Info, Test Button */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 mb-2 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        {/* Search Bar with Barcode Icon */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[280px]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Barcode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Pesquisar produto por Nome, Código ou Bipar Código de Barras (F2)..."
              className="w-full pl-10 pr-24 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
              <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                F2
              </span>
              <button
                type="submit"
                className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          {showProductDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
              {searchResults.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => addProductToCart(prod)}
                  className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {prod.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Cód: {prod.code} | Barras: {prod.barcode} | Estoque: {prod.currentStock} {prod.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                      {formatCurrency(prod.salePrice)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Selected Customer Card button */}
        <button
          onClick={() => setIsCustomerModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs transition-colors"
          title="Alterar cliente (F3)"
        >
          <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <div className="text-left">
            <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
              {selectedCustomer.name}
            </div>
            <div className="text-[10px] text-slate-500">
              {selectedCustomer.document ? formatCpfCnpj(selectedCustomer.document) : 'Consumidor Final (F3)'}
            </div>
          </div>
        </button>

        {/* Mandatory Scenario Runner (Requisito 36) */}
        <button
          onClick={handleRunRequirement36Test}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          title="Carregar Cenário de Teste Oficial: João da Silva (2x Prod A + 1x Prod B - Desc. R$ 5 = R$ 60 no PIX)"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Carregar Teste R$ 60 (Req. 36)</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3 overflow-hidden">
        {/* LADO ESQUERDO: Lista de Itens da Venda (col 8) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col shadow-xs overflow-hidden">
          {/* Table Header */}
          <div className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Itens da Venda ({items.length})</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-normal">
              <span>Selecione um item e use [F8] para cancelar</span>
            </div>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500">
                <Barcode className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Nenhum produto adicionado
                </p>
                <p className="text-xs max-w-sm mt-1">
                  Pressione <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono">F2</kbd> para pesquisar ou bipe o código de barras com o leitor USB.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-3 w-12 text-center">#</th>
                    <th className="py-2 px-3">Cód / Produto</th>
                    <th className="py-2 px-3 text-right">Unitário</th>
                    <th className="py-2 px-3 text-center w-32">Quantidade</th>
                    <th className="py-2 px-3 text-right">Desconto</th>
                    <th className="py-2 px-3 text-right">Total</th>
                    <th className="py-2 px-3 text-center w-12">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {items.map((it, idx) => {
                    const isSelected = selectedItemIndex === idx;
                    return (
                      <tr
                        key={it.id || idx}
                        onClick={() => setSelectedItemIndex(idx)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center font-mono text-slate-400 tabular-nums">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {it.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {it.code} {it.barcode ? `· ${it.barcode}` : ''}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          {formatCurrency(it.unitPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateItemQuantity(idx, it.quantity - 1);
                              }}
                              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition-colors"
                              title="Diminuir"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-mono font-bold text-xs tabular-nums text-slate-900 dark:text-white">
                              {it.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateItemQuantity(idx, it.quantity + 1);
                              }}
                              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition-colors"
                              title="Aumentar"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                          {it.discount > 0 ? (
                            <span className="text-rose-600 dark:text-rose-400">
                              -{formatCurrency(it.discount)}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                          {formatCurrency(it.total)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(idx);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                            title="Remover Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Quick Shortcuts Hint Bar at bottom of items list */}
          <div className="bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 px-3 py-2 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span><kbd className="font-mono bg-white dark:bg-slate-700 px-1 py-0.5 rounded border border-slate-300 dark:border-slate-600">F2</kbd> Pesquisar</span>
              <span><kbd className="font-mono bg-white dark:bg-slate-700 px-1 py-0.5 rounded border border-slate-300 dark:border-slate-600">F3</kbd> Cliente</span>
              <span><kbd className="font-mono bg-white dark:bg-slate-700 px-1 py-0.5 rounded border border-slate-300 dark:border-slate-600">F4</kbd> Desconto</span>
              <span><kbd className="font-mono bg-white dark:bg-slate-700 px-1 py-0.5 rounded border border-slate-300 dark:border-slate-600">F5</kbd> Finalizar</span>
              <span><kbd className="font-mono bg-white dark:bg-slate-700 px-1 py-0.5 rounded border border-slate-300 dark:border-slate-600">F8</kbd> Cancelar Item</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Itens: {items.reduce((acc, it) => acc + it.quantity, 0)} un.
              </span>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: Totais & Botões Grandes de Ação (col 4) */}
        <div className="lg:col-span-4 flex flex-col gap-2 sm:gap-3">
          {/* Box de Totais */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span className="font-medium">SUBTOTAL</span>
                <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
                <span className="font-medium">DESCONTO (F4)</span>
                <span className="text-base font-bold font-mono tabular-nums">
                  -{formatCurrency(discount)}
                </span>
              </div>
              {addition > 0 && (
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span className="font-medium">ACRÉSCIMO</span>
                  <span className="text-base font-bold font-mono tabular-nums">
                    +{formatCurrency(addition)}
                  </span>
                </div>
              )}
            </div>

            {/* Total Grande Destacado */}
            <div className="mt-4 pt-3 border-t-2 border-slate-200 dark:border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                TOTAL A PAGAR
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight mt-1">
                {formatCurrency(total)}
              </div>
            </div>
          </div>

          {/* Botões Grandes de Ação (Seção 8 do Usuário) */}
          <div className="flex-1 flex flex-col gap-2">
            {/* FINALIZAR VENDA (F5) - O maior botão */}
            <button
              onClick={openPaymentModal}
              disabled={items.length === 0}
              className={`w-full py-4 px-4 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-sm transition-all ${
                items.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-[0.99]'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <DollarSign className="w-6 h-6" />
              <span>FINALIZAR VENDA (F5)</span>
            </button>

            {/* Linha 1 de Botões Secundários: Cliente / Desconto */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsCustomerModalOpen(true)}
                className="py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <UserIcon className="w-4 h-4 text-blue-600" />
                <span>CLIENTE (F3)</span>
              </button>
              <button
                onClick={() => setIsDiscountModalOpen(true)}
                className="py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Tag className="w-4 h-4 text-amber-600" />
                <span>DESCONTO (F4)</span>
              </button>
            </div>

            {/* Linha 2 de Botões: Suspender / Recuperar Venda */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSuspendSale}
                disabled={items.length === 0}
                className="py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <PauseCircle className="w-4 h-4 text-purple-600" />
                <span>SUSPENDER (F6)</span>
              </button>
              <button
                onClick={() => setIsSuspendedModalOpen(true)}
                className="py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors relative"
              >
                <PlayCircle className="w-4 h-4 text-indigo-600" />
                <span>RECUPERAR (F7)</span>
                {suspendedSales.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                    {suspendedSales.length}
                  </span>
                )}
              </button>
            </div>

            {/* Linha 3 de Botões: Observação / Cancelar Item */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsNotesModalOpen(true)}
                className="py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileText className="w-4 h-4 text-slate-600" />
                <span>OBSERVAÇÃO</span>
              </button>
              <button
                onClick={handleRemoveSelectedItem}
                disabled={items.length === 0}
                className="py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>CANCELAR ITEM (F8)</span>
              </button>
            </div>

            {/* CANCELAR VENDA (F9) */}
            <button
              onClick={() => {
                if (items.length > 0) setIsCancelConfirmOpen(true);
              }}
              disabled={items.length === 0}
              className="mt-auto py-2.5 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 disabled:opacity-50 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>CANCELAR VENDA INTEIRA (F9)</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: SELECIONAR CLIENTE (F3) */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Selecionar Cliente no PDV (F3)"
        subtitle="Vincular cliente cadastrado ou consumidor final à venda"
        maxWidth="lg"
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {customers.map((c) => {
              const isSelected = selectedCustomerId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCustomerId(c.id);
                    setIsCustomerModalOpen(false);
                    searchInputRef.current?.focus();
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/50 dark:border-blue-400'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                    <span>{c.name}</span>
                    {isSelected && <span className="text-[10px] text-blue-600 font-bold">Selecionado</span>}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-1">
                    {c.document ? formatCpfCnpj(c.document) : 'Consumidor Geral'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {c.city} - {c.state}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={() => setIsCustomerModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Fechar (ESC)
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 2: APLICAR DESCONTO (F4) */}
      <Modal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        title="Aplicar Desconto na Venda (F4)"
        subtitle="Informe o valor em Reais ou a porcentagem"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDiscountType('VALUE')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border ${
                discountType === 'VALUE'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Em Reais (R$)
            </button>
            <button
              type="button"
              onClick={() => setDiscountType('PERCENT')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border ${
                discountType === 'PERCENT'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Em Porcentagem (%)
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {discountType === 'VALUE' ? 'Valor do Desconto (R$):' : 'Percentual (%):'}
            </label>
            <input
              type="number"
              step="0.01"
              value={discountInputValue}
              onChange={(e) => setDiscountInputValue(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-lg font-mono font-bold dark:bg-slate-800 text-slate-900 dark:text-white"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsDiscountModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancelar (ESC)
            </button>
            <button
              type="button"
              onClick={() => {
                const val = parseFloat(discountInputValue) || 0;
                let calculated = 0;
                if (discountType === 'VALUE') {
                  calculated = Math.min(subtotal, Math.max(0, val));
                } else {
                  calculated = Math.min(subtotal, Math.max(0, (subtotal * val) / 100));
                }
                setDiscount(calculated);
                setIsDiscountModalOpen(false);
                addToast(`Desconto de ${formatCurrency(calculated)} aplicado!`, 'info');
                searchInputRef.current?.focus();
              }}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Aplicar Desconto
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: FINALIZAR VENDA & PAGAMENTO (F5) */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Finalizar Venda - Pagamento (F5)"
        subtitle={`Venda para ${selectedCustomer.name} - Total: ${formatCurrency(total)}`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {/* Header Totals */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Venda</span>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(total)}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Valor Recebido</span>
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatCurrency(totalPaid)}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Restante</span>
              <div
                className={`text-xl font-bold font-mono tabular-nums ${
                  remainingAmount > 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-400'
                }`}
              >
                {formatCurrency(remainingAmount)}
              </div>
            </div>
          </div>

          {/* Formas de Pagamento Rápidas */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Selecione a Forma de Pagamento
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {[
                { id: 'DINHEIRO', label: 'Dinheiro', color: 'emerald' },
                { id: 'PIX', label: 'PIX', color: 'teal' },
                { id: 'CARTAO_DEBITO', label: 'Débito', color: 'blue' },
                { id: 'CARTAO_CREDITO', label: 'Crédito', color: 'indigo' },
                { id: 'BOLETO', label: 'Boleto', color: 'amber' },
                { id: 'TRANSFERENCIA', label: 'Transferência', color: 'cyan' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setCurrentPayMethod(m.id as PaymentMethodType);
                    setPayAmountInput(remainingAmount > 0 ? remainingAmount.toFixed(2) : total.toFixed(2));
                  }}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition-all ${
                    currentPayMethod === m.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Valor a Adicionar nesta forma */}
          <div className="flex gap-2 items-end bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Valor para {currentPayMethod} (R$):
              </label>
              <input
                type="number"
                step="0.01"
                value={payAmountInput}
                onChange={(e) => setPayAmountInput(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono font-bold dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="button"
              onClick={handleAddPayment}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Adicionar Pagamento
            </button>
          </div>

          {/* Troco em Dinheiro se houver pagamento em dinheiro */}
          {payments.some((p) => p.method === 'DINHEIRO') && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="font-semibold text-amber-900 dark:text-amber-200">
                    Dinheiro Entregue pelo Cliente (para calcular troco):
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={cashGivenInput}
                    onChange={(e) => setCashGivenInput(e.target.value)}
                    placeholder="Valor em dinheiro..."
                    className="mt-1 px-3 py-1 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-md font-mono font-bold text-sm"
                  />
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider block text-[10px]">
                    TROCO:
                  </span>
                  <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatCurrency(changeAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Pagamentos Registrados */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Formas de Pagamento Adicionadas
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {p.method}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                      {formatCurrency(p.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePayment(p.id)}
                      className="text-slate-400 hover:text-rose-600"
                      title="Excluir forma"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Voltar (ESC)
            </button>
            <button
              type="button"
              onClick={handleConfirmFinalizeSale}
              disabled={totalPaid < total - 0.05}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-2 transition-all ${
                totalPaid >= total - 0.05
                  ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                  : 'bg-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar e Finalizar Venda (ENTER)</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 4: VENDAS SUSPENSAS (F7) */}
      <Modal
        isOpen={isSuspendedModalOpen}
        onClose={() => setIsSuspendedModalOpen(false)}
        title="Vendas Suspensas (F7)"
        subtitle="Selecione uma venda suspensa para retomar atendimento"
        maxWidth="lg"
      >
        <div className="space-y-3">
          {suspendedSales.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-500">
              Não há vendas suspensas no momento.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {suspendedSales.map((s) => (
                <div
                  key={s.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {s.customerName} &bull; {s.items.length} itens
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {s.time} &bull; Total: {formatCurrency(s.total)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => removeSuspendedSale(s.id)}
                      className="px-2 py-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResumeSale(s.id)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs"
                    >
                      Recuperar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsSuspendedModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Fechar (ESC)
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 5: OBSERVAÇÕES DA VENDA */}
      <Modal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        title="Observações da Venda"
        subtitle="Texto impresso no rodapé do comprovante ou pedido"
        maxWidth="md"
      >
        <div className="space-y-3">
          <textarea
            value={saleNotes}
            onChange={(e) => setSaleNotes(e.target.value)}
            rows={4}
            placeholder="Digite observações adicionais, placa do veículo, instruções de entrega..."
            className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800 text-slate-900 dark:text-white"
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsNotesModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg"
            >
              Salvar Observação
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL 6: AVISO / ABERTURA RÁPIDA DE CAIXA */}
      <Modal
        isOpen={isQuickCashierOpen}
        onClose={() => setIsQuickCashierOpen(false)}
        title="Abertura de Caixa Obrigatória"
        subtitle="Para realizar vendas no PDV, abra o caixa com o valor inicial em dinheiro."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>O caixa do turno atual encontra-se fechado. Deseja abri-lo agora com saldo inicial?</span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsQuickCashierOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                openCashier(150.0, 'Abertura rápida efetuada no PDV');
                setIsQuickCashierOpen(false);
                openPaymentModal();
              }}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Abrir com R$ 150,00 e Continuar
            </button>
          </div>
        </div>
      </Modal>

      {/* CONFIRMAÇÃO DE CANCELAMENTO DA VENDA INTEIRA (F9) */}
      <ConfirmDialog
        isOpen={isCancelConfirmOpen}
        title="Cancelar Venda Inteira? (F9)"
        message="Tem certeza que deseja cancelar esta venda? Todos os itens adicionados serão removidos do PDV."
        confirmText="Sim, Cancelar Venda"
        cancelText="Voltar"
        isDestructive={true}
        onConfirm={handleConfirmCancelCurrentSale}
        onCancel={() => setIsCancelConfirmOpen(false)}
      />
    </div>
  );
};
