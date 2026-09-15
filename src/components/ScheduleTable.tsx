import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableRow } from './SortableRow';
import { Employee, DateBlocks } from '../types';

interface ScheduleTableProps {
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  blocks: DateBlocks;
  onEditLeave: (employee: Employee) => void;
}

export function ScheduleTable({ employees, setEmployees, blocks, onEditLeave }: ScheduleTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = employees.findIndex((emp) => emp.id === active.id);
      const newIndex = employees.findIndex((emp) => emp.id === over.id);
      setEmployees(arrayMove(employees, oldIndex, newIndex));
    }
  };

  const renderDayHeaders = (days: typeof blocks.block1) => {
    return days.map((day, idx) => (
      <th key={`${day.date.toISOString()}-${idx}`} className="p-1 border bg-gray-50 min-w-[40px] text-xs">
        <div className="flex flex-col items-center gap-1">
          <span className="font-bold text-gray-800 text-sm">{day.dayNumber}</span>
          <span className="text-[10px] text-gray-500">{day.dayName}</span>
        </div>
      </th>
    ));
  };

  const totalCols = 1 + blocks.block1.length + 1 + blocks.block2.length + 1 + blocks.block3.length;

  return (
    <div className="overflow-x-auto w-full bg-white rounded-lg shadow-sm border border-gray-200 mt-6" dir="rtl">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <table className="w-full border-collapse min-w-max">
          <thead>
            <tr>
              <th className="p-3 border-b border-l sticky right-0 bg-white z-20 shadow-[1px_0_0_0_#e5e7eb] text-right min-w-[250px]">
                <span className="font-bold text-gray-700 text-sm">الموظف</span>
              </th>
              <th colSpan={blocks.block1.length} className="p-2 border bg-blue-50/50 text-center font-bold text-blue-900 text-sm">
                الكتلة الأولى (21 - آخر الشهر)
              </th>
              <th className="bg-gray-100 border-x-4 border-gray-300 w-2 min-w-[8px]"></th>
              <th colSpan={blocks.block2.length} className="p-2 border bg-emerald-50/50 text-center font-bold text-emerald-900 text-sm">
                الكتلة الثانية (1 - 10)
              </th>
              <th className="bg-gray-100 border-x-4 border-gray-300 w-2 min-w-[8px]"></th>
              <th colSpan={blocks.block3.length} className="p-2 border bg-purple-50/50 text-center font-bold text-purple-900 text-sm">
                الكتلة الثالثة (11 - 20)
              </th>
            </tr>
            <tr>
              <th className="p-2 border-b border-l sticky right-0 bg-gray-50 z-20 shadow-[1px_0_0_0_#e5e7eb]"></th>
              {renderDayHeaders(blocks.block1)}
              <th className="bg-gray-100 border-x-4 border-gray-300 w-2 min-w-[8px]"></th>
              {renderDayHeaders(blocks.block2)}
              <th className="bg-gray-100 border-x-4 border-gray-300 w-2 min-w-[8px]"></th>
              {renderDayHeaders(blocks.block3)}
            </tr>
          </thead>
          <SortableContext items={employees.map(e => e.id)} strategy={verticalListSortingStrategy}>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={totalCols} className="p-12 text-center text-gray-500 text-sm bg-gray-50/50">
                    لا يوجد موظفين مضافين في الجدول. قم باختيار أو إضافة موظف من القائمة أعلاه.
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <SortableRow 
                    key={employee.id} 
                    employee={employee} 
                    blocks={blocks} 
                    onEditLeave={onEditLeave} 
                  />
                ))
              )}
            </tbody>
          </SortableContext>
        </table>
      </DndContext>
    </div>
  );
}
