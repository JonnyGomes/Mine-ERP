import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  Customer,
  Supplier,
  ProductGroup,
  ProductSubgroup,
  Sale,
  Order,
  CashRegister,
  AccountReceivable,
  AccountPayable,
  StockMovement,
  AuditLog,
  Company,
  SystemSettings,
  SaleItem,
  SalePayment,
  PaymentMethodType,
} from '../types';
import { StorageService } from '../services/storage';
import { useAuth } from './AuthContext';
import { getCurrentDateISO, getCurrentTime } from '../utils/formatters';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface PrintDocumentData {
  doc: Sale | Order;
  type: 'sale' | 'order';
  format: 'A4' | '58MM' | '80MM';
}

interface AppContextType {
  // State
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  groups: ProductGroup[];
  subgroups: ProductSubgroup[];
  sales: Sale[];
  orders: Order[];
  cashRegister: CashRegister | null;
  receivables: AccountReceivable[];
  payables: AccountPayable[];
  stockMovements: StockMovement[];
  auditLogs: AuditLog[];
  company: Company;
  settings: SystemSettings;
  suspendedSales: Sale[];
  toasts: ToastMessage[];
  printDoc: PrintDocumentData | null;

  // Actions
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  setPrintDoc: (data: PrintDocumentData | null) => void;
  openPrintModal: (doc: Sale | Order, type: 'sale' | 'order', format?: 'A4' | '58MM' | '80MM') => void;
  closePrintModal: () => void;

  // Products
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => boolean;

  // Customers & Suppliers
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => boolean;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;

  // Groups
  addGroup: (group: Omit<ProductGroup, 'id'>) => void;
  addSubgroup: (subgroup: Omit<ProductSubgroup, 'id'>) => void;

  // Sales & PDV
  createSale: (params: {
    customerId: string;
    customerName: string;
    customerDocument?: string;
    items: SaleItem[];
    payments: SalePayment[];
    discount: number;
    addition: number;
    notes?: string;
  }) => Sale | null;
  cancelSale: (saleId: string, reason: string) => boolean;
  suspendSale: (sale: Sale) => void;
  resumeSale: (saleId: string) => Sale | null;
  removeSuspendedSale: (saleId: string) => void;

  // Orders
  createOrder: (params: {
    customerId: string;
    customerName: string;
    customerDocument?: string;
    items: SaleItem[];
    discount: number;
    addition: number;
    paymentMethodExpected: string;
    notes?: string;
    status?: Order['status'];
  }) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  convertOrderToSale: (orderId: string) => Sale | null;

  // Cash Register
  openCashier: (initialAmount: number, notes?: string) => void;
  closeCashier: (countedTotal: number, notes?: string) => void;
  addCashMovement: (type: 'SANGRIA' | 'SUPRIMENTO', amount: number, reason: string) => void;

  // Stock
  recordStockMovement: (
    productId: string,
    quantity: number,
    type: StockMovement['type'],
    reason: string,
    docNumber?: string
  ) => boolean;

  // Finance
  payReceivable: (id: string, paidAmount: number) => void;
  addReceivable: (receivable: Omit<AccountReceivable, 'id'>) => void;
  payPayable: (id: string, paidAmount: number) => void;
  addPayable: (payable: Omit<AccountPayable, 'id'>) => void;

