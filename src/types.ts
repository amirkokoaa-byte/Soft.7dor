export interface Employee {
  id: string;
  name: string;
  leaveDay: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
}

export const ARABIC_DAYS = [
  'الاحد',
  'الاثنين',
  'الثلاثاء',
  'الاربعاء',
  'الخميس',
  'الجمعة',
  'السبت'
];

export const DROPDOWN_DAYS = [
  { value: 6, label: 'السبت' },
  { value: 0, label: 'الأحد' },
  { value: 1, label: 'الإثنين' },
  { value: 2, label: 'الثلاثاء' },
  { value: 3, label: 'الأربعاء' },
  { value: 4, label: 'الخميس' },
  { value: 5, label: 'الجمعة' },
];

export interface DateInfo {
  date: Date;
  dayNum: number;
  dayName: string;
  dayOfWeek: number;
}

export interface DateBlocks {
  block1: DateInfo[];
  block2: DateInfo[];
  block3: DateInfo[];
}

export const INITIAL_EMPLOYEES = [
  "حسن محمد", "بسمه محمد", "محمد احمد", "نجوي محمد", 
  "سعيد محمد", "راندا سعيد", "محمد عمر", "فارس عمر", 
  "حبيبه شوقي", "احمد عوض", "اسماء صالح", "ملك هيثم", 
  "امنيه اشرف", "تقي محمد", "منه احمد"
];
