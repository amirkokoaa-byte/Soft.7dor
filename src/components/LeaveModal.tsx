import { useState, useEffect } from 'react';
import { DROPDOWN_DAYS } from '../utils';

export function LeaveModal({ isOpen, employeeName, initialLeaveDay = 5, onClose, onSave }: any) {
  const [leaveDay, setLeaveDay] = useState(initialLeaveDay);

  useEffect(() => {
    if (isOpen) setLeaveDay(initialLeaveDay);
  }, [isOpen, initialLeaveDay]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 no-print" dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-bold">حدد الاجازة الاسبوعية</h2>
        </div>
        <div className="p-4 space-y-4">
          <p className="font-semibold text-gray-700">الموظف: {employeeName}</p>
          <select
            value={leaveDay}
            onChange={(e) => setLeaveDay(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DROPDOWN_DAYS.map((day) => (
              <option key={day.value} value={day.value}>{day.label}</option>
            ))}
          </select>
        </div>
        <div className="p-4 bg-gray-50 flex justify-end gap-2 border-t">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100 font-bold">إلغاء</button>
          <button onClick={() => { onSave(leaveDay); onClose(); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">حفظ</button>
        </div>
      </div>
    </div>
  );
}
