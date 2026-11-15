<script lang="ts">
	import FieldError from './FieldError.svelte';
	import { describedBy, hasError, normaliseOptions, type SelectOption } from './field.ts';

	interface Props {
		name: string;
		/** Read out as the group's name, e.g. "Are you available for the group interview?". */
		label: string;
		helpText?: string;
		/** Shown under the options, e.g. what happens if the answer is no. */
		note?: string;
		required?: boolean;
		value?: string;
		error?: string | string[];
		options: readonly (string | SelectOption)[];
		/** Lay the options out side by side instead of stacked. */
		inline?: boolean;
		/**
		 * `segmented` shows each option as a 44px button (the handoff's Yes/No style).
		 * They are still real radio inputs, so arrow keys and form posting work as normal.
		 */
		variant?: 'list' | 'segmented';
	}

	let {
		name,
		label,
		helpText,
		note,
		required = false,
		value = $bindable(''),
		error,
		options,
		inline = false,
		variant = 'list'
	}: Props = $props();

	const id = $props.id();
	const normalised = $derived(normaliseOptions(options));
</script>

<fieldset
	role="radiogroup"
	class="field"
	aria-describedby={[describedBy(id, helpText, error), note && `${id}-note`]
		.filter(Boolean)
		.join(' ') || undefined}
	aria-invalid={hasError(error) || undefined}
>
	<legend>
		{label}
		{#if !required}<span class="optional">(optional)</span>{/if}
	</legend>
	{#if helpText}<p id="{id}-help" class="help">{helpText}</p>{/if}
	<div class="options {variant}" class:inline={inline || variant === 'segmented'}>
		{#each normalised as option (option.value)}
			<label class="option" class:invalid={hasError(error)}>
				<input type="radio" {name} value={option.value} {required} bind:group={value} />
				<span>{option.label}</span>
			</label>
		{/each}
	</div>
	{#if note}<p id="{id}-note" class="help">{note}</p>{/if}
	<FieldError id="{id}-error" {error} />
</fieldset>

<style>
	fieldset {
		border: 0;
		padding: 0;
		margin: 0;
		min-width: 0;
	}

	/* Legends are not flex items, so they get their own spacing. */
	legend {
		margin-bottom: 8px;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.options.inline {
		flex-direction: row;
		flex-wrap: wrap;
		gap: 10px;
	}

	.list .option {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		min-height: 44px;
		color: var(--ink);
		cursor: pointer;
	}

	.list .option input {
		width: 1.125rem;
		height: 1.125rem;
		margin: 0;
		accent-color: var(--blue);
	}

	/* Segmented: the radio is hidden but stays focusable; the label is the visible button. */
	.segmented .option {
		position: relative;
		cursor: pointer;
	}

	.segmented input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}

	.segmented span {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 44px;
		min-width: 96px;
		padding: 0 18px;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: #ffffff;
		color: var(--ink);
		font-size: 15px;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out);
	}

	.segmented .option:hover span {
		background: var(--hover-light);
	}

	.segmented .invalid span {
		border-color: var(--error);
	}

	.segmented input:checked + span {
		background: var(--blue);
		border-color: var(--blue);
		color: #ffffff;
	}

	.segmented input:focus-visible + span {
		box-shadow: 0 0 0 3px rgba(21, 110, 226, 0.35);
	}
</style>
