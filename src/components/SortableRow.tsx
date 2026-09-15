import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Employee, DateBlocks, ARABIC_DAYS } from '../types';
import { GripVertical } from 'lucide-react';

interface SortableRowProps {
  employee: Employee;
  blocks: DateBlocks;
  onEditLeave: (employee: Employee) => void;
}

export function SortableRow({ employee, blocks, onEditLeave }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: employee.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const renderCells = (days: typeof blocks.block1, isFirstBlock: boolean = false) => {
    return days.map((day, idx) => {
      const isLeave = day.dayOfWeek === employee.leaveDay;
      return (
        <td 
          key={`${day.date.toISOString()}-${idx}`} 
          className={`p-1 border text-center h-10 min-w-[40px] ${isLeave ? 'bg-yellow-200' : ''}`}
        >
        </td>
      );
    });
  };

  return (
    <tr ref={setNodeRef} style={style} className={`bg-white hover:bg-gray-50 ${isDragging ? 'shadow-xl relative bg-blue-50' : ''}`}>
      <td className="p-2 border sticky right-0 bg-white z-20 shadow-sm w-[250px] min-w-[250px]">
        <div className="flex items-center gap-2">
          <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 focus:outline-none shrink-0">
            <GripVertical className="w-4 h-4" />
          </button>
          <span className="font-semibold text-sm truncate">{employee.name}</span>
          <button 
            onClick={() => onEditLeave(employee)}
            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors whitespace-nowrap shrink-0 border border-red-200 cursor-pointer"
          >
            إجازة {ARABIC_DAYS[employee.leaveDay]}
          </button>
        </div>
      </td>
      {renderCells(blocks.block1, true)}
      {/* Separator between blocks */}
      <td className="bg-gray-100 border-x-4 border-gray-300 w-2 min-w-[8px]"></td>
      {renderCells(blocks.block2)}
      <td className="bg-gray-100 border-x-4 border-gray-300 w-2 min-w-[8px]"></td>
      {renderCells(blocks.block3)}
    </tr>
  );
}
