import { DateBlocks } from './types';

export const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const DROPDOWN_DAYS = [
  { value: 6, label: 'السبت' },
  { value: 0, label: 'الأحد' },
  { value: 1, label: 'الإثنين' },
  { value: 2, label: 'الثلاثاء' },
  { value: 3, label: 'الأربعاء' },
  { value: 4, label: 'الخميس' },
  { value: 5, label: 'الجمعة' },
];

export const INITIAL_EMPLOYEES = [
  "حسن محمد", "بسمه محمد", "محمد احمد", "نجوي محمد", 
  "سعيد محمد", "راندا سعيد", "محمد عمر", "فارس عمر", 
  "حبيبه شوقي", "احمد عوض", "اسماء صالح", "ملك هيثم", 
  "امنيه اشرف", "تقي محمد", "منه احمد"
];

export function generateDateBlocks(year: number, month: number): DateBlocks {
  const jsMonth = month - 1;
  const blocks: DateBlocks = { block1: [], block2: [], block3: [] };

  const lastDayOfMonth = new Date(year, jsMonth + 1, 0).getDate();
  for (let d = 21; d <= lastDayOfMonth; d++) {
    const date = new Date(year, jsMonth, d);
    blocks.block1.push({ date, dayNum: d, dayName: ARABIC_DAYS[date.getDay()], dayOfWeek: date.getDay() });
  }

  for (let d = 1; d <= 10; d++) {
    const date = new Date(year, jsMonth + 1, d);
    blocks.block2.push({ date, dayNum: d, dayName: ARABIC_DAYS[date.getDay()], dayOfWeek: date.getDay() });
  }

  for (let d = 11; d <= 20; d++) {
    const date = new Date(year, jsMonth + 1, d);
    blocks.block3.push({ date, dayNum: d, dayName: ARABIC_DAYS[date.getDay()], dayOfWeek: date.getDay() });
  }

  return blocks;
}
