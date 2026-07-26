import { describe, it, expect } from 'vitest';
import reportsService from './reports.service';

describe('reportsService default export', () => {
  it('exposes getAnalytics alongside all other service methods', () => {
    expect(typeof reportsService.getAnalytics).toBe('function');
  });

  it('exposes every CRUD method', () => {
    expect(typeof reportsService.getReports).toBe('function');
    expect(typeof reportsService.createReport).toBe('function');
    expect(typeof reportsService.getReport).toBe('function');
    expect(typeof reportsService.updateReport).toBe('function');
    expect(typeof reportsService.deleteReport).toBe('function');
  });
});
