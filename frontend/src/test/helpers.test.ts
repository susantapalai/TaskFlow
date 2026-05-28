import { describe, it, expect } from 'vitest';
import {
  getStatusBadgeClass,
  getPriorityBadgeClass,
  getStatusLabel,
  getPriorityLabel,
  formatDate,
  isOverdue,
} from '../utils/helpers';

describe('getStatusBadgeClass', () => {
  it('returns correct class for TODO', () => {
    expect(getStatusBadgeClass('TODO')).toBe('badge-todo');
  });
  it('returns correct class for IN_PROGRESS', () => {
    expect(getStatusBadgeClass('IN_PROGRESS')).toBe('badge-in-progress');
  });
  it('returns correct class for DONE', () => {
    expect(getStatusBadgeClass('DONE')).toBe('badge-done');
  });
});

describe('getPriorityBadgeClass', () => {
  it('returns correct class for LOW', () => expect(getPriorityBadgeClass('LOW')).toBe('badge-low'));
  it('returns correct class for MEDIUM', () => expect(getPriorityBadgeClass('MEDIUM')).toBe('badge-medium'));
  it('returns correct class for HIGH', () => expect(getPriorityBadgeClass('HIGH')).toBe('badge-high'));
  it('returns correct class for CRITICAL', () => expect(getPriorityBadgeClass('CRITICAL')).toBe('badge-critical'));
});

describe('getStatusLabel', () => {
  it('returns human-readable labels', () => {
    expect(getStatusLabel('TODO')).toBe('To Do');
    expect(getStatusLabel('IN_PROGRESS')).toBe('In Progress');
    expect(getStatusLabel('DONE')).toBe('Done');
  });
});

describe('getPriorityLabel', () => {
  it('returns human-readable labels', () => {
    expect(getPriorityLabel('LOW')).toBe('Low');
    expect(getPriorityLabel('HIGH')).toBe('High');
    expect(getPriorityLabel('CRITICAL')).toBe('Critical');
  });
});

describe('isOverdue', () => {
  it('returns false for undefined', () => expect(isOverdue(undefined)).toBe(false));
  it('returns true for past date', () => expect(isOverdue('2020-01-01')).toBe(true));
  it('returns false for future date', () => expect(isOverdue('2099-01-01')).toBe(false));
});

describe('formatDate', () => {
  it('returns dash for undefined', () => expect(formatDate(undefined)).toBe('—'));
  it('returns formatted date', () => {
    const result = formatDate('2024-03-15');
    expect(result).toContain('2024');
    expect(result).toContain('Mar');
  });
});
