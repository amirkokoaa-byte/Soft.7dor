export interface Employee {
  id: string;
  name: string;
  code: string;
  leaveDay: number; 
}
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
