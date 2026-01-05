import React, { useState } from 'react';
import { TransformerEntry } from '../types';
import { getMisInsights, askAiAssistant } from '../services/geminiService';
import { Sparkles, MessageSquare, Loader2, AlertCircle } from 'lucide-react';

interface GeminiInsightsProps {
  data: TransformerEntry[];
}

export const GeminiInsights: React.FC<GeminiInsightsProps> = ({ data }) => {
  const [insightData, setInsightData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleGenerateInsights = async () => {
    if (data.length === 0) return;
    setLoading(true);
    try {
      const result = await getMisInsights(data);
      setInsightData(result);
    } catch (e) {
      console.error(e);
      setInsightData({ error: 'Failed to generate insights.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;
    setChatLoading(true);
    try {
      const result = await askAiAssistant(chatQuery, data);
      setChatResponse(result || 'No response generated.');
    } catch (e) {
       setChatResponse('Error connecting to AI assistant.');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Auto Insights Card */}
      <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <Sparkles size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Smart Summary</h3>
        </div>

        {!insightData && !loading && (
          <div className="text-center py-10">
            <p className="text-slate-500 mb-4">Generate an AI analysis of your current MIS data.</p>
            <button 
              onClick={handleGenerateInsights}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Generate Insights
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-10 text-indigo-600">
            <Loader2 size={32} className="animate-spin mb-2" />
            <p className="text-sm">Analyzing data...</p>
          </div>
        )}

        {insightData && !insightData.error && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-slate-50 rounded-lg text-slate-700 text-sm leading-relaxed border border-slate-100">
              {insightData.summary}
            </div>

            {insightData.keyMetrics && (
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <p className="text-xs text-green-700 font-semibold uppercase">Est. Value Exposure</p>
                    <p className="text-green-900 font-bold">{insightData.keyMetrics.totalValueExposure}</p>
                 </div>
                 <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-700 font-semibold uppercase">Top Customer</p>
                    <p className="text-blue-900 font-bold truncate">{insightData.keyMetrics.mostActiveCustomer}</p>
                 </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-slate-800 text-sm mb-2 flex items-center gap-2">
                <AlertCircle size={14} className="text-amber-500" /> Risks Detected
              </h4>
              <ul className="list-disc pl-5 space-y-1">
                {insightData.risks?.map((risk: string, i: number) => (
                  <li key={i} className="text-xs text-slate-600">{risk}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6 flex flex-col h-[500px]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
            <MessageSquare size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Ask Data Assistant</h3>
        </div>

        <div className="flex-1 bg-slate-50 rounded-lg p-4 mb-4 overflow-y-auto border border-slate-100 text-sm">
           {!chatResponse && !chatLoading && (
             <p className="text-slate-400 text-center mt-10">Ask questions like "Which transformers are due next week?" or "Total PBG for Customer X?"</p>
           )}
           {chatLoading && (
             <div className="flex items-center gap-2 text-purple-600">
               <Loader2 size={16} className="animate-spin" /> Thinking...
             </div>
           )}
           {chatResponse && (
             <div className="prose prose-sm max-w-none text-slate-700">
               {chatResponse}
             </div>
           )}
        </div>

        <form onSubmit={handleChat} className="relative">
          <input 
            type="text" 
            value={chatQuery}
            onChange={(e) => setChatQuery(e.target.value)}
            placeholder="Ask a question about your data..."
            className="w-full pl-4 pr-12 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
          />
          <button 
            type="submit"
            disabled={chatLoading} 
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-50"
          >
            <Sparkles size={16} />
          </button>
        </form>
      </div>

    </div>
  );
};