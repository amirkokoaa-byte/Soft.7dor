import { useState, useEffect, useMemo } from 'react';
import { Employee } from './types';
import { generateDateBlocks, INITIAL_EMPLOYEES, ARABIC_DAYS } from './utils';
import { ScheduleBlocks } from './components/ScheduleBlocks';
import { LeaveModal } from './components/LeaveModal';
import { Plus, Printer, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function App() {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [tempMonth, setTempMonth] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('schedule_employees');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_EMPLOYEES.map((name, i) => ({
      id: `emp-${i}`,
      name,
      code: `E${(i + 1).toString().padStart(3, '0')}`,
      leaveDay: 5 // Default Friday
    }));
  });

  const [newEmpName, setNewEmpName] = useState('');
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    employeeName: '',
    isNew: false,
    initialLeaveDay: 5,
    employeeId: ''
  });

  useEffect(() => {
    localStorage.setItem('schedule_employees', JSON.stringify(employees));
  }, [employees]);

  const dateBlocks = useMemo(() => {
    if (!selectedMonth) return null;
    const [y, m] = selectedMonth.split('-');
    return generateDateBlocks(Number(y), Number(m));
  }, [selectedMonth]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempMonth(e.target.value);
    setShowPreview(true);
  };

  const confirmMonth = () => {
    setSelectedMonth(tempMonth);
    setShowPreview(false);
  };

  const handleSelectDropdown = (name: string) => {
    if (!name) return;
    if (employees.some(e => e.name === name)) {
      alert('الموظف موجود بالفعل');
      return;
    }
    setModalState({ isOpen: true, employeeName: name, isNew: true, initialLeaveDay: 5, employeeId: '' });
  };

  const handleAddNew = () => {
    const name = newEmpName.trim();
    if (!name) return;
    if (employees.some(e => e.name === name)) {
      alert('الموظف موجود بالفعل');
      return;
    }
    setModalState({ isOpen: true, employeeName: name, isNew: true, initialLeaveDay: 5, employeeId: '' });
    setNewEmpName('');
  };

  const saveLeaveDay = (leaveDay: number) => {
    if (modalState.isNew) {
      const newEmp: Employee = {
        id: crypto.randomUUID(),
        name: modalState.employeeName,
        code: `E${(employees.length + 1).toString().padStart(3, '0')}`,
        leaveDay
      };
      setEmployees(prev => [...prev, newEmp]);
    } else {
      setEmployees(prev => prev.map(e => e.id === modalState.employeeId ? { ...e, leaveDay } : e));
    }
  };

  const handleEditLeave = (emp: Employee) => {
    setModalState({ isOpen: true, employeeName: emp.name, isNew: false, initialLeaveDay: emp.leaveDay, employeeId: emp.id });
  };

  const exportExcel = () => {
    if (!dateBlocks) return;
    const wsData: any[][] = [];
    
    const [y, m] = selectedMonth.split('-');
    const nextM = Number(m) === 12 ? 1 : Number(m) + 1;
    const nextY = Number(m) === 12 ? Number(y) + 1 : Number(y);
    
    wsData.push([`حضور واجازات : 21/${m}/${y} إلى 20/${nextM}/${nextY}`]);
    wsData.push([]);
    
    // Block 1
    wsData.push(["الاجازة الاسبوعية", "كود الموظف", "الاسم", ...dateBlocks.block1.map(d => d.dayName)]);
    wsData.push(["", "", "", ...dateBlocks.block1.map(d => d.dayNum.toString())]);
    employees.forEach(emp => {
      wsData.push([ARABIC_DAYS[emp.leaveDay], emp.code, emp.name, ...dateBlocks.block1.map(d => d.dayOfWeek === emp.leaveDay ? 'سبوعيه' : '')]);
    });
    wsData.push([]);
    
    // Block 2
    wsData.push(["رصيد الاجازات", "الاسم", ...dateBlocks.block2.map(d => d.dayName)]);
    wsData.push(["", "", ...dateBlocks.block2.map(d => d.dayNum.toString())]);
    employees.forEach(emp => {
      wsData.push(["", emp.name, ...dateBlocks.block2.map(d => d.dayOfWeek === emp.leaveDay ? 'سبوعيه' : '')]);
    });
    wsData.push([]);
    
    // Block 3
    wsData.push(["استنفذ اليومين", "الاسم", ...dateBlocks.block3.map(d => d.dayName)]);
    wsData.push(["", "", ...dateBlocks.block3.map(d => d.dayNum.toString())]);
    employees.forEach(emp => {
      wsData.push(["", emp.name, ...dateBlocks.block3.map(d => d.dayOfWeek === emp.leaveDay ? 'سبوعيه' : '')]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!dir'] = 'rtl';
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الجدول");
    XLSX.writeFile(wb, "schedule.xlsx");
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans print:bg-white" dir="rtl">
      {/* Toolbar - hidden on print */}
      <div className="no-print bg-white shadow-sm border-b p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="font-bold text-sm">تحديد الشهر:</label>
            <input type="month" value={tempMonth || selectedMonth} onChange={handleMonthChange} className="border border-gray-300 p-1.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={exportExcel} disabled={!selectedMonth} className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-bold shadow-sm">
            <FileDown size={16} /> تصدير إلى Excel
          </button>
          <button onClick={exportPDF} disabled={!selectedMonth} className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-bold shadow-sm">
            <Printer size={16} /> تصدير إلى PDF
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <select onChange={(e) => { handleSelectDropdown(e.target.value); e.target.value = ''; }} className="border border-gray-300 p-1.5 rounded-lg text-sm w-48 outline-none focus:ring-2 focus:ring-blue-500" defaultValue="">
            <option value="" disabled>اختر موظف للجدول...</option>
            {INITIAL_EMPLOYEES.filter(emp => !employees.some(e => e.name === emp)).map(emp => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </select>
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 p-1 rounded-lg">
            <input type="text" placeholder="اسم جديد..." value={newEmpName} onChange={(e) => setNewEmpName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddNew()} className="bg-transparent border-none p-1 text-sm w-32 outline-none focus:ring-0" />
            <button onClick={handleAddNew} className="bg-blue-600 text-white p-1 rounded hover:bg-blue-700 shadow-sm"><Plus size={16}/></button>
          </div>
        </div>
      </div>

      {/* Main Print Container */}
      {selectedMonth && dateBlocks ? (
        <div className="p-4 print:p-0 mx-auto max-w-full overflow-x-auto print:overflow-visible">
          <div className="min-w-[1000px] print:min-w-full bg-white print:shadow-none shadow-xl p-4 print:p-0 rounded-xl print:rounded-none">
            {/* Table Header matching image */}
            <div className="flex justify-between items-end mb-4 border-b-2 border-black pb-2 print:border-b-[1px]">
              <div className="flex items-center gap-2">
                <div className="border border-black p-2 min-w-[60px] text-center font-bold h-6"></div>
                <div className="border border-black p-2 min-w-[80px] h-6"></div>
              </div>
              <div className="text-center font-bold flex-1 flex flex-col items-center gap-1">
                <div className="text-sm lg:text-base print:text-sm">
                  حضور واجازات : 21/{selectedMonth.split('-')[1]}/{selectedMonth.split('-')[0]}
                </div>
                <div className="text-sm lg:text-base print:text-sm">
                  20/{Number(selectedMonth.split('-')[1]) === 12 ? 1 : Number(selectedMonth.split('-')[1]) + 1}/{Number(selectedMonth.split('-')[1]) === 12 ? Number(selectedMonth.split('-')[0]) + 1 : selectedMonth.split('-')[0]}
                </div>
              </div>
              <div className="font-bold text-sm lg:text-base print:text-sm min-w-[120px] text-left pl-4">
                اجازات رسميه :
              </div>
            </div>

            <ScheduleBlocks employees={employees} setEmployees={setEmployees} blocks={dateBlocks} onEditLeave={handleEditLeave} />
          </div>
        </div>
      ) : (
        <div className="p-20 text-center text-gray-500 font-bold text-lg no-print">
          يرجى تحديد الشهر من الأعلى لعرض الجدول.
        </div>
      )}

      {/* Modals */}
      <LeaveModal isOpen={modalState.isOpen} employeeName={modalState.employeeName} initialLeaveDay={modalState.initialLeaveDay} onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))} onSave={saveLeaveDay} />

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 no-print" dir="rtl">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">تأكيد الشهر المحدد</h2>
            </div>
            <div className="p-5 space-y-4 text-sm text-gray-600">
              <p>سيتم إنشاء جدول للفترة من <span className="font-bold text-gray-900">21/{tempMonth.split('-')[1]}/{tempMonth.split('-')[0]}</span> إلى <span className="font-bold text-gray-900">20 من الشهر التالي</span>.</p>
              <div className="mt-4 border border-gray-200 p-3 bg-gray-50 rounded-lg opacity-70 pointer-events-none flex flex-col gap-2 shadow-inner">
                <div className="h-4 bg-gray-300 w-full rounded animate-pulse"></div>
                <div className="h-4 bg-gray-300 w-full rounded animate-pulse"></div>
                <div className="h-4 bg-gray-300 w-full rounded animate-pulse"></div>
                <div className="h-4 bg-gray-300 w-3/4 rounded animate-pulse mt-2"></div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t">
              <button onClick={() => { setShowPreview(false); setTempMonth(selectedMonth); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-bold transition-colors">إلغاء</button>
              <button onClick={confirmMonth} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition-colors">تأكيد</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
