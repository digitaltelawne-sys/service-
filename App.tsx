import React, { useState, useEffect } from 'react';
import { TransformerEntry, ViewState } from './types';
import { Dashboard } from './components/Dashboard';
import { DataList } from './components/DataList';
import { EntryForm } from './components/EntryForm';
import { GeminiInsights } from './components/GeminiInsights';
import { 
  LayoutDashboard, 
  List, 
  PlusCircle, 
  Bot, 
  Zap,
  Menu,
  X
} from 'lucide-react';

const STORAGE_KEY = 'volttrack_mis_data';

export default function App() {
  const [data, setData] = useState<TransformerEntry[]>([]);
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TransformerEntry | null>(null);

  // Load data from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Data Migration: Ensure all records have the new fields
        const migrated = parsed.map((item: any) => ({
          ...item,
          salesPerson: item.salesPerson || 'N/A',
          territory: item.territory || '',
          state: item.state || '',
          narration: item.narration || '',
          // Ensure warrantyDateDispatch exists, fallback to dispatchDate if calculation missing
          warrantyDateDispatch: item.warrantyDateDispatch || item.dispatchDate,
          // Ensure warrantyDateComm exists
          warrantyDateComm: item.warrantyDateComm || (() => {
             const base = item.commissioningDoneDate || item.commissioningDueDate;
             if (!base) return '';
             const d = new Date(base);
             d.setMonth(d.getMonth() + (Number(item.warrantyMonthsComm) || 12));
             return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
          })()
        }));
        setData(migrated);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    } else {
        // Mock data for initial view
        const mock: TransformerEntry[] = [
            {
                id: '1',
                serialNumber: 'TR-2024-001',
                customerName: 'PowerCorp Ind',
                project: 'Substation Alpha',
                dispatchDate: '2024-01-15',
                ratingKVA: 500,
                voltageRatio: '11/0.433',
                commissioningDueDate: '2024-02-15',
                sourceWarehouse: 'Rabale',
                shippingAddress: '123 Power Ln, Houston, TX',
                warrantyMonthsComm: 12,
                warrantyMonthsDispatch: 18,
                warrantyDateDispatch: '2025-07-15',
                warrantyDateComm: '2025-02-15',
                pbgAmount: 15000,
                pbgDueDate: '2024-03-01',
                commissioningDoneDate: '2024-02-10',
                status: 'Commissioned',
                salesPerson: 'John Doe',
                territory: 'North',
                state: 'Texas',
                narration: 'Priority installation requested.'
            },
            {
                id: '2',
                serialNumber: 'TR-2024-002',
                customerName: 'City Infra Ltd',
                project: 'Metro Expansion',
                dispatchDate: '2024-02-01',
                ratingKVA: 1000,
                voltageRatio: '33/11',
                commissioningDueDate: '2024-03-01',
                sourceWarehouse: 'Taloja',
                shippingAddress: '45 Metro Way, Chicago, IL',
                warrantyMonthsComm: 24,
                warrantyMonthsDispatch: 30,
                warrantyDateDispatch: '2026-08-01',
                warrantyDateComm: '2026-03-01',
                pbgAmount: 25000,
                pbgDueDate: '2024-04-15',
                commissioningDoneDate: null,
                status: 'Overdue',
                salesPerson: 'Jane Smith',
                territory: 'Midwest',
                state: 'Illinois',
                narration: 'Delay in site readiness.'
            }
        ];
        setData(mock);
    }
  }, []);

  // Save to local storage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const handleSaveEntry = (entry: TransformerEntry) => {
    if (editingEntry) {
      // Update existing
      setData(prev => prev.map(item => item.id === entry.id ? entry : item));
      setEditingEntry(null);
    } else {
      // Create new
      setData(prev => [entry, ...prev]);
    }
    setView(ViewState.LIST);
  };

  const handleEditEntry = (entry: TransformerEntry) => {
    setEditingEntry(entry);
    setView(ViewState.EDIT);
  };

  const handleDeleteEntry = (id: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setData(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleCancelEntry = () => {
    setEditingEntry(null);
    setView(ViewState.LIST);
  };

  const handleAddNew = () => {
    setEditingEntry(null);
    setView(ViewState.ADD);
  };

  const NavItem = ({ targetView, icon: Icon, label, onClick }: { targetView: ViewState, icon: any, label: string, onClick?: () => void }) => (
    <button
      onClick={() => {
        if (onClick) onClick();
        else setView(targetView);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200
        ${view === targetView 
          ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
          : 'text-slate-600 hover:bg-slate-100'
        }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm border-b border-slate-200 sticky top-0 z-20">
        <div className="flex items-center gap-2 text-blue-700 font-bold text-xl">
           <Zap className="fill-blue-700" size={24} />
           VoltTrack
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
           {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-10 transition-transform duration-300 transform 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col
      `}>
        <div className="p-6 border-b border-slate-100 hidden md:flex items-center gap-2 text-blue-700 font-bold text-2xl">
           <Zap className="fill-blue-700" size={28} />
           VoltTrack
        </div>

        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem targetView={ViewState.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
          <NavItem targetView={ViewState.LIST} icon={List} label="All Records" />
          <NavItem targetView={ViewState.ADD} icon={PlusCircle} label="New Entry" onClick={handleAddNew} />
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Intelligence</p>
          </div>
          <NavItem targetView={ViewState.AI_INSIGHTS} icon={Bot} label="AI Insights" />
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-4">
             <p className="text-xs text-slate-500 mb-1">System Status</p>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-sm font-medium text-slate-700">Online</span>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              {view === ViewState.DASHBOARD && 'Dashboard Overview'}
              {view === ViewState.LIST && 'Transformer Records'}
              {(view === ViewState.ADD || view === ViewState.EDIT) && (editingEntry ? 'Edit Record' : 'Add New Record')}
              {view === ViewState.AI_INSIGHTS && 'AI Analytics'}
            </h1>
            <p className="text-slate-500 mt-1">Manage your daily MIS and track logistics efficiently.</p>
          </div>
          {view === ViewState.LIST && (
            <button 
              onClick={handleAddNew}
              className="hidden md:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              <PlusCircle size={18} /> Add New
            </button>
          )}
        </header>

        <div className="animate-fade-in-up">
          {view === ViewState.DASHBOARD && <Dashboard data={data} />}
          {view === ViewState.LIST && <DataList data={data} onDelete={handleDeleteEntry} onEdit={handleEditEntry} />}
          {(view === ViewState.ADD || view === ViewState.EDIT) && <EntryForm initialData={editingEntry || undefined} onSave={handleSaveEntry} onCancel={handleCancelEntry} />}
          {view === ViewState.AI_INSIGHTS && <GeminiInsights data={data} />}
        </div>
      </main>
      
      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-0 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

    </div>
  );
}