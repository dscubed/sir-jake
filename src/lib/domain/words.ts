/** Counts whitespace-separated words. The form's live counter and the server both use this. */
export function countWords(text: string): number {
	return text.trim().split(/\s+/).filter(Boolean).length;
}
