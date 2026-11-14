<script lang="ts">
	import FieldError from '#lib/components/form/FieldError.svelte';
	import { countWords } from '#lib/domain/words.ts';

	interface Props {
		name: string;
		/** Small line above the question, e.g. "First preference: Events". */
		kicker: string;
		/** The question itself. */
		label: string;
		value?: string;
		error?: string;
		wordLimit: number;
	}

	let { name, kicker, label, value = $bindable(''), error, wordLimit }: Props = $props();

	const id = $props.id();
	// Same function the server uses, so the counter and the server always agree (step 3.3).
	const words = $derived(countWords(value));
	const over = $derived(words > wordLimit);
	const describedBy = $derived(
		[`${id}-count`, error ? `${id}-error` : ''].filter(Boolean).join(' ')
	);
</script>

<div class="question">
	<label for={id}>
		<span class="kicker">{kicker}</span>
		<span class="text">{label}</span>
	</label>
	<!-- Typing is never blocked, so applicants can paste a long draft and then trim it. -->
	<textarea
		{id}
		{name}
		rows="7"
		required
		bind:value
		aria-invalid={Boolean(error) || over || undefined}
		aria-describedby={describedBy}></textarea>
	<div class="meta">
		<FieldError id="{id}-error" {error} />
		<span id="{id}-count" class="count" class:over>{words} / {wordLimit} words</span>
	</div>
	<!-- Announced once when the answer goes over the limit, not on every keystroke. -->
	<span class="visually-hidden" aria-live="polite">
		{over ? `Your answer is over ${wordLimit} words.` : ''}
	</span>
</div>

<style>
	.question {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.kicker {
		font-size: var(--text-xs);
		color: var(--blue-text-light);
	}

	.text {
		font-size: var(--text-base);
		font-weight: 500;
		line-height: 1.5;
		color: var(--ink);
	}

	textarea {
		margin-top: 4px;
		padding: 12px 14px;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: #ffffff;
		color: var(--ink);
		font-size: var(--text-base);
		line-height: var(--leading-normal);
		resize: vertical;
		transition:
			border-color var(--duration-fast) var(--ease-out),
			box-shadow var(--duration-fast) var(--ease-out);
	}

	textarea:focus-visible {
		outline: none;
		border-color: var(--blue);
		box-shadow: 0 0 0 3px rgba(21, 110, 226, 0.25);
	}

	textarea[aria-invalid='true'] {
		border-color: var(--error);
	}

	.meta {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		font-size: var(--text-sm);
	}

	.count {
		margin-left: auto;
		white-space: nowrap;
		color: var(--muted);
	}

	.count.over {
		color: var(--error);
	}
</style>
