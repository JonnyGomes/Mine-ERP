export type UserRole = 'ADMINISTRADOR' | 'GERENTE' | 'VENDEDOR' | 'CAIXA' | 'ESTOQUISTA';

export type PermissionKey =
  | 'view_product'
  | 'edit_product'
  | 'delete_product'
  | 'change_price'
  | 'give_discount'
  | 'cancel_sale'
  | 'open_cashier'
  | 'close_cashier'
  | 'view_finance'
  | 'delete_order'
  | 'manage_users'
  | 'manage_stock';

export interface User {
  id: string;
  name: string;
  login: string;
  email: string;
  role: UserRole;
  status: 'ATIVO' | 'INATIVO';
  permissions: PermissionKey[];
  avatar?: string;
  lastLogin?: string;
}

export interface Company {
  id: string;
  name: string;
  tradeName: string;
  cnpj: string;
  stateRegistration: string;
  phone: string;
  whatsapp: string;
  email: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  logoUrl?: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  tradeName?: string;
  document: string; // CPF or CNPJ
  type: 'PF' | 'PJ';
  rgIe?: string;
  phone: string;
  whatsapp?: string;
  email: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  notes?: string;
  creditLimit: number;
  status: 'ATIVO' | 'INATIVO';
  createdAt: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  tradeName?: string;
  cnpj: string;
  ie?: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  contactPerson?: string;
  status: 'ATIVO' | 'INATIVO';
}

export interface ProductGroup {
  id: string;
  name: string;
  description?: string;
}

export interface ProductSubgroup {
  id: string;
  groupId: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  code: string;
  barcode: string;
  name: string;
  description?: string;
  unit: 'UN' | 'KG' | 'CX' | 'LT' | 'FD' | 'MT' | 'PC';
  groupId: string;
  groupName: string;
  subgroupId?: string;
  subgroupName?: string;
  brand?: string;
  supplierId?: string;
  supplierName?: string;
  reference?: string;
  ncm: string;
  cest?: string;
  cfop: string;
  cst?: string;
  csosn?: string;
  costPrice: number;
  salePrice: number;
  minPrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
  location?: string;
  active: boolean;
}

export type StockMovementType =
  | 'ENTRADA'
  | 'SAIDA'
  | 'AJUSTE'
  | 'VENDA'
  | 'CANCELAMENTO'
  | 'DEVOLUCAO';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  type: StockMovementType;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  userId: string;
  userName: string;
  documentNumber?: string;
  reason: string;
}

export type PaymentMethodType =
  | 'DINHEIRO'
  | 'PIX'
  | 'CARTAO_DEBITO'
  | 'CARTAO_CREDITO'
  | 'BOLETO'
  | 'TRANSFERENCIA'
  | 'CREDITO_CLIENTE';

export interface SalePayment {
  id: string;
  method: PaymentMethodType;
  amount: number;
  installments?: number;
}

export interface SaleItem {
  id: string;
  productId: string;
  code: string;
  barcode: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  notes?: string;
}

export type SaleStatus = 'FINALIZADA' | 'CANCELADA' | 'SUSPENSA';

export interface Sale {
  id: string;
  number: string;
  date: string;
  time: string;
  customerId: string;
  customerName: string;
  customerDocument?: string;
  sellerId: string;
  sellerName: string;
  subtotal: number;
  discount: number;
  addition: number;
  total: number;
  status: SaleStatus;
  notes?: string;
  items: SaleItem[];
  payments: SalePayment[];
  cashRegisterId?: string;
  cancellationReason?: string;
}

export type CashRegisterStatus = 'ABERTO' | 'FECHADO';

export interface CashRegister {
  id: string;
  openingDate: string;
  openingTime: string;
  closingDate?: string;
  closingTime?: string;
  openedByUserId: string;
  openedByUserName: string;
  closedByUserId?: string;
  closedByUserName?: string;
  initialAmount: number;
  cashSales: number;
  pixSales: number;
  debitSales: number;
  creditSales: number;
  otherSales: number;
  bleedAmount: number; // Sangrias
  supplyAmount: number; // Suprimentos
  expectedTotal: number;
  countedTotal?: number;
  difference?: number;
  status: CashRegisterStatus;
  notes?: string;
}

export type CashMovementType = 'SUPRIMENTO' | 'SANGRIA' | 'VENDA' | 'ESTORNO';

export interface CashMovement {
  id: string;
  cashRegisterId: string;
  type: CashMovementType;
  amount: number;
  paymentMethod: PaymentMethodType;
  date: string;
  time: string;
  userId: string;
  userName: string;
  reason: string;
  saleId?: string;
}

export type OrderStatus =
  | 'RASCUNHO'
  | 'ABERTO'
  | 'EM_PROCESSAMENTO'
  | 'SEPARACAO'
  | 'FINALIZADO'
  | 'CANCELADO';

export interface Order {
  id: string;
  number: string;
  date: string;
  time: string;
  customerId: string;
  customerName: string;
  customerDocument?: string;
  sellerId: string;
  sellerName: string;
  subtotal: number;
  discount: number;
  addition: number;
  total: number;
  paymentMethodExpected: string;
  notes?: string;
  status: OrderStatus;
  items: SaleItem[];
}

export type ReceivableStatus = 'PENDENTE' | 'PARCIAL' | 'PAGO' | 'VENCIDO' | 'CANCELADO';

export interface AccountReceivable {
  id: string;
  customerId: string;
  customerName: string;
  documentNumber: string;
  saleNumber?: string;
  installmentNumber: number;
  totalInstallments: number;
  issueDate: string;
  dueDate: string;
  paymentDate?: string;
  amount: number;
  paidAmount: number;
  balance: number;
  status: ReceivableStatus;
  notes?: string;
}

export type PayableStatus = 'PENDENTE' | 'PARCIAL' | 'PAGO' | 'VENCIDO' | 'CANCELADO';

export interface AccountPayable {
  id: string;
  supplierId: string;
  supplierName: string;
  documentNumber: string;
  category: string;
  issueDate: string;
  dueDate: string;
  paymentDate?: string;
  amount: number;
  paidAmount: number;
  balance: number;
  status: PayableStatus;
  notes?: string;
}

export interface AuditLog {
  id: string;
  date: string;
  time: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  oldValue?: string;
  newValue?: string;
}

export interface SystemSettings {
  defaultPrintFormat: 'A4' | '58MM' | '80MM';
  autoPrintSale: boolean;
  autoPrintOrder: boolean;
  printDuplicate: boolean;
  printReceipt: boolean;
  allowNegativeStock: boolean;
  footerMessage: string;
  printCopies: number;
  requireCashierForSale: boolean;
}
