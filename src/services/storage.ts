import {
  Company,
  Customer,
  Supplier,
  ProductGroup,
  ProductSubgroup,
  Product,
  User,
  SystemSettings,
  CashRegister,
  Sale,
  Order,
  AccountReceivable,
  AccountPayable,
  AuditLog,
  StockMovement,
} from '../types';
import {
  initialCompany,
  initialCustomers,
  initialSuppliers,
  initialGroups,
  initialSubgroups,
  initialProducts,
  initialUsers,
  initialSettings,
  initialCashRegister,
  initialSales,
  initialOrders,
  initialReceivables,
  initialPayables,
  initialStockMovements,
  initialAuditLogs,
} from './mockData';

const STORAGE_KEYS = {
  COMPANY: 'jgierp_company',
  CUSTOMERS: 'jgierp_customers',
  SUPPLIERS: 'jgierp_suppliers',
  GROUPS: 'jgierp_groups',
  SUBGROUPS: 'jgierp_subgroups',
  PRODUCTS: 'jgierp_products',
  USERS: 'jgierp_users',
  SETTINGS: 'jgierp_settings',
  CASH_REGISTER: 'jgierp_cash_register',
  SALES: 'jgierp_sales',
  ORDERS: 'jgierp_orders',
  RECEIVABLES: 'jgierp_receivables',
  PAYABLES: 'jgierp_payables',
  STOCK_MOVEMENTS: 'jgierp_stock_movements',
  AUDIT_LOGS: 'jgierp_audit_logs',
  SUSPENDED_SALES: 'jgierp_suspended_sales',
};

function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

export const StorageService = {
  getCompany(): Company {
    return getStorageItem(STORAGE_KEYS.COMPANY, initialCompany);
  },
  saveCompany(company: Company): void {
    setStorageItem(STORAGE_KEYS.COMPANY, company);
  },

  getSettings(): SystemSettings {
    return getStorageItem(STORAGE_KEYS.SETTINGS, initialSettings);
  },
  saveSettings(settings: SystemSettings): void {
    setStorageItem(STORAGE_KEYS.SETTINGS, settings);
  },

  getUsers(): User[] {
    return getStorageItem(STORAGE_KEYS.USERS, initialUsers);
  },
  saveUsers(users: User[]): void {
    setStorageItem(STORAGE_KEYS.USERS, users);
  },

  getCustomers(): Customer[] {
    return getStorageItem(STORAGE_KEYS.CUSTOMERS, initialCustomers);
  },
  saveCustomers(customers: Customer[]): void {
    setStorageItem(STORAGE_KEYS.CUSTOMERS, customers);
  },

  getSuppliers(): Supplier[] {
    return getStorageItem(STORAGE_KEYS.SUPPLIERS, initialSuppliers);
  },
  saveSuppliers(suppliers: Supplier[]): void {
    setStorageItem(STORAGE_KEYS.SUPPLIERS, suppliers);
  },

  getGroups(): ProductGroup[] {
    return getStorageItem(STORAGE_KEYS.GROUPS, initialGroups);
  },
  saveGroups(groups: ProductGroup[]): void {
    setStorageItem(STORAGE_KEYS.GROUPS, groups);
  },

  getSubgroups(): ProductSubgroup[] {
    return getStorageItem(STORAGE_KEYS.SUBGROUPS, initialSubgroups);
  },
  saveSubgroups(subgroups: ProductSubgroup[]): void {
    setStorageItem(STORAGE_KEYS.SUBGROUPS, subgroups);
  },

  getProducts(): Product[] {
    return getStorageItem(STORAGE_KEYS.PRODUCTS, initialProducts);
  },
  saveProducts(products: Product[]): void {
    setStorageItem(STORAGE_KEYS.PRODUCTS, products);
  },

  getCashRegister(): CashRegister | null {
    return getStorageItem(STORAGE_KEYS.CASH_REGISTER, initialCashRegister);
  },
  saveCashRegister(cashRegister: CashRegister | null): void {
    setStorageItem(STORAGE_KEYS.CASH_REGISTER, cashRegister);
  },

  getSales(): Sale[] {
    return getStorageItem(STORAGE_KEYS.SALES, initialSales);
  },
  saveSales(sales: Sale[]): void {
    setStorageItem(STORAGE_KEYS.SALES, sales);
  },

  getOrders(): Order[] {
    return getStorageItem(STORAGE_KEYS.ORDERS, initialOrders);
  },
  saveOrders(orders: Order[]): void {
    setStorageItem(STORAGE_KEYS.ORDERS, orders);
  },

  getReceivables(): AccountReceivable[] {
    return getStorageItem(STORAGE_KEYS.RECEIVABLES, initialReceivables);
  },
  saveReceivables(receivables: AccountReceivable[]): void {
    setStorageItem(STORAGE_KEYS.RECEIVABLES, receivables);
  },

  getPayables(): AccountPayable[] {
    return getStorageItem(STORAGE_KEYS.PAYABLES, initialPayables);
  },
  savePayables(payables: AccountPayable[]): void {
    setStorageItem(STORAGE_KEYS.PAYABLES, payables);
  },

  getStockMovements(): StockMovement[] {
    return getStorageItem(STORAGE_KEYS.STOCK_MOVEMENTS, initialStockMovements);
  },
  saveStockMovements(movements: StockMovement[]): void {
    setStorageItem(STORAGE_KEYS.STOCK_MOVEMENTS, movements);
  },

  getAuditLogs(): AuditLog[] {
    return getStorageItem(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
  },
  saveAuditLogs(logs: AuditLog[]): void {
    setStorageItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  getSuspendedSales(): Sale[] {
    return getStorageItem(STORAGE_KEYS.SUSPENDED_SALES, []);
  },
  saveSuspendedSales(sales: Sale[]): void {
    setStorageItem(STORAGE_KEYS.SUSPENDED_SALES, sales);
  },

  resetAllToDefaults(): void {
    localStorage.clear();
  },

  exportBackup(): string {
    const data = {
      company: this.getCompany(),
      settings: this.getSettings(),
      users: this.getUsers(),
      customers: this.getCustomers(),
      suppliers: this.getSuppliers(),
      groups: this.getGroups(),
      subgroups: this.getSubgroups(),
      products: this.getProducts(),
      cashRegister: this.getCashRegister(),
      sales: this.getSales(),
      orders: this.getOrders(),
      receivables: this.getReceivables(),
      payables: this.getPayables(),
      stockMovements: this.getStockMovements(),
      auditLogs: this.getAuditLogs(),
      timestamp: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.company) this.saveCompany(data.company);
      if (data.settings) this.saveSettings(data.settings);
      if (data.customers) this.saveCustomers(data.customers);
      if (data.suppliers) this.saveSuppliers(data.suppliers);
      if (data.products) this.saveProducts(data.products);
      if (data.sales) this.saveSales(data.sales);
      if (data.orders) this.saveOrders(data.orders);
      if (data.receivables) this.saveReceivables(data.receivables);
      if (data.payables) this.savePayables(data.payables);
      if (data.stockMovements) this.saveStockMovements(data.stockMovements);
      if (data.auditLogs) this.saveAuditLogs(data.auditLogs);
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  },
};
