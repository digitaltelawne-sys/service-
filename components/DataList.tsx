import React, { useState } from 'react';
import { TransformerEntry } from '../types';
import { Search, Filter, Trash2, Edit, Calendar, X } from 'lucide-react';

interface DataListProps {
  data: TransformerEntry[];
  onDelete: (id: string) => void;
  onEdit: (entry: TransformerEntry) => void;
}

export const DataList: React.FC<DataListProps> = ({ data, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Date Filters
  const [showFilters, setShowFilters] = useState(false);
  const [commStart, setCommStart] = useState('');
  const [commEnd, setCommEnd] = useState('');
  const [pbgStart, setPbgStart] = useState('');
  const [pbgEnd, setPbgEnd] = useState('');

  const filteredData = data.filter(item => {
    // Text Search
    const matchesSearch = 
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.project.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status Filter
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;

    // Commissioning Due Date Filter
    const matchesComm = (() => {
        if (!commStart && !commEnd) return true;
        if (!item.commissioningDueDate) return false;
        if (commStart && item.commissioningDueDate < commStart) return false;
        if (commEnd && item.commissioningDueDate > commEnd) return false;
        return true;
    })();

    // PBG Due Date Filter
    const matchesPbg = (() => {
        if (!pbgStart && !pbgEnd) return true;
        if (!item.pbgDueDate) return false;
        if (pbgStart && item.pbgDueDate < pbgStart) return false;
        if (pbgEnd && item.pbgDueDate > pbgEnd) return false;
        return true;
    })();

    return matchesSearch && matchesStatus && matchesComm && matchesPbg;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('All');
    setCommStart('');
    setCommEnd('');
    setPbgStart('');
    setPbgEnd('');
  };

  const hasActiveFilters = filterStatus !== 'All' || commStart || commEnd || pbgStart || pbgEnd;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Primary Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Serial No, Customer, Project..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          {hasActiveFilters && (
             <button 
               onClick={clearFilters}
               className="text-xs text-red-600 hover:text-red-700 font-medium px-2"
             >
               Clear Filters
             </button>
          )}
          
          <select 
            className="p-2 rounded-lg border border-slate-300 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-40 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Commissioned">Commissioned</option>
            <option value="Overdue">Overdue</option>
          </select>

          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition flex items-center gap-2 ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
            title="Date Filters"
          >
            <Calendar size={18} />
            <span className="hidden md:inline text-sm font-medium">Date Filters</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-slate-50 border-b border-slate-200 p-4 animate-fade-in">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {/* Commissioning Date Range */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                 <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Commissioning Due Date</label>
                 </div>
                 <div className="flex gap-2 items-center">
                    <div className="relative w-full">
                       <input 
                         type="date" 
                         value={commStart} 
                         onChange={e => setCommStart(e.target.value)} 
                         className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" 
                       />
                       <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-slate-400">From</span>
                    </div>
                    <span className="text-slate-400">-</span>
                    <div className="relative w-full">
                       <input 
                         type="date" 
                         value={commEnd} 
                         onChange={e => setCommEnd(e.target.value)} 
                         className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" 
                       />
                       <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-slate-400">To</span>
                    </div>
                 </div>
              </div>

              {/* PBG Date Range */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                 <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">PBG Due Date</label>
                 </div>
                 <div className="flex gap-2 items-center">
                    <div className="relative w-full">
                       <input 
                         type="date" 
                         value={pbgStart} 
                         onChange={e => setPbgStart(e.target.value)} 
                         className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" 
                       />
                       <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-slate-400">From</span>
                    </div>
                    <span className="text-slate-400">-</span>
                    <div className="relative w-full">
                       <input 
                         type="date" 
                         value={pbgEnd} 
                         onChange={e => setPbgEnd(e.target.value)} 
                         className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none" 
                       />
                       <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-slate-400">To</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold tracking-wider">
            <tr>
              <th className="px-6 py-3">Serial No</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Rating</th>
              <th className="px-6 py-3">Dispatch Date</th>
              <th className="px-6 py-3">Comm. Due</th>
              <th className="px-6 py-3">Warranty Exp.</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                  No records found matching your filters.
                </td>
              </tr>
            ) : (
              filteredData.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">{item.serialNumber}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{item.customerName}</div>
                    <div className="text-xs text-slate-500">{item.project}</div>
                  </td>
                  <td className="px-6 py-4">{item.ratingKVA} KVA <span className="text-slate-400">|</span> {item.voltageRatio}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.dispatchDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`${new Date(item.commissioningDueDate) < new Date() && item.status !== 'Commissioned' ? 'text-red-600 font-bold' : ''}`}>
                      {item.commissioningDueDate}
                    </div>
                    {item.pbgDueDate && (
                       <div className="text-xs text-slate-400 mt-1">PBG: {item.pbgDueDate}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                        <span className="text-slate-700 font-medium">
                            {item.warrantyDateDispatch?.split('-')[0] || '-'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                            {item.warrantyDateDispatch || ''}
                        </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border
                      ${item.status === 'Commissioned' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                      ${item.status === 'Dispatched' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                      ${item.status === 'Overdue' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                    `}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => onEdit(item)}
                        className="p-2 text-slate-400 hover:text-blue-600 transition rounded-full hover:bg-blue-50"
                        title="Edit Entry"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition rounded-full hover:bg-red-50"
                        title="Delete Entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};