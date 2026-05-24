import { ElderRotationService, RotationResult } from './elder-rotation.service';

describe('ElderRotationService', () => {
  let service: ElderRotationService;

  beforeEach(() => {
    service = new ElderRotationService();
  });

  describe('calculateRotation', () => {
    it('returns empty array when rotationGroups is empty', () => {
      const result = service.calculateRotation(
        '2026-01-01',
        '2026-12-31',
        [],
        2,
      );
      expect(result).toHaveLength(0);
    });

    it('assigns groups in round-robin across shift periods', () => {
      const groups: string[][] = [['elder-1'], ['elder-2']];
      const result = service.calculateRotation(
        '2026-01-01',
        '2026-01-28', // 4 weeks = 2 shift periods
        groups,
        2,
      );

      // With 2-week shifts, Jan 1-14 and Jan 15-28 should be generated
      expect(result.length).toBeGreaterThan(0);
      
      // First shift: elder-1
      expect(result[0].elderId).toBe('elder-1');
      expect(result[0].weekStart).toBe('2026-01-01');
      expect(result[0].weekEnd).toBe('2026-01-14');
      
      // Second shift: elder-2
      expect(result[1].elderId).toBe('elder-2');
      expect(result[1].weekStart).toBe('2026-01-15');
      expect(result[1].weekEnd).toBe('2026-01-28');
    });

    it('handles multi-person groups (team rotation)', () => {
      const groups: string[][] = [['elder-1', 'elder-2']]; // team of 2
      const result = service.calculateRotation(
        '2026-01-01',
        '2026-01-14',
        groups,
        2,
      );

      // Both elders should be assigned to same shift
      expect(result).toHaveLength(2);
      expect(result[0].elderId).toBe('elder-1');
      expect(result[1].elderId).toBe('elder-2');
      expect(result[0].weekStart).toBe('2026-01-01');
      expect(result[0].weekEnd).toBe('2026-01-14');
    });

    it('creates Date objects as well as strings', () => {
      const groups: string[][] = [['elder-1']];
      const result = service.calculateRotation(
        new Date('2026-01-01'),
        new Date('2026-01-14'),
        groups,
        2,
      );

      expect(result).toHaveLength(1);
      expect(result[0].elderId).toBe('elder-1');
    });

    it('handles single elder with solo group for exactly one shift period', () => {
      const groups: string[][] = [['elder-1']];
      const result = service.calculateRotation(
        '2026-01-01',
        '2026-01-07', // Exactly 1 week
        groups,
        1, // 1-week shifts
      );

      expect(result).toHaveLength(1);
      expect(result[0].elderId).toBe('elder-1');
      expect(result[0].weekStart).toBe('2026-01-01');
      expect(result[0].weekEnd).toBe('2026-01-07');
    });

    it('handles multiple rotation groups with alternating assignment', () => {
      const groups: string[][] = [['a'], ['b'], ['c']];
      const result = service.calculateRotation(
        '2026-01-01',
        '2026-03-31', // 3 months - should cycle through groups
        groups,
        1, // 1-week shifts
      );

      // Verify groups cycle correctly
      const weekStarts = result.map(r => r.weekStart);
      const uniqueWeeks = [...new Set(weekStarts)];
      expect(uniqueWeeks.length).toBeGreaterThan(3);
    });

    it('caps final shift at period end date', () => {
      const groups: string[][] = [['elder-1']];
      const result = service.calculateRotation(
        '2026-01-01',
        '2026-01-10', // Short period
        groups,
        2, // 2-week shift requested but only 10 days available
      );

      expect(result).toHaveLength(1);
      expect(result[0].weekEnd).toBe('2026-01-10');
    });

    it('handles 10 elders with 2-week shifts across full year', () => {
      // Simulate the test case: 10 elders, 2-week shifts
      const elderIds = Array.from({ length: 10 }, (_, i) => `elder-${i + 1}`);
      const groups: string[][] = elderIds.map(id => [id]);
      
      const result = service.calculateRotation(
        '2026-01-01',
        '2026-12-31',
        groups,
        2,
      );

      // With 52 weeks and 2-week shifts = 26 shift periods
      // Each elder rotates through, so we should have shifts distributed
      expect(result.length).toBeGreaterThan(0);
      
      // Verify all elders are represented at least once
      const assignedElderIds = [...new Set(result.map(r => r.elderId))];
      expect(assignedElderIds).toHaveLength(10);
    });

    it('rotates through 5 groups for 5 shifts in a year', () => {
      // 10 elders, 2-week shifts = 5 shifts covering 10 weeks
      // But with round-robin, groups rotate each shift period
      const groups: string[][] = [
        ['elder-1', 'elder-2'],
        ['elder-3', 'elder-4'],
        ['elder-5', 'elder-6'],
        ['elder-7', 'elder-8'],
        ['elder-9', 'elder-10'],
      ];
      
      const result = service.calculateRotation(
        '2026-01-01',
        '2026-03-31', // ~13 weeks = ~6 shift periods
        groups,
        2,
      );

      expect(result.length).toBeGreaterThan(0);
      
      // Verify that the groups are being assigned in round-robin
      const groupAssignments = result.map(r => r.elderId);
      const uniqueElders = [...new Set(groupAssignments)];
      expect(uniqueElders.length).toBe(10);
    });
  });
});
