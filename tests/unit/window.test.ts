import { describe, expect, it } from 'vitest';
import { applicationWindow, windowState } from '../../src/lib/domain/window';

const config = { opensAt: '2027-02-20T09:00:00+11:00', closesAt: '2027-03-06T23:59:00+11:00' };
const window = applicationWindow(config);

describe('applicationWindow', () => {
	it('parses ISO dates with an offset', () => {
		expect(window?.opensAt.toISOString()).toBe('2027-02-19T22:00:00.000Z');
		expect(window?.closesAt.toISOString()).toBe('2027-03-06T12:59:00.000Z');
	});

	it.each([
		['both TBD', { opensAt: 'TBD', closesAt: 'TBD' }],
		['one TBD', { opensAt: config.opensAt, closesAt: 'TBD' }],
		['closing before opening', { opensAt: config.closesAt, closesAt: config.opensAt }],
		['opening and closing at the same time', { opensAt: config.opensAt, closesAt: config.opensAt }]
	])('is undefined when %s', (_, dates) => {
		expect(applicationWindow(dates)).toBeUndefined();
	});
});

describe('windowState', () => {
	it.each([
		['one second before opening', '2027-02-20T08:59:59+11:00', 'before'],
		['exactly at opening', '2027-02-20T09:00:00+11:00', 'open'],
		['during the window', '2027-03-01T12:00:00+11:00', 'open'],
		['one second before closing', '2027-03-06T23:58:59+11:00', 'open'],
		['exactly at closing', '2027-03-06T23:59:00+11:00', 'after'],
		['after closing', '2027-03-07T00:00:00+11:00', 'after']
	])('is right %s', (_, now, expected) => {
		expect(windowState(new Date(now), window)).toBe(expected);
	});

	it('is unscheduled without a window', () => {
		expect(windowState(new Date(), undefined)).toBe('unscheduled');
	});
});
