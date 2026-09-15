import { useState, useEffect } from 'react';
import { DROPDOWN_DAYS } from '../types';
import { X } from 'lucide-react';

interface LeaveModalProps {
  isOpen: boolean;
  employeeName: string;
  initialLeaveDay?: number;
  onClose: () => void;
  onSave: (leaveDay: number) => void;
}

export function LeaveModal({ isOpen, employeeName, initialLeaveDay = 5, onClose, onSave }: LeaveModalProps) {
  const [leaveDay, setLeaveDay] = useState(initialLeaveDay);

  useEffect(() => {
    if (isOpen) {
      setLeaveDay(initialLeaveDay !== undefined ? initialLeaveDay : 5); // Default to Friday
    }
  }, [isOpen, initialLeaveDay]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">
            حدد الإجازة الأسبوعية
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-800 flex items-center gap-2">
              <span className="font-semibold">الموظف:</span>
              <span className="font-bold text-lg">{employeeName}</span>
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              يوم الإجازة الأسبوعية
            </label>
            <select
              value={leaveDay}
              onChange={(e) => setLeaveDay(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer bg-white"
            >
              {DROPDOWN_DAYS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-5 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={() => {
              onSave(leaveDay);
              onClose();
            }}
            className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
}