  // System
  updateCompany: (company: Company) => void;
  updateSettings: (settings: SystemSettings) => void;
  logAudit: (action: string, entity: string, details: string, entityId?: string, oldValue?: string, newValue?: string) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // Primary state loaded from storage
  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());
  const [customers, setCustomers] = useState<Customer[]>(() => StorageService.getCustomers());
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => StorageService.getSuppliers());
  const [groups, setGroups] = useState<ProductGroup[]>(() => StorageService.getGroups());
  const [subgroups, setSubgroups] = useState<ProductSubgroup[]>(() => StorageService.getSubgroups());
  const [sales, setSales] = useState<Sale[]>(() => StorageService.getSales());
  const [orders, setOrders] = useState<Order[]>(() => StorageService.getOrders());
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(() => StorageService.getCashRegister());
  const [receivables, setReceivables] = useState<AccountReceivable[]>(() => StorageService.getReceivables());
  const [payables, setPayables] = useState<AccountPayable[]>(() => StorageService.getPayables());
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => StorageService.getStockMovements());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());
  const [company, setCompany] = useState<Company>(() => StorageService.getCompany());
  const [settings, setSettings] = useState<SystemSettings>(() => StorageService.getSettings());
  const [suspendedSales, setSuspendedSales] = useState<Sale[]>(() => StorageService.getSuspendedSales());

  // UI state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [printDoc, setPrintDoc] = useState<PrintDocumentData | null>(null);

  // Sync to Storage on changes
  useEffect(() => StorageService.saveProducts(products), [products]);
  useEffect(() => StorageService.saveCustomers(customers), [customers]);
  useEffect(() => StorageService.saveSuppliers(suppliers), [suppliers]);
  useEffect(() => StorageService.saveGroups(groups), [groups]);
  useEffect(() => StorageService.saveSubgroups(subgroups), [subgroups]);
  useEffect(() => StorageService.saveSales(sales), [sales]);
  useEffect(() => StorageService.saveOrders(orders), [orders]);
  useEffect(() => StorageService.saveCashRegister(cashRegister), [cashRegister]);
  useEffect(() => StorageService.saveReceivables(receivables), [receivables]);
  useEffect(() => StorageService.savePayables(payables), [payables]);
  useEffect(() => StorageService.saveStockMovements(stockMovements), [stockMovements]);
  useEffect(() => StorageService.saveAuditLogs(auditLogs), [auditLogs]);
  useEffect(() => StorageService.saveCompany(company), [company]);
  useEffect(() => StorageService.saveSettings(settings), [settings]);
  useEffect(() => StorageService.saveSuspendedSales(suspendedSales), [suspendedSales]);

  // Toast Helpers
  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Audit Helper
  const logAudit = useCallback((
    action: string,
    entity: string,
    details: string,
    entityId?: string,
    oldValue?: string,
    newValue?: string
  ) => {
    const newLog: AuditLog = {
      id: 'aud_' + Date.now(),
      date: getCurrentDateISO(),
      time: getCurrentTime(),
      userId: currentUser.id,
      userName: currentUser.name,
      action: action.toUpperCase(),
      entity: entity.toUpperCase(),
      entityId,
      details,
      oldValue,
      newValue,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  }, [currentUser]);

  // Print helper
  const openPrintModal = useCallback((
    doc: Sale | Order,
    type: 'sale' | 'order',
    format?: 'A4' | '58MM' | '80MM'
  ) => {
    setPrintDoc({
      doc,
      type,
      format: format || settings.defaultPrintFormat || 'A4',
    });
  }, [settings.defaultPrintFormat]);

  const closePrintModal = useCallback(() => {
    setPrintDoc(null);
  }, []);

  // Products CRUD
  const addProduct = useCallback((prodData: Omit<Product, 'id'>) => {
    const id = 'prod_' + Date.now();
    const newProd: Product = { ...prodData, id };
    setProducts((prev) => [newProd, ...prev]);
    logAudit('CADASTRO DE PRODUTO', 'PRODUTO', `Produto criado: ${newProd.name} (${newProd.code})`, id);
    addToast(`Produto "${newProd.name}" cadastrado com sucesso!`, 'success');
  }, [logAudit, addToast]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          if (updates.salePrice !== undefined && updates.salePrice !== p.salePrice) {
            logAudit(
              'ALTERAÇÃO DE PREÇO',
              'PRODUTO',
              `Preço de venda alterado no produto ${p.name}`,
              id,
              `R$ ${p.salePrice.toFixed(2)}`,
              `R$ ${updates.salePrice.toFixed(2)}`
            );
          }
          return updated;
        }
        return p;
      })
    );
    addToast('Produto atualizado com sucesso!', 'success');
  }, [logAudit, addToast]);

  const deleteProduct = useCallback((id: string): boolean => {
    const p = products.find((prod) => prod.id === id);
    if (!p) return false;
    setProducts((prev) => prev.filter((prod) => prod.id !== id));
    logAudit('EXCLUSÃO DE PRODUTO', 'PRODUTO', `Produto excluído: ${p.name} (${p.code})`, id);
    addToast('Produto excluído com sucesso.', 'info');
    return true;
  }, [products, logAudit, addToast]);

  // Customers & Suppliers
  const addCustomer = useCallback((custData: Omit<Customer, 'id' | 'createdAt'>) => {
    const id = 'cust_' + Date.now();
    const newCust: Customer = {
      ...custData,
      id,
      createdAt: getCurrentDateISO(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    logAudit('CADASTRO DE CLIENTE', 'CLIENTE', `Cliente cadastrado: ${newCust.name}`, id);
    addToast(`Cliente "${newCust.name}" cadastrado com sucesso!`, 'success');
  }, [logAudit, addToast]);

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    addToast('Cliente atualizado com sucesso!', 'success');
  }, [addToast]);

  const deleteCustomer = useCallback((id: string): boolean => {
    const c = customers.find((cust) => cust.id === id);
    if (!c) return false;
    setCustomers((prev) => prev.filter((cust) => cust.id !== id));
    logAudit('EXCLUSÃO DE CLIENTE', 'CLIENTE', `Cliente excluído: ${c.name}`, id);
    addToast('Cliente removido com sucesso.', 'info');
    return true;
  }, [customers, logAudit, addToast]);

  const addSupplier = useCallback((supData: Omit<Supplier, 'id'>) => {
    const id = 'sup_' + Date.now();
    const newSup: Supplier = { ...supData, id };
    setSuppliers((prev) => [newSup, ...prev]);
    addToast(`Fornecedor "${newSup.name}" cadastrado!`, 'success');
  }, [addToast]);

  const updateSupplier = useCallback((id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    addToast('Fornecedor atualizado com sucesso!', 'success');
  }, [addToast]);

  const addGroup = useCallback((groupData: Omit<ProductGroup, 'id'>) => {
    const id = 'grp_' + Date.now();
    setGroups((prev) => [...prev, { ...groupData, id }]);
    addToast('Grupo criado com sucesso!', 'success');
  }, [addToast]);

  const addSubgroup = useCallback((subgroupData: Omit<ProductSubgroup, 'id'>) => {
    const id = 'sub_' + Date.now();
    setSubgroups((prev) => [...prev, { ...subgroupData, id }]);
    addToast('Subgrupo criado com sucesso!', 'success');
  }, [addToast]);

  // Stock Movement Helper
  const recordStockMovement = useCallback((
    productId: string,
    quantity: number,
    type: StockMovement['type'],
    reason: string,
    docNumber?: string
  ): boolean => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return false;

    // Check negative stock rule
    let newQty = prod.currentStock;
    if (type === 'SAIDA' || type === 'VENDA') {
      newQty -= quantity;
      if (newQty < 0 && !settings.allowNegativeStock) {
        addToast(`Estoque insuficiente para "${prod.name}" (Atual: ${prod.currentStock}, Necessário: ${quantity})`, 'error');
        return false;
      }
    } else if (type === 'ENTRADA' || type === 'CANCELAMENTO' || type === 'DEVOLUCAO') {
      newQty += quantity;
    } else if (type === 'AJUSTE') {
      newQty = quantity;
    }

    // Update Product Stock
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, currentStock: newQty } : p))
    );

    // Record Stock Movement Log
    const movement: StockMovement = {
      id: 'mov_' + Date.now() + '_' + Math.random().toString(36).substr(2, 3),
      productId,
      productName: prod.name,
      quantity,
      type,
      date: getCurrentDateISO(),
      time: getCurrentTime(),
      userId: currentUser.id,
      userName: currentUser.name,
      documentNumber: docNumber,
      reason,
    };
    setStockMovements((prev) => [movement, ...prev]);
    return true;
  }, [products, settings.allowNegativeStock, currentUser, addToast]);

  // Cash Register Operations
  const openCashier = useCallback((initialAmount: number, notes?: string) => {
    if (cashRegister && cashRegister.status === 'ABERTO') {
      addToast('O caixa já está aberto!', 'warning');
      return;
    }

    const newRegister: CashRegister = {
      id: 'cx_' + Date.now(),
      openingDate: getCurrentDateISO(),
      openingTime: getCurrentTime(),
      openedByUserId: currentUser.id,
      openedByUserName: currentUser.name,
      initialAmount,
      cashSales: 0,
      pixSales: 0,
      debitSales: 0,
      creditSales: 0,
      otherSales: 0,
      bleedAmount: 0,
      supplyAmount: 0,
      expectedTotal: initialAmount,
      status: 'ABERTO',
      notes,
    };

    setCashRegister(newRegister);
    logAudit('ABERTURA DE CAIXA', 'CAIXA', `Caixa aberto com R$ ${initialAmount.toFixed(2)}`, newRegister.id);
    addToast('Caixa aberto com sucesso!', 'success');
  }, [cashRegister, currentUser, logAudit, addToast]);

  const closeCashier = useCallback((countedTotal: number, notes?: string) => {
    if (!cashRegister || cashRegister.status === 'FECHADO') {
      addToast('Não há caixa aberto para fechar!', 'error');
      return;
    }

    const diff = countedTotal - cashRegister.expectedTotal;
    const closed: CashRegister = {
      ...cashRegister,
      closingDate: getCurrentDateISO(),
      closingTime: getCurrentTime(),
      closedByUserId: currentUser.id,
      closedByUserName: currentUser.name,
      countedTotal,
      difference: diff,
      status: 'FECHADO',
      notes: notes || cashRegister.notes,
    };

    setCashRegister(closed);
    logAudit(
      'FECHAMENTO DE CAIXA',
      'CAIXA',
      `Caixa fechado. Esperado: R$ ${cashRegister.expectedTotal.toFixed(2)}, Informado: R$ ${countedTotal.toFixed(2)}, Diferença: R$ ${diff.toFixed(2)}`,
      cashRegister.id
    );
    addToast('Caixa fechado com sucesso!', 'success');
  }, [cashRegister, currentUser, logAudit, addToast]);

  const addCashMovement = useCallback((type: 'SANGRIA' | 'SUPRIMENTO', amount: number, reason: string) => {
    if (!cashRegister || cashRegister.status !== 'ABERTO') {
      addToast('É necessário ter um caixa aberto para registrar movimentação!', 'error');
      return;
    }

    if (amount <= 0) {
      addToast('Valor deve ser maior que zero.', 'warning');
      return;
    }

    if (type === 'SANGRIA' && amount > cashRegister.expectedTotal) {
      addToast('Valor da sangria superior ao saldo em dinheiro do caixa!', 'error');
      return;
    }

    const updated = { ...cashRegister };
    if (type === 'SANGRIA') {
      updated.bleedAmount += amount;
      updated.expectedTotal -= amount;
    } else {
      updated.supplyAmount += amount;
      updated.expectedTotal += amount;
    }

    setCashRegister(updated);
    logAudit(
      type === 'SANGRIA' ? 'SANGRIA DE CAIXA' : 'SUPRIMENTO DE CAIXA',
      'CAIXA',
      `${type}: R$ ${amount.toFixed(2)} - Motivo: ${reason}`,
      cashRegister.id
    );
    addToast(`${type} de R$ ${amount.toFixed(2)} registrada!`, 'success');
  }, [cashRegister, logAudit, addToast]);

  // PDV: Create Sale
  const createSale = useCallback((params: {
    customerId: string;
    customerName: string;
    customerDocument?: string;
    items: SaleItem[];
    payments: SalePayment[];
    discount: number;
    addition: number;
    notes?: string;
  }): Sale | null => {
    // 1. Validation
    if (!params.items || params.items.length === 0) {
      addToast('Não é possível finalizar venda sem produtos!', 'error');
      return null;
    }

    const invalidQty = params.items.some((it) => it.quantity <= 0);
    if (invalidQty) {
      addToast('Não é permitida quantidade menor ou igual a zero.', 'error');
      return null;
    }

    const subtotal = params.items.reduce((acc, it) => acc + it.total, 0);
    const total = Math.max(0, subtotal - (params.discount || 0) + (params.addition || 0));

    if (!params.payments || params.payments.length === 0) {
      addToast('Não é possível finalizar venda sem forma de pagamento!', 'error');
      return null;
    }

    const totalPaid = params.payments.reduce((acc, p) => acc + p.amount, 0);
    if (totalPaid < total - 0.05) {
      addToast(`Valor pago (R$ ${totalPaid.toFixed(2)}) é menor que o total da venda (R$ ${total.toFixed(2)})!`, 'error');
      return null;
    }

    // 2. Validate Stock Constraints
    if (!settings.allowNegativeStock) {
      for (const it of params.items) {
        const prod = products.find((p) => p.id === it.productId);
        if (prod && prod.currentStock < it.quantity) {
          addToast(
            `Estoque insuficiente para "${prod.name}". Disponível: ${prod.currentStock}, Solicitado: ${it.quantity}`,
            'error'
          );
          return null;
        }
      }
    }

    // Generate Sale Number
    const saleNum = String(sales.length + 101).padStart(6, '0');
    const newSale: Sale = {
      id: 'sale_' + Date.now(),
      number: saleNum,
      date: getCurrentDateISO(),
      time: getCurrentTime(),
      customerId: params.customerId,
      customerName: params.customerName,
      customerDocument: params.customerDocument,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      subtotal,
      discount: params.discount || 0,
      addition: params.addition || 0,
      total,
      status: 'FINALIZADA',
      notes: params.notes,
      items: params.items,
      payments: params.payments,
      cashRegisterId: cashRegister?.id,
    };

    // 3. Decrease Product Stock & Record Stock Movements
    setProducts((prev) =>
      prev.map((p) => {
        const item = params.items.find((it) => it.productId === p.id);
        if (item) {
          return { ...p, currentStock: p.currentStock - item.quantity };
        }
        return p;
      })
    );

    const movementsToAdd: StockMovement[] = params.items.map((it) => ({
      id: 'mov_' + Date.now() + '_' + Math.random().toString(36).substr(2, 3),
      productId: it.productId,
      productName: it.name,
      quantity: it.quantity,
      type: 'VENDA',
      date: getCurrentDateISO(),
      time: getCurrentTime(),
      userId: currentUser.id,
      userName: currentUser.name,
      documentNumber: saleNum,
      reason: `Venda PDV nº ${saleNum}`,
    }));
    setStockMovements((prev) => [...movementsToAdd, ...prev]);

    // 4. Update Cash Register if open
    if (cashRegister && cashRegister.status === 'ABERTO') {
      const updatedRegister = { ...cashRegister };
      params.payments.forEach((pay) => {
        if (pay.method === 'DINHEIRO') {
          updatedRegister.cashSales += pay.amount;
          updatedRegister.expectedTotal += pay.amount;
        } else if (pay.method === 'PIX') {
          updatedRegister.pixSales += pay.amount;
        } else if (pay.method === 'CARTAO_DEBITO') {
          updatedRegister.debitSales += pay.amount;
        } else if (pay.method === 'CARTAO_CREDITO') {
          updatedRegister.creditSales += pay.amount;
        } else {
          updatedRegister.otherSales += pay.amount;
        }
      });
      setCashRegister(updatedRegister);
    }

    // 5. Generate Accounts Receivable if paid via Boleto / Credito
    const boletoOrCreditPayments = params.payments.filter(
      (p) => p.method === 'BOLETO' || p.method === 'CREDITO_CLIENTE'
    );
    if (boletoOrCreditPayments.length > 0 && params.customerId !== 'cust_consumer') {
      boletoOrCreditPayments.forEach((p, idx) => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30 * (idx + 1));
        const rec: AccountReceivable = {
          id: 'rec_' + Date.now() + '_' + idx,
          customerId: params.customerId,
          customerName: params.customerName,
          documentNumber: `BOL-${saleNum}-${idx + 1}`,
          saleNumber: saleNum,
          installmentNumber: idx + 1,
          totalInstallments: boletoOrCreditPayments.length,
          issueDate: getCurrentDateISO(),
          dueDate: dueDate.toISOString().split('T')[0],
          amount: p.amount,
          paidAmount: 0,
          balance: p.amount,
          status: 'PENDENTE',
          notes: `Gerado a partir da venda ${saleNum}`,
        };
        setReceivables((prev) => [rec, ...prev]);
      })
    }

    // 6. Record Audit Log
    const payMethodsStr = params.payments.map((p) => `${p.method}: R$ ${p.amount.toFixed(2)}`).join(', ');
    logAudit(
      'VENDA FINALIZADA',
      'VENDA',
      `Venda nº ${saleNum} no total de R$ ${total.toFixed(2)} (${payMethodsStr}) para ${params.customerName}`,
      newSale.id
    );

    // 7. Save Sale
    setSales((prev) => [newSale, ...prev]);
    addToast(`Venda nº ${saleNum} finalizada com sucesso!`, 'success');

    return newSale;
  }, [sales.length, currentUser, products, settings.allowNegativeStock, cashRegister, logAudit, addToast]);

  // Cancel Sale
  const cancelSale = useCallback((saleId: string, reason: string): boolean => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return false;

    if (sale.status === 'CANCELADA') {
      addToast('Esta venda já está cancelada.', 'warning');
      return false;
    }

    // 1. Revert product stock
    setProducts((prev) =>
      prev.map((p) => {
        const item = sale.items.find((it) => it.productId === p.id);
        if (item) {
          return { ...p, currentStock: p.currentStock + item.quantity };
        }
        return p;
      })
    );

    // 2. Stock movement log
    const returnMovements: StockMovement[] = sale.items.map((it) => ({
      id: 'mov_' + Date.now() + '_' + Math.random().toString(36).substr(2, 3),
      productId: it.productId,
      productName: it.name,
      quantity: it.quantity,
      type: 'CANCELAMENTO',
      date: getCurrentDateISO(),
      time: getCurrentTime(),
      userId: currentUser.id,
      userName: currentUser.name,
      documentNumber: sale.number,
      reason: `Cancelamento de venda nº ${sale.number}: ${reason}`,
    }));
    setStockMovements((prev) => [...returnMovements, ...prev]);

    // 3. Mark sale as canceled
    setSales((prev) =>
      prev.map((s) => (s.id === saleId ? { ...s, status: 'CANCELADA', cancellationReason: reason } : s))
    );

    // 4. Audit
    logAudit('CANCELAMENTO DE VENDA', 'VENDA', `Venda nº ${sale.number} cancelada. Motivo: ${reason}`, saleId);
    addToast(`Venda nº ${sale.number} cancelada. Produtos devolvidos ao estoque.`, 'info');
    return true;
  }, [sales, currentUser, logAudit, addToast]);

  // Suspended Sales
  const suspendSale = useCallback((sale: Sale) => {
    setSuspendedSales((prev) => [...prev, sale]);
    logAudit('VENDA SUSPENSA', 'VENDA', `Venda suspensa com ${sale.items.length} itens.`);
    addToast('Venda suspensa. Você pode recuperá-la a qualquer momento (F7).', 'info');
  }, [logAudit, addToast]);

  const resumeSale = useCallback((saleId: string): Sale | null => {
    const found = suspendedSales.find((s) => s.id === saleId);
    if (!found) return null;
    setSuspendedSales((prev) => prev.filter((s) => s.id !== saleId));
    addToast('Venda suspensa recuperada no PDV!', 'success');
    return found;
  }, [suspendedSales, addToast]);

  const removeSuspendedSale = useCallback((saleId: string) => {
    setSuspendedSales((prev) => prev.filter((s) => s.id !== saleId));
  }, []);

  // Orders
  const createOrder = useCallback((params: {
    customerId: string;
    customerName: string;
    customerDocument?: string;
    items: SaleItem[];
    discount: number;
    addition: number;
    paymentMethodExpected: string;
    notes?: string;
    status?: Order['status'];
  }): Order => {
    const subtotal = params.items.reduce((acc, it) => acc + it.total, 0);
    const total = Math.max(0, subtotal - (params.discount || 0) + (params.addition || 0));
    const orderNum = String(orders.length + 50).padStart(6, '0');

    const newOrder: Order = {
      id: 'ord_' + Date.now(),
      number: orderNum,
      date: getCurrentDateISO(),
      time: getCurrentTime(),
      customerId: params.customerId,
      customerName: params.customerName,
      customerDocument: params.customerDocument,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      subtotal,
      discount: params.discount,
      addition: params.addition,
      total,
      paymentMethodExpected: params.paymentMethodExpected,
      notes: params.notes,
      status: params.status || 'ABERTO',
      items: params.items,
    };

    setOrders((prev) => [newOrder, ...prev]);
    logAudit('PEDIDO CRIADO', 'PEDIDO', `Pedido nº ${orderNum} criado para ${params.customerName}`, newOrder.id);
    addToast(`Pedido nº ${orderNum} gerado com sucesso!`, 'success');
    return newOrder;
  }, [orders.length, currentUser, logAudit, addToast]);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    logAudit('ALTERAÇÃO STATUS PEDIDO', 'PEDIDO', `Pedido atualizado para ${status}`, orderId);
    addToast(`Status do pedido atualizado para ${status}!`, 'info');
  }, [logAudit, addToast]);

  const convertOrderToSale = useCallback((orderId: string): Sale | null => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    const defaultPayment: SalePayment = {
      id: 'pay_' + Date.now(),
      method: (order.paymentMethodExpected as PaymentMethodType) || 'DINHEIRO',
      amount: order.total,
    };

    const sale = createSale({
      customerId: order.customerId,
      customerName: order.customerName,
      customerDocument: order.customerDocument,
      items: order.items,
      payments: [defaultPayment],
      discount: order.discount,
      addition: order.addition,
      notes: `Convertido do pedido nº ${order.number}. ${order.notes || ''}`,
    });

    if (sale) {
      updateOrderStatus(orderId, 'FINALIZADO');
    }
    return sale;
  }, [orders, createSale, updateOrderStatus]);

  // Finance Actions
  const payReceivable = useCallback((id: string, paidAmount: number) => {
    setReceivables((prev) =>
      prev.map((rec) => {
        if (rec.id === id) {
          const newPaid = rec.paidAmount + paidAmount;
          const newBalance = Math.max(0, rec.amount - newPaid);
          const newStatus = newBalance === 0 ? 'PAGO' : 'PARCIAL';
          return {
            ...rec,
            paidAmount: newPaid,
            balance: newBalance,
            status: newStatus,
            paymentDate: newStatus === 'PAGO' ? getCurrentDateISO() : rec.paymentDate,
          };
        }
        return rec;
      })
    );
    addToast('Pagamento da conta a receber registrado!', 'success');
  }, [addToast]);

  const addReceivable = useCallback((recData: Omit<AccountReceivable, 'id'>) => {
    const id = 'rec_' + Date.now();
    setReceivables((prev) => [{ ...recData, id }, ...prev]);
    addToast('Conta a receber cadastrada!', 'success');
  }, [addToast]);

  const payPayable = useCallback((id: string, paidAmount: number) => {
    setPayables((prev) =>
      prev.map((pay) => {
        if (pay.id === id) {
          const newPaid = pay.paidAmount + paidAmount;
          const newBalance = Math.max(0, pay.amount - newPaid);
          const newStatus = newBalance === 0 ? 'PAGO' : 'PARCIAL';
          return {
            ...pay,
            paidAmount: newPaid,
            balance: newBalance,
            status: newStatus,
            paymentDate: newStatus === 'PAGO' ? getCurrentDateISO() : pay.paymentDate,
          };
        }
        return pay;
      })
    );
    addToast('Pagamento de conta a pagar registrado com sucesso!', 'success');
  }, [addToast]);

  const addPayable = useCallback((payableData: Omit<AccountPayable, 'id'>) => {
    const id = 'pay_' + Date.now();
    setPayables((prev) => [{ ...payableData, id }, ...prev]);
    addToast('Conta a pagar cadastrada com sucesso!', 'success');
  }, [addToast]);

  const updateCompany = useCallback((comp: Company) => {
    setCompany(comp);
    addToast('Dados da empresa atualizados!', 'success');
  }, [addToast]);

  const updateSettings = useCallback((sett: SystemSettings) => {
    setSettings(sett);
    addToast('Configurações atualizadas com sucesso!', 'success');
  }, [addToast]);

  const resetAllData = useCallback(() => {
    StorageService.resetAllToDefaults();
    window.location.reload();
  }, []);

  return (
    <AppContext.Provider
      value={{
        products,
        customers,
        suppliers,
        groups,
        subgroups,
        sales,
        orders,
        cashRegister,
        receivables,
        payables,
        stockMovements,
        auditLogs,
        company,
        settings,
        suspendedSales,
        toasts,
        printDoc,

        addToast,
        removeToast,
        setPrintDoc,
        openPrintModal,
        closePrintModal,

        addProduct,
        updateProduct,
        deleteProduct,

        addCustomer,
        updateCustomer,
        deleteCustomer,
        addSupplier,
        updateSupplier,

        addGroup,
        addSubgroup,

        createSale,
        cancelSale,
        suspendSale,
        resumeSale,
        removeSuspendedSale,

        createOrder,
        updateOrderStatus,
        convertOrderToSale,

        openCashier,
        closeCashier,
        addCashMovement,

        recordStockMovement,

        payReceivable,
        addReceivable,
        payPayable,
        addPayable,

        updateCompany,
        updateSettings,
        logAudit,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
