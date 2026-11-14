import { describe, expect, it } from 'vitest';
import { formatMelbourne, parseConfigDate, windowStatus } from '../../src/lib/domain/window';

const dates = { opensAt: '2027-02-20T09:00:00+11:00', closesAt: '2027-03-06T23:59:00+11:00' };
const at = (iso: string) => new Date(iso);

describe('windowStatus', () => {
	it('is upcoming before the opening time', () => {
		expect(windowStatus(dates, at('2027-02-20T08:59:59+11:00'))).toBe('upcoming');
	});

	it('opens exactly at the opening time', () => {
		expect(windowStatus(dates, at('2027-02-20T09:00:00+11:00'))).toBe('open');
	});

	it('is open just before the closing time', () => {
		expect(windowStatus(dates, at('2027-03-06T23:58:59+11:00'))).toBe('open');
	});

	it('closes exactly at the closing time', () => {
		expect(windowStatus(dates, at('2027-03-06T23:59:00+11:00'))).toBe('closed');
	});

	it('treats an unconfirmed opening date as upcoming', () => {
		expect(windowStatus({ opensAt: 'TBD', closesAt: 'TBD' }, at('2030-01-01T00:00:00Z'))).toBe(
			'upcoming'
		);
	});

	it('stays open when only the closing date is unconfirmed', () => {
		expect(
			windowStatus({ opensAt: dates.opensAt, closesAt: 'TBD' }, at('2030-01-01T00:00:00Z'))
		).toBe('open');
	});

	it('compares instants, not wall-clock times, across time zones', () => {
		// 22:00 UTC on 19 Feb is 09:00 on 20 Feb in Melbourne (AEDT, +11:00).
		expect(windowStatus(dates, at('2027-02-19T22:00:00Z'))).toBe('open');
	});
});

describe('parseConfigDate', () => {
	it('returns null for TBD', () => {
		expect(parseConfigDate('TBD')).toBeNull();
	});
});

describe('formatMelbourne', () => {
	it('formats in Melbourne time whatever the machine time zone', () => {
		expect(formatMelbourne('2027-02-19T22:00:00Z')).toMatch(/^Sat,?\s20\sFeb,?\s9:00\sam$/i);
	});

	it('keeps TBD for unconfirmed dates', () => {
		expect(formatMelbourne('TBD')).toBe('TBD');
	});
});
