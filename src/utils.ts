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
  { code: "10087", name: "حسن محمد" },
  { code: "10338", name: "بسمه محمد" },
  { code: "10369", name: "محمد احمد" },
  { code: "10378", name: "نجوي محمد" },
  { code: "10655", name: "سعيد محمد" },
  { code: "10137", name: "راندا سعيد" },
  { code: "10204", name: "محمد عمر" },
  { code: "10413", name: "فارس عمرو" },
  { code: "10181", name: "حبيبه شوقي" },
  { code: "10650", name: "احمد عوض" },
  { code: "10176", name: "اسماء صالح" },
  { code: "10499", name: "ملك هيثم" },
  { code: "10383", name: "امنيه اشرف" },
  { code: "10649", name: "تقي محمد" },
  { code: "10665", name: "منه احمد" }
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
