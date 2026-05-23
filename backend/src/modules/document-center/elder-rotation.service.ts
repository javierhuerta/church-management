import { Injectable } from '@nestjs/common';

export interface RotationResult {
  elderId: string;
  weekStart: string;
  weekEnd: string;
}

@Injectable()
export class ElderRotationService {
  /**
   * Calculates rotation working purely with calendar dates (YYYY-MM-DD strings)
   * to avoid timezone shifts when persisting to PostgreSQL `date` columns.
   */
  calculateRotation(
    periodStartDate: Date | string,
    periodEndDate: Date | string,
    rotationGroups: string[][],
    shiftWeeks: number,
  ): RotationResult[] {
    const results: RotationResult[] = [];
    if (rotationGroups.length === 0) return results;

    const shiftDays = shiftWeeks * 7;

    // Work in UTC to avoid any local timezone drift.
    const toUtc = (d: Date | string): Date => {
      const str = typeof d === 'string' ? d.split('T')[0] : d.toISOString().split('T')[0];
      const [y, m, day] = str.split('-').map(Number);
      return new Date(Date.UTC(y, m - 1, day));
    };

    const fmt = (d: Date): string => d.toISOString().split('T')[0];

    const start = toUtc(periodStartDate);
    const end = toUtc(periodEndDate);

    let current = new Date(start);
    let groupIndex = 0;

    while (current < end) {
      const shiftEnd = new Date(current);
      shiftEnd.setUTCDate(shiftEnd.getUTCDate() + shiftDays - 1);
      const actualEnd = shiftEnd > end ? end : shiftEnd;

      const group = rotationGroups[groupIndex % rotationGroups.length];
      for (const elderId of group) {
        results.push({ elderId, weekStart: fmt(current), weekEnd: fmt(actualEnd) });
      }

      const next = new Date(shiftEnd);
      next.setUTCDate(next.getUTCDate() + 1);
      current = next;
      groupIndex++;
    }

    return results;
  }
}
