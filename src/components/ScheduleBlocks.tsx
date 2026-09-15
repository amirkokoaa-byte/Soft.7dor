import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Employee, DateBlocks, ARABIC_DAYS, DateInfo } from '../types';
import { GripVertical } from 'lucide-react';

interface ScheduleBlocksProps {
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  blocks: DateBlocks;
  onEditLeave: (employee: Employee) => void;
  isExporting?: boolean;
}

// --- Block 1: Sortable Row ---
function SortableBlock1Row({ employee, days, onEditLeave, isExporting }: { employee: Employee, days: DateInfo[], onEditLeave: (emp: Employee) => void, isExporting?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: employee.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    position: isDragging ? 'relative' as const : 'static' as const,
    boxShadow: isDragging ? '0 5px 15px rgba(0,0,0,0.1)' : 'none',
  };

  return (
    <tr ref={setNodeRef} style={style} className={`bg-white hover:bg-blue-50/30 transition-colors ${isDragging ? 'bg-blue-50 opacity-90' : ''}`}>
      <td 
        className={`border border-gray-400 p-1 text-center font-bold text-sm transition-colors ${!isExporting ? 'cursor-pointer hover:bg-gray-100' : ''}`}
        onClick={() => !isExporting && onEditLeave(employee)}
        title={!isExporting ? "انقر لتعديل الإجازة" : undefined}
      >
        {ARABIC_DAYS[employee.leaveDay]}
      </td>
      <td 
        className="border border-gray-400 p-1 font-bold text-sm min-w-[150px]"
      >
        <div className="flex items-center gap-1">
          {!isExporting && (
            <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-700 outline-none p-1 hide-on-print">
              <GripVertical size={16} />
            </button>
          )}
          <span className="truncate">{employee.name}</span>
        </div>
      </td>
      {days.map(day => {
        const isLeave = day.dayOfWeek === employee.leaveDay;
        return (
          <td 
            key={day.dayNum} 
            className={`border border-gray-400 p-1 text-center text-xs whitespace-nowrap min-w-[70px] ${isLeave ? 'bg-yellow-300 font-bold' : ''}`}
          >
            {isLeave ? 'سبوعيه' : employee.name}
          </td>
        );
      })}
    </tr>
  );
}

