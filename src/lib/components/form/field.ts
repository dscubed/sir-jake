export function hasError(error: string | string[] | undefined): boolean {
	return Array.isArray(error) ? error.length > 0 : Boolean(error);
}

/** Builds an `aria-describedby` value from the help text and error ids that are actually shown. */
export function describedBy(
	id: string,
	helpText: string | undefined,
	error: string | string[] | undefined
): string | undefined {
	const ids = [helpText ? `${id}-help` : '', hasError(error) ? `${id}-error` : ''].filter(Boolean);
	return ids.length ? ids.join(' ') : undefined;
}

export interface SelectOption {
	value: string;
	label: string;
}

/** Plain strings use the same text for the value and the label. */
export function normaliseOptions(options: readonly (string | SelectOption)[]): SelectOption[] {
	return options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
}
