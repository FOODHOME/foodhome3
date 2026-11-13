import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  const isError =
    toastMessage.includes('초과') ||
    toastMessage.includes('실패') ||
    toastMessage.includes('오류');

  return (
    <div
      className={`fixed bottom-6 right-6 z-80 flex items-center gap-2.5 px-4 py-3 text-white rounded-xl shadow-2xl border animate-in slide-in-from-bottom-5 duration-300 ${
        isError ? 'bg-red-900 border-red-700' : 'bg-slate-900 border-slate-700'
      }`}
    >
      {isError ? (
        <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
      ) : (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      )}
      <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
    </div>
  );
};