// --- Main Component ---
export function ScheduleBlocks({ employees, setEmployees, blocks, onEditLeave, isExporting }: ScheduleBlocksProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = employees.findIndex((emp) => emp.id === active.id);
      const newIndex = employees.findIndex((emp) => emp.id === over.id);
      setEmployees(arrayMove(employees, oldIndex, newIndex));
    }
  };

  if (employees.length === 0) {
    return (
      <div className="bg-white p-12 text-center text-gray-500 rounded-xl shadow-sm border border-gray-200 mt-6 font-medium">
        الجدول فارغ حالياً. قم بإضافة أو اختيار موظف للبدء.
      </div>
    );
  }

  const tableClasses = "w-full border-collapse bg-white shadow-sm";
  const headerRow1Classes = "bg-gray-100 text-gray-800 font-bold border-gray-400 text-center";
  const headerRow2Classes = "bg-gray-50 text-gray-600 font-semibold border-gray-400 text-center text-sm";
  const cellClasses = "border border-gray-400 p-1 text-center text-xs whitespace-nowrap min-w-[70px]";
  const staticNameColClasses = "border border-gray-400 p-1 font-bold text-sm min-w-[150px] text-right px-3 bg-white";
  const fixedColClasses = "border border-gray-400 p-1 font-bold text-sm min-w-[100px] text-center bg-white";

  return (
    <div className={`mt-6 space-y-8 ${isExporting ? '' : 'overflow-x-auto'} pb-4`} dir="rtl">
      
      {/* Block 1 (21 to End) - Draggable */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="min-w-max border border-gray-400 shadow-md">
          <table className={tableClasses}>
            <thead>
              <tr>
                <th className={`border border-gray-400 bg-gray-200 w-24 p-1 text-center font-bold text-sm`}>اليوم</th>
                <th className={`border border-gray-400 bg-gray-200 p-1 min-w-[150px] text-center font-bold text-sm`}>الاسماء</th>
                {blocks.block1.map(d => (
                  <th key={d.dayNum} className={`border border-gray-400 bg-gray-200 p-1 text-center font-bold min-w-[70px]`}>
                    {d.dayNum}
                  </th>
                ))}
              </tr>
              <tr>
                <th className={`border border-gray-400 bg-gray-100 p-1`}></th>
                <th className={`border border-gray-400 bg-gray-100 p-1`}></th>
                {blocks.block1.map(d => (
                  <th key={d.dayNum} className={`border border-gray-400 bg-gray-100 p-1 text-center text-sm font-semibold`}>
                    {d.dayName}
                  </th>
                ))}
              </tr>
            </thead>
            <SortableContext items={employees.map(e => e.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {employees.map(emp => (
                  <SortableBlock1Row key={emp.id} employee={emp} days={blocks.block1} onEditLeave={onEditLeave} isExporting={isExporting} />
                ))}
              </tbody>
            </SortableContext>
          </table>
        </div>
      </DndContext>

      {/* Block 2 (1 to 10) - Static */}
      <div className="min-w-max border border-gray-400 shadow-md">
        <table className={tableClasses}>
          <thead>
            <tr>
              <th className={`border border-gray-400 bg-gray-200 p-1 min-w-[150px]`}>الاسم</th>
              <th className={`border border-gray-400 bg-gray-200 p-1 min-w-[100px]`}>رصيد الاجازات</th>
              {blocks.block2.map(d => (
                <th key={d.dayNum} className={`border border-gray-400 bg-gray-200 p-1 text-center font-bold min-w-[70px]`}>
                  {d.dayNum}
                </th>
              ))}
            </tr>
            <tr>
              <th className={`border border-gray-400 bg-gray-100 p-1`}></th>
              <th className={`border border-gray-400 bg-gray-100 p-1`}></th>
              {blocks.block2.map(d => (
                <th key={d.dayNum} className={`border border-gray-400 bg-gray-100 p-1 text-center text-sm font-semibold`}>
                  {d.dayName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id} className="bg-white hover:bg-gray-50">
                <td className={staticNameColClasses}>{emp.name}</td>
                <td className={fixedColClasses}></td>
                {blocks.block2.map(day => {
                  const isLeave = day.dayOfWeek === emp.leaveDay;
                  return (
                    <td key={day.dayNum} className={`${cellClasses} ${isLeave ? 'bg-yellow-300 font-bold' : ''}`}>
                      {isLeave ? 'سبوعيه' : emp.name}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Block 3 (11 to 20) - Static */}
      <div className="min-w-max border border-gray-400 shadow-md">
        <table className={tableClasses}>
          <thead>
            <tr>
              <th className={`border border-gray-400 bg-gray-200 p-1 min-w-[150px]`}>الاسم</th>
              <th className={`border border-gray-400 bg-gray-200 p-1 min-w-[100px]`}>استنفذ اليومين</th>
              {blocks.block3.map(d => (
                <th key={d.dayNum} className={`border border-gray-400 bg-gray-200 p-1 text-center font-bold min-w-[70px]`}>
                  {d.dayNum}
                </th>
              ))}
            </tr>
            <tr>
              <th className={`border border-gray-400 bg-gray-100 p-1`}></th>
              <th className={`border border-gray-400 bg-gray-100 p-1`}></th>
              {blocks.block3.map(d => (
                <th key={d.dayNum} className={`border border-gray-400 bg-gray-100 p-1 text-center text-sm font-semibold`}>
                  {d.dayName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id} className="bg-white hover:bg-gray-50">
                <td className={staticNameColClasses}>{emp.name}</td>
                <td className={fixedColClasses}></td>
                {blocks.block3.map(day => {
                  const isLeave = day.dayOfWeek === emp.leaveDay;
                  return (
                    <td key={day.dayNum} className={`${cellClasses} ${isLeave ? 'bg-yellow-300 font-bold' : ''}`}>
                      {isLeave ? 'سبوعيه' : emp.name}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
