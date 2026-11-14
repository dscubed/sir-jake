<script lang="ts">
	import type { Snippet } from 'svelte';
	import CollectionNotice from './CollectionNotice.svelte';
	import FormSection from './FormSection.svelte';

	interface Props {
		submitting?: boolean;
		/** "Drafts save automatically" or "Draft saved at 3:41 pm". */
		saveNote: string;
		onclear: () => void;
		/** The Turnstile widget and honeypot (step 3.7). */
		captcha: Snippet;
	}

	let { submitting = false, saveNote, onclear, captcha }: Props = $props();
</script>

<FormSection id="submit" title="Review and submit" gap={20}>
	<CollectionNotice />

	{@render captcha()}

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
