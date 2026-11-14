import type { ResumeFile } from '../../src/lib/domain/application';

/**
 * A valid one-page PDF, padded with a trailing comment to roughly `sizeBytes` so size limits can be
 * tested without a fixture file.
 */
export function makePdf(sizeBytes = 0): Uint8Array {
	const objects = [
		'<< /Type /Catalog /Pages 2 0 R >>',
		'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
		'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] >>'
	];
	let body = '%PDF-1.4\n';
	const offsets: number[] = [];
	objects.forEach((object, i) => {
		offsets.push(body.length);
		body += `${i + 1} 0 obj\n${object}\nendobj\n`;
	});
	const xref = body.length;
	body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
	for (const offset of offsets) body += `${String(offset).padStart(10, '0')} 00000 n \n`;
	body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

	const padding = Math.max(0, sizeBytes - body.length - 2);
	if (padding > 0) body += `%${' '.repeat(padding)}\n`;
	return new TextEncoder().encode(body);
}

export function makeResume(sizeBytes = 0, filename = 'resume.pdf'): ResumeFile {
	const bytes = makePdf(sizeBytes);
	return { filename, sizeBytes: bytes.length, bytes };
}
