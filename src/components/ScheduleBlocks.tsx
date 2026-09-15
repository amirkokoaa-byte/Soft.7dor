import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Employee, DateBlocks, DateInfo } from '../types';
import { ARABIC_DAYS } from '../utils';
import { GripVertical, Trash2 } from 'lucide-react';

function SortableBlock1Row({ employee, days, onEditLeave, onDelete }: { employee: Employee, days: DateInfo[], onEditLeave: any, onDelete: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: employee.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    position: isDragging ? 'relative' as const : 'static' as const,
  };

  return (
    <tr ref={setNodeRef} style={style} className={`bg-white ${isDragging ? 'opacity-50' : ''}`}>
      <td 
        className="font-bold cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => onEditLeave(employee)}
      >
        {ARABIC_DAYS[employee.leaveDay]}
      </td>
      <td className="text-center font-semibold">{employee.code}</td>
      <td className="font-bold">
        <div className="flex items-center justify-between gap-1 px-1">
          <div className="flex items-center gap-1">
            <button {...attributes} {...listeners} className="cursor-grab text-gray-400 outline-none p-1 no-print">
              <GripVertical size={14} />
            </button>
            <span>{employee.name}</span>
          </div>
          <button onClick={() => onDelete(employee.id)} className="text-red-500 hover:text-red-700 no-print opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
      {days.map(day => {
        const isLeave = day.dayOfWeek === employee.leaveDay;
        return (
          <td 
            key={day.dayNum} 
            className={`${isLeave ? 'bg-yellow-300 print-yellow font-bold text-xs' : ''}`}
          >
            {isLeave ? 'سبوعيه' : ''}
          </td>
        );
      })}
    </tr>
  );
}

export function ScheduleBlocks({ employees, setEmployees, blocks, onEditLeave }: any) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = employees.findIndex((emp: Employee) => emp.id === active.id);
      const newIndex = employees.findIndex((emp: Employee) => emp.id === over.id);
      setEmployees(arrayMove(employees, oldIndex, newIndex));
    }
  };

  const handleDelete = (id: string) => {
    if(confirm('هل أنت متأكد من حذف الموظف؟')) {
      setEmployees(employees.filter((e: Employee) => e.id !== id));
    }
  }

  if (!blocks) return null;

  return (
    <div className="flex flex-col gap-6 print:gap-2 excel-container bg-white w-full print:p-2" dir="rtl">
      {/* Block 1 */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <table className="excel-table text-xs lg:text-sm print:text-[11px]">
          <thead>
            <tr>
              <th rowSpan={2} className="w-24">الاجازة الاسبوعية</th>
              <th rowSpan={2} className="w-24">كود الموظف</th>
              <th rowSpan={2} className="w-48">الاسم</th>
              {blocks.block1.map((d: DateInfo) => <th key={`name-${d.dayNum}`} className="w-10">{d.dayName}</th>)}
            </tr>
            <tr>
              {blocks.block1.map((d: DateInfo) => <th key={`num-${d.dayNum}`}>{d.dayNum}</th>)}
            </tr>
          </thead>
          <SortableContext items={employees.map((e: Employee) => e.id)} strategy={verticalListSortingStrategy}>
            <tbody className="group">
              {employees.map((emp: Employee) => (
                <SortableBlock1Row key={emp.id} employee={emp} days={blocks.block1} onEditLeave={onEditLeave} onDelete={handleDelete} />
              ))}
            </tbody>
          </SortableContext>
        </table>
      </DndContext>

      {/* Block 2 */}
      <table className="excel-table text-xs lg:text-sm print:text-[11px]">
        <thead>
          <tr>
            <th rowSpan={2} className="w-24">رصيد الاجازات</th>
            <th rowSpan={2} className="w-48">الاسم</th>
            {blocks.block2.map((d: DateInfo) => <th key={`name-${d.dayNum}`} className="w-10">{d.dayName}</th>)}
          </tr>
          <tr>
            {blocks.block2.map((d: DateInfo) => <th key={`num-${d.dayNum}`}>{d.dayNum}</th>)}
          </tr>
        </thead>
        <tbody>
          {employees.map((emp: Employee) => (
            <tr key={emp.id}>
              <td></td>
              <td className="font-bold text-right pr-2">{emp.name}</td>
              {blocks.block2.map((day: DateInfo) => {
                const isLeave = day.dayOfWeek === emp.leaveDay;
                return (
                  <td key={day.dayNum} className={`${isLeave ? 'bg-yellow-300 print-yellow font-bold text-xs' : ''}`}>
                    {isLeave ? 'سبوعيه' : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Block 3 */}
      <table className="excel-table text-xs lg:text-sm print:text-[11px]">
        <thead>
          <tr>
            <th rowSpan={2} className="w-24">استنفذ اليومين</th>
            <th rowSpan={2} className="w-48">الاسم</th>
            {blocks.block3.map((d: DateInfo) => <th key={`name-${d.dayNum}`} className="w-10">{d.dayName}</th>)}
          </tr>
          <tr>
            {blocks.block3.map((d: DateInfo) => <th key={`num-${d.dayNum}`}>{d.dayNum}</th>)}
          </tr>
        </thead>
        <tbody>
          {employees.map((emp: Employee) => (
            <tr key={emp.id}>
              <td></td>
              <td className="font-bold text-right pr-2">{emp.name}</td>
              {blocks.block3.map((day: DateInfo) => {
                const isLeave = day.dayOfWeek === emp.leaveDay;
                return (
                  <td key={day.dayNum} className={`${isLeave ? 'bg-yellow-300 print-yellow font-bold text-xs' : ''}`}>
                    {isLeave ? 'سبوعيه' : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
