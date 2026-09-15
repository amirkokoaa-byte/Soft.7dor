import { useState, useMemo, useRef } from 'react';
import { INITIAL_EMPLOYEES, Employee, ARABIC_DAYS } from './types';
import { generateDateBlocks } from './utils/dateUtils';
import { ScheduleBlocks } from './components/ScheduleBlocks';
import { LeaveModal } from './components/LeaveModal';
import { Plus, CalendarDays, FileDown, FileImage } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export default function App() {
  const printRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    // Default to the current month in YYYY-MM format
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [availableEmployees, setAvailableEmployees] = useState<string[]>(INITIAL_EMPLOYEES);
  const [tableEmployees, setTableEmployees] = useState<Employee[]>([]);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    employeeName: string;
    isNewToTable: boolean;
    initialLeaveDay?: number;
    employeeIdToEdit?: string;
  }>({
    isOpen: false,
    employeeName: '',
    isNewToTable: false,
  });

  const [newEmployeeInput, setNewEmployeeInput] = useState('');

  const dateBlocks = useMemo(() => {
    const [yearStr, monthStr] = selectedDate.split('-');
    return generateDateBlocks(Number(yearStr), Number(monthStr));
  }, [selectedDate]);

  const nextMonthDate = useMemo(() => {
     const [yearStr, monthStr] = selectedDate.split('-');
     const d = new Date(Number(yearStr), Number(monthStr), 1);
     return `${d.getFullYear()}/${d.getMonth() === 0 ? 12 : d.getMonth()}`; 
     // A bit hacky to show month/year for next month quickly, let's just do it properly
  }, [selectedDate]);
  
  const formattedNextMonth = useMemo(() => {
    const [year, month] = selectedDate.split('-').map(Number);
    const nextDate = new Date(year, month, 1); // month is 1-12 from input, so month is actually next month (0-indexed)
    return `20/${nextDate.getMonth() === 0 ? 12 : nextDate.getMonth()}/${nextDate.getMonth() === 0 ? nextDate.getFullYear() -1 : nextDate.getFullYear()}`;
  }, [selectedDate]);
  
  const formattedCurrentMonth = useMemo(() => {
      const [year, month] = selectedDate.split('-');
      return `21/${month}/${year}`;
  }, [selectedDate]);

  const handleSelectEmployee = (name: string) => {
    if (!name) return;
    if (tableEmployees.some(e => e.name === name)) {
      alert('هذا الموظف موجود بالفعل في الجدول');
      return;
    }
    setModalState({
      isOpen: true,
      employeeName: name,
      isNewToTable: true,
    });
  };

  const handleAddNewEmployee = () => {
    const name = newEmployeeInput.trim();
    if (!name) return;
    
    if (availableEmployees.includes(name)) {
      handleSelectEmployee(name);
      setNewEmployeeInput('');
      return;
    }

    setAvailableEmployees(prev => [...prev, name]);
    setModalState({
      isOpen: true,
      employeeName: name,
      isNewToTable: true,
    });
    setNewEmployeeInput('');
  };

  const handleSaveLeave = (leaveDay: number) => {
    if (modalState.isNewToTable) {
      const newEmp: Employee = {
        id: crypto.randomUUID(),
        name: modalState.employeeName,
        leaveDay,
      };
      setTableEmployees(prev => [...prev, newEmp]);
    } else if (modalState.employeeIdToEdit) {
      setTableEmployees(prev => 
        prev.map(emp => 
          emp.id === modalState.employeeIdToEdit 
            ? { ...emp, leaveDay } 
            : emp
        )
      );
    }
  };

  const handleEditLeave = (employee: Employee) => {
    setModalState({
      isOpen: true,
      employeeName: employee.name,
      isNewToTable: false,
      initialLeaveDay: employee.leaveDay,
      employeeIdToEdit: employee.id,
    });
  };

  const exportToExcel = () => {
    const wsData: any[][] = [];
    
    // Header
    wsData.push(["حضور واجازات : " + formattedCurrentMonth, "", "", formattedNextMonth, "", "اجازات رسميه :"]);
    wsData.push([]); 
    
    // Block 1
    wsData.push(["اليوم", "الاسماء", ...dateBlocks.block1.map(d => d.dayNum.toString())]);
    wsData.push(["", "", ...dateBlocks.block1.map(d => d.dayName)]);
    tableEmployees.forEach(emp => {
      wsData.push([
        ARABIC_DAYS[emp.leaveDay],
        emp.name,
        ...dateBlocks.block1.map(d => d.dayOfWeek === emp.leaveDay ? 'سبوعيه' : emp.name)
      ]);
    });
    wsData.push([]);
    
    // Block 2
    wsData.push(["الاسم", "رصيد الاجازات", ...dateBlocks.block2.map(d => d.dayNum.toString())]);
    wsData.push(["", "", ...dateBlocks.block2.map(d => d.dayName)]);
    tableEmployees.forEach(emp => {
      wsData.push([
        emp.name,
        "",
        ...dateBlocks.block2.map(d => d.dayOfWeek === emp.leaveDay ? 'سبوعيه' : emp.name)
      ]);
    });
    wsData.push([]);
    
    // Block 3
    wsData.push(["الاسم", "استنفذ اليومين", ...dateBlocks.block3.map(d => d.dayNum.toString())]);
    wsData.push(["", "", ...dateBlocks.block3.map(d => d.dayName)]);
    tableEmployees.forEach(emp => {
      wsData.push([
        emp.name,
        "",
        ...dateBlocks.block3.map(d => d.dayOfWeek === emp.leaveDay ? 'سبوعيه' : emp.name)
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!dir'] = 'rtl'; 
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الجدول");
    XLSX.writeFile(wb, "schedule.xlsx");
  };

  const exportToPDF = () => {
    if (tableEmployees.length === 0) {
      alert("الجدول فارغ، يرجى إضافة موظفين أولاً.");
      return;
    }
    
    setIsExporting(true);
    
    // Need a slight delay to allow state update to hide UI elements
    setTimeout(async () => {
      if (printRef.current) {
        try {
          const canvas = await html2canvas(printRef.current, { 
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
          });
          
          const imgData = canvas.toDataURL('image/png');
          
          // Determine PDF orientation based on canvas aspect ratio
          // Since it's a wide table, it'll likely be landscape
          const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
          
          const pdf = new jsPDF({
            orientation,
            unit: 'px',
            format: [canvas.width, canvas.height]
          });
          
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
          pdf.save('schedule.pdf');
        } catch (error) {
          console.error("Error generating PDF", error);
          alert("حدث خطأ أثناء تصدير الـ PDF.");
        }
      }
      setIsExporting(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-2 sm:p-4 md:p-8" dir="rtl">
      <div className="max-w-[1920px] mx-auto bg-white p-4 sm:p-6 shadow-xl rounded-2xl border border-gray-100">
        
        {/* Controls Toolbar (Modern UI for managing the table) */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-8 gap-4">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex items-center justify-between sm:justify-start gap-3 bg-white p-2 rounded-lg border border-gray-200 shadow-sm w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600 shrink-0" />
                <label className="font-semibold text-gray-700 text-sm whitespace-nowrap">تحديد الشهر:</label>
              </div>
              <input 
                type="month" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-sm focus:ring-0 outline-none cursor-pointer w-full sm:w-32"
              />
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={exportToExcel} 
                className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-bold shadow-sm whitespace-nowrap"
              >
                <FileDown className="w-4 h-4 shrink-0" />
                تصدير Excel
              </button>
              <button 
                onClick={exportToPDF} 
                disabled={isExporting}
                className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-bold shadow-sm disabled:opacity-50 whitespace-nowrap"
              >
                <FileImage className="w-4 h-4 shrink-0" />
                {isExporting ? 'التصدير...' : 'تصدير PDF'}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm w-full sm:w-auto">
              <label className="text-sm font-medium text-gray-600 whitespace-nowrap shrink-0">اختيار موظف:</label>
              <select 
                className="bg-transparent border-none text-sm w-full sm:w-48 focus:ring-0 outline-none cursor-pointer flex-1"
                onChange={(e) => {
                  handleSelectEmployee(e.target.value);
                  e.target.value = ''; 
                }}
                value=""
              >
                <option value="" disabled>اختر من القائمة...</option>
                {availableEmployees
                  .filter(emp => !tableEmployees.some(t => t.name === emp))
                  .map(emp => (
                    <option key={emp} value={emp}>{emp}</option>
                  ))
                }
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm pr-3 w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="اسم موظف جديد..." 
                value={newEmployeeInput}
                onChange={(e) => setNewEmployeeInput(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter') handleAddNewEmployee() }}
                className="bg-transparent border-none text-sm flex-1 sm:w-40 focus:ring-0 outline-none"
              />
              <button 
                onClick={handleAddNewEmployee}
                className="bg-blue-600 text-white p-1.5 rounded-md hover:bg-blue-700 transition-colors shadow-sm shrink-0"
                title="إضافة للجدول"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* --- PRINTABLE AREA START --- */}
        <div ref={printRef} className={`bg-white ${isExporting ? 'overflow-visible w-max min-w-full' : 'overflow-x-auto overflow-y-hidden'}`} style={{ padding: isExporting ? '20px' : '0' }}>
          <div className={isExporting ? '' : 'min-w-[1200px]'}>
            {/* Header Section (Matching Image Header) */}
            <div className="flex flex-row justify-between items-center border-b-2 border-gray-800 pb-4 mb-6 gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                 <div className="border border-black p-2 w-16 sm:min-w-[100px] h-10 text-center font-bold">
                   {/* Empty boxes from image */}
                 </div>
                 <div className="border border-black p-2 w-24 sm:min-w-[150px] h-10">
                 </div>
              </div>
              
              <div className="flex flex-col items-center">
                <h1 className="text-sm sm:text-lg md:text-xl font-bold whitespace-nowrap">حضور واجازات : {formattedCurrentMonth}</h1>
                <h2 className="text-sm sm:text-lg md:text-xl font-bold">{formattedNextMonth}</h2>
              </div>
              
              <div className="text-sm sm:text-lg md:text-xl font-bold px-2 sm:px-8 whitespace-nowrap shrink-0">
                اجازات رسميه :
              </div>
            </div>

            {/* The 3 Schedule Blocks */}
            <ScheduleBlocks 
              employees={tableEmployees}
              setEmployees={setTableEmployees}
              blocks={dateBlocks}
              onEditLeave={handleEditLeave}
              isExporting={isExporting}
            />
          </div>
        </div>
        {/* --- PRINTABLE AREA END --- */}

        {/* Leave Modal */}
        <LeaveModal 
          isOpen={modalState.isOpen}
          employeeName={modalState.employeeName}
          initialLeaveDay={modalState.initialLeaveDay}
          onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
          onSave={handleSaveLeave}
        />

      </div>
    </div>
  );
}
