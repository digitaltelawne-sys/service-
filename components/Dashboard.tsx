import React, { useMemo } from 'react';
import { TransformerEntry } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, IndianRupee } from 'lucide-react';

interface DashboardProps {
  data: TransformerEntry[];
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  
  const stats = useMemo(() => {
    const total = data.length;
    const commissioned = data.filter(d => d.status === 'Commissioned').length;
    const overdue = data.filter(d => {
       if (d.status === 'Commissioned') return false;
       return new Date(d.commissioningDueDate) < new Date();
    }).length;
    const totalPBG = data.reduce((acc, curr) => acc + (curr.pbgAmount || 0), 0);

    return { total, commissioned, overdue, totalPBG };
  }, [data]);

  const ratingData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(d => {
      const key = `${d.ratingKVA} KVA`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, count: counts[key] }));
  }, [data]);

  const customerData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(d => {
      counts[d.customerName] = (counts[d.customerName] || 0) + 1;
    });
    return Object.keys(counts)
      .map(key => ({ name: key, value: counts[key] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }, [data]);

  const warrantyData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(d => {
      if (d.warrantyDateDispatch) {
        // Extract year safely from YYYY-MM-DD string
        const year = d.warrantyDateDispatch.split('-')[0];
        counts[year] = (counts[year] || 0) + 1;
      }
    });
    return Object.keys(counts)
      .sort()
      .map(key => ({ name: key, count: counts[key] }));
  }, [data]);

  const stateData = useMemo(() => {
      const counts: Record<string, number> = {};
      data.forEach(d => {
          const st = d.state || 'Unknown';
          counts[st] = (counts[st] || 0) + 1;
      });
      return Object.keys(counts)
          .map(key => ({ name: key, count: counts[key] }))
          .sort((a, b) => b.count - a.count);
  }, [data]);

  const pbgDueData = useMemo(() => {
      const counts: Record<string, number> = {};
      data.forEach(d => {
          if (d.pbgDueDate) {
              // Group by YYYY-MM
              const month = d.pbgDueDate.substring(0, 7);
              counts[month] = (counts[month] || 0) + (d.pbgAmount || 0);
          }
      });
      return Object.keys(counts)
          .sort()
          .slice(0, 10) // Limit to 10 periods
          .map(key => ({ name: key, value: counts[key] }));
  }, [data]);

  const statusData = [
    { name: 'Commissioned', value: stats.commissioned },
    { name: 'Pending', value: stats.total - stats.commissioned - stats.overdue },
    { name: 'Overdue', value: stats.overdue },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Units</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.total}</h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <TrendingUp size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Commissioned</p>
            <h3 className="text-2xl font-bold text-green-600">{stats.commissioned}</h3>
          </div>
          <div className="p-3 bg-green-50 rounded-full text-green-600">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Overdue Comm.</p>
            <h3 className="text-2xl font-bold text-red-600">{stats.overdue}</h3>
          </div>
          <div className="p-3 bg-red-50 rounded-full text-red-600">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total PBG Value</p>
            <h3 className="text-2xl font-bold text-slate-800">₹{(stats.totalPBG / 1000).toFixed(1)}k</h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-full text-amber-600">
            <IndianRupee size={24} />
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Regional Distribution (State)</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Commissioning Status</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Overdue' ? '#ef4444' : entry.name === 'Commissioned' ? '#22c55e' : '#fbbf24'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

       {/* Charts Row 2 */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">PBG Due Schedule (Amount)</h4>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pbgDueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Warranty Expiry by Year</h4>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warrantyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
       </div>
    </div>
  );
};