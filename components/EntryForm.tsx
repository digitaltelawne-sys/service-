import React, { useState, useEffect } from 'react';
import { TransformerEntry } from '../types';
import { Save, X } from 'lucide-react';

interface EntryFormProps {
  initialData?: TransformerEntry;
  onSave: (entry: TransformerEntry) => void;
  onCancel: () => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<TransformerEntry>>(initialData || {
    serialNumber: '',
    customerName: '',
    project: '',
    dispatchDate: new Date().toISOString().split('T')[0],
    ratingKVA: 0,
    voltageRatio: '',
    commissioningDueDate: '',
    sourceWarehouse: '',
    shippingAddress: '',
    warrantyMonthsComm: 12,
    warrantyMonthsDispatch: 18,
    pbgAmount: 0,
    pbgDueDate: '',
    commissioningDoneDate: '',
    status: 'Dispatched',
    salesPerson: '',
    territory: '',
    state: '',
    narration: '',
    warrantyDateComm: '',
    warrantyDateDispatch: ''
  });

  // Calculate Warranty Date from Dispatch automatically
  useEffect(() => {
    if (formData.dispatchDate && formData.warrantyMonthsDispatch) {
      const date = new Date(formData.dispatchDate);
      date.setMonth(date.getMonth() + Number(formData.warrantyMonthsDispatch));
      try {
        const calculatedDate = date.toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, warrantyDateDispatch: calculatedDate }));
      } catch (e) {
        // invalid date
      }
    }
  }, [formData.dispatchDate, formData.warrantyMonthsDispatch]);

  // Calculate Warranty Date from Commissioning automatically
  useEffect(() => {
    // Prefer commissioningDoneDate if available, else commissioningDueDate
    const baseDateStr = formData.commissioningDoneDate || formData.commissioningDueDate;
    
    if (baseDateStr && formData.warrantyMonthsComm) {
      const date = new Date(baseDateStr);
      date.setMonth(date.getMonth() + Number(formData.warrantyMonthsComm));
      try {
        const calculatedDate = date.toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, warrantyDateComm: calculatedDate }));
      } catch (e) {
        // invalid date
      }
    } else {
        setFormData(prev => ({ ...prev, warrantyDateComm: '' }));
    }
  }, [formData.commissioningDueDate, formData.commissioningDoneDate, formData.warrantyMonthsComm]);

  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.serialNumber || !formData.customerName) {
      alert("Serial Number and Customer Name are required");
      return;
    }

    const newEntry: TransformerEntry = {
      id: initialData?.id || generateId(),
      serialNumber: formData.serialNumber!,
      customerName: formData.customerName!,
      project: formData.project || 'N/A',
      dispatchDate: formData.dispatchDate!,
      ratingKVA: Number(formData.ratingKVA),
      voltageRatio: formData.voltageRatio || 'N/A',
      commissioningDueDate: formData.commissioningDueDate!,
      sourceWarehouse: formData.sourceWarehouse || 'Rabale',
      shippingAddress: formData.shippingAddress || '',
      warrantyMonthsComm: Number(formData.warrantyMonthsComm),
      warrantyMonthsDispatch: Number(formData.warrantyMonthsDispatch),
      warrantyDateDispatch: formData.warrantyDateDispatch!,
      warrantyDateComm: formData.warrantyDateComm!,
      pbgDueDate: formData.pbgDueDate || '',
      pbgAmount: Number(formData.pbgAmount),
      commissioningDoneDate: formData.commissioningDoneDate || null,
      status: formData.commissioningDoneDate ? 'Commissioned' : 'Dispatched',
      salesPerson: formData.salesPerson || 'N/A',
      territory: formData.territory || '',
      state: formData.state || '',
      narration: formData.narration || ''
    };

    onSave(newEntry);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 max-w-4xl mx-auto overflow-hidden">
      <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">
          {initialData ? 'Edit Transformer Entry' : 'New Transformer Entry'}
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Core Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Identification</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number</label>
            <input required name="serialNumber" type="text" value={formData.serialNumber} onChange={handleChange} className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
            <input required name="customerName" type="text" value={formData.customerName} onChange={handleChange} className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
            <input name="project" type="text" value={formData.project} onChange={handleChange} className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        {/* Sales & Location (New) */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Sales & Region</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sales Person</label>
            <input name="salesPerson" type="text" value={formData.salesPerson} onChange={handleChange} placeholder="Sales Rep Name" className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
              <input name="state" type="text" value={formData.state} onChange={handleChange} placeholder="e.g. Maharashtra" className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Territory</label>
              <input name="territory" type="text" value={formData.territory} onChange={handleChange} placeholder="e.g. West" className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Specs */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Technical Specs</h3>
           <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rating (KVA)</label>
              <input name="ratingKVA" type="number" value={formData.ratingKVA} onChange={handleChange} className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Voltage Ratio (KV)</label>
              <input name="voltageRatio" type="text" value={formData.voltageRatio} onChange={handleChange} placeholder="e.g. 11/0.433" className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
           </div>
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Source Warehouse</label>
             <select name="sourceWarehouse" value={formData.sourceWarehouse} onChange={handleChange} className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none">
               <option value="">Select Warehouse</option>
               <option value="Rabale">Rabale</option>
               <option value="Taloja">Taloja</option>
               <option value="Ambernath-M2">Ambernath-M2</option>
             </select>
           </div>
        </div>

        {/* Dates & Logistics */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Logistics & Dates</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dispatch Date</label>
            <input name="dispatchDate" type="date" value={formData.dispatchDate} onChange={handleChange} className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Shipping Address</label>
            <textarea name="shippingAddress" rows={2} value={formData.shippingAddress} onChange={handleChange} className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Commissioning Due Date</label>
            <input required name="commissioningDueDate" type="date" value={formData.commissioningDueDate} onChange={handleChange} className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Commissioning Done Date (If done)</label>
            <input name="commissioningDoneDate" type="date" value={formData.commissioningDoneDate} onChange={handleChange} className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>

        {/* Warranty & Financials */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Warranty & PBG</h3>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Warranty (Comm. Months)</label>
              <input name="warrantyMonthsComm" type="number" value={formData.warrantyMonthsComm} onChange={handleChange} className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
             <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Warranty (Disp. Months)</label>
              <input name="warrantyMonthsDispatch" type="number" value={formData.warrantyMonthsDispatch} onChange={handleChange} className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-medium text-slate-700 mb-1">Warranty Exp. (from Dispatch)</label>
               <input disabled name="warrantyDateDispatch" type="date" value={formData.warrantyDateDispatch} className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-500 border p-2 cursor-not-allowed" />
             </div>
             <div>
               <label className="block text-xs font-medium text-slate-700 mb-1">Warranty Exp. (from Comm)</label>
               <input disabled name="warrantyDateComm" type="date" value={formData.warrantyDateComm} className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-500 border p-2 cursor-not-allowed" />
             </div>
          </div>
           <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PBG Amount</label>
              <input name="pbgAmount" type="number" value={formData.pbgAmount} onChange={handleChange} className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PBG Due Date</label>
              <input name="pbgDueDate" type="date" value={formData.pbgDueDate} onChange={handleChange} className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Narration (New) */}
        <div className="md:col-span-2">
           <label className="block text-sm font-medium text-slate-700 mb-1">Narration / Remarks</label>
           <textarea name="narration" rows={3} value={formData.narration} onChange={handleChange} placeholder="Any additional notes..." className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div className="md:col-span-2 pt-6 flex justify-end gap-3 border-t border-slate-100 mt-4">
          <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition">Cancel</button>
          <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2">
            <Save size={18} />
            {initialData ? 'Update Entry' : 'Save Entry'}
          </button>
        </div>

      </form>
    </div>
  );
};