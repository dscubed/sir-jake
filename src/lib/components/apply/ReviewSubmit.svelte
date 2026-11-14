<script lang="ts">
	import FormSection from './FormSection.svelte';

	interface Props {
		submitting?: boolean;
		/** "Drafts save automatically" or "Draft saved at 3:41 pm". */
		saveNote: string;
		onclear: () => void;
	}

	let { submitting = false, saveNote, onclear }: Props = $props();
</script>

<FormSection id="submit" title="Review and submit" gap={20}>
	<!-- Wording to be confirmed by the committee (step 3.10). -->
	<div class="notice">
		<h3>Collection notice</h3>
		<p>
			DSCubed collects your name, student email, degree, availability, answers and resume to assess
			your application. Only committee members involved in recruitment can see it. Unsuccessful
			applications are deleted after the recruitment round. To ask for your data to be deleted
			sooner, message us on Discord.
		</p>
	</div>

	<!-- Placeholder until the Turnstile widget and honeypot land (step 3.7). -->
	<div class="captcha-placeholder" aria-hidden="true">Verification check</div>

	<div class="actions">
		<button type="submit" class="submit" disabled={submitting} aria-disabled={submitting}>
			{submitting ? 'Submitting…' : 'Submit application'}
		</button>
		<span class="save-note">
			{saveNote} ·
			<button type="button" class="link" onclick={onclear}>Clear form</button>
		</span>
	</div>
</FormSection>

<style>
	.notice {
		display: flex;
		flex-direction: column;
		gap: 10px;
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--muted);
	}

	h3 {
		font-size: var(--text-sm);
		font-weight: 500;
		line-height: var(--leading-relaxed);
		color: var(--ink);
	}

	.captcha-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		max-width: 300px;
		height: 65px;
		border: 1px dashed var(--border);
		border-radius: 8px;
		font-size: var(--text-xs);
		color: var(--placeholder);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 16px;
	}

	.submit {
		height: 48px;
		padding: 0 28px;
		border: 0;
		border-radius: var(--radius-pill);
		background: var(--navy);
		color: #ffffff;
		font-size: var(--text-base);
		font-weight: 500;
		cursor: pointer;
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.submit:hover:not(:disabled) {
		background: var(--blue);
	}

	.submit:disabled {
		cursor: progress;
		opacity: 0.8;
	}

	.save-note {
		font-size: var(--text-sm);
		color: var(--muted);
	}

	.link {
		min-height: 44px;
		padding: 0;
		border: 0;
		background: none;
		color: var(--blue-text-light);
		font-size: var(--text-sm);
		cursor: pointer;
	}

	.link:hover {
		color: var(--blue);
	}
</style>
