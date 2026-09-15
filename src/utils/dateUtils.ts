import { DateInfo, DateBlocks, ARABIC_DAYS } from '../types';

export function generateDateBlocks(year: number, month: number): DateBlocks {
  // month is 1-indexed here (1-12) from the input YYYY-MM
  const jsMonth = month - 1; 

  const blocks: DateBlocks = {
    block1: [],
    block2: [],
    block3: [],
  };

  // Block 1: 21st of selected month to end of selected month
  const lastDayOfMonth = new Date(year, jsMonth + 1, 0).getDate();
  for (let d = 21; d <= lastDayOfMonth; d++) {
    const date = new Date(year, jsMonth, d);
    blocks.block1.push({
      date,
      dayNum: d,
      dayName: ARABIC_DAYS[date.getDay()],
      dayOfWeek: date.getDay(),
    });
  }

  // Block 2: 1st to 10th of NEXT month
  for (let d = 1; d <= 10; d++) {
    const date = new Date(year, jsMonth + 1, d);
    blocks.block2.push({
      date,
      dayNum: d,
      dayName: ARABIC_DAYS[date.getDay()],
      dayOfWeek: date.getDay(),
    });
  }

  // Block 3: 11th to 20th of NEXT month
  for (let d = 11; d <= 20; d++) {
    const date = new Date(year, jsMonth + 1, d);
    blocks.block3.push({
      date,
      dayNum: d,
      dayName: ARABIC_DAYS[date.getDay()],
      dayOfWeek: date.getDay(),
    });
  }

  return blocks;
}
