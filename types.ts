export interface TransformerEntry {
  id: string;
  serialNumber: string;
  customerName: string;
  project: string;
  dispatchDate: string;
  ratingKVA: number;
  voltageRatio: string;
  commissioningDueDate: string;
  sourceWarehouse: string;
  shippingAddress: string;
  warrantyMonthsComm: number;
  warrantyMonthsDispatch: number;
  warrantyDateDispatch: string; // Calculated
  pbgDueDate: string;
  pbgAmount: number;
  commissioningDoneDate: string | null;
  status: 'Dispatched' | 'Commissioned' | 'Overdue';
  // New Fields
  salesPerson: string;
  territory: string;
  state: string;
  narration: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  LIST = 'LIST',
  ADD = 'ADD',
  EDIT = 'EDIT',
  AI_INSIGHTS = 'AI_INSIGHTS'
}