<script lang="ts">
	import FieldError from './FieldError.svelte';
	import { describedBy, hasError } from './field.ts';

	interface Props {
		name: string;
		/** Read out as the group's name. */
		label: string;
		helpText?: string;
		/** Shown under the options, e.g. what happens if none apply. */
		note?: string;
		/** At least one option must be ticked. */
		required?: boolean;
		value?: string[];
		error?: string | string[];
		options: readonly string[];
	}

	let {
		name,
		label,
		helpText,
		note,
		required = false,
		value = $bindable([]),
		error,
		options
	}: Props = $props();

	const id = $props.id();
</script>

<!-- Each option is a real checkbox styled as a button, so keyboard use and form posting work as normal. -->
<fieldset
	class="field"
	aria-describedby={[describedBy(id, helpText, error), note && `${id}-note`]
		.filter(Boolean)
		.join(' ') || undefined}
>
	<legend>
		{label}
		{#if !required}<span class="optional">(optional)</span>{/if}
	</legend>
	{#if helpText}<p id="{id}-help" class="help">{helpText}</p>{/if}
	<div class="options">
		{#each options as option (option)}
			<label class="option" class:invalid={hasError(error)}>
				<input
					type="checkbox"
					{name}
					value={option}
					bind:group={value}
					aria-invalid={hasError(error) || undefined}
				/>
				<span>{option}</span>
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

	/* One option per row, all the same width. */
	.options {
		display: flex;
		flex-direction: column;
		gap: 14px;
		max-width: 280px;
	}

	.option {
		position: relative;
		cursor: pointer;
	}

	/* The checkbox is hidden but stays focusable; the label is the visible button. */
	input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		margin: 0;
		opacity: 0;
		cursor: pointer;
	}

	span {
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

	.option:hover span {
		background: var(--hover-light);
	}

	.invalid span {
		border-color: var(--error);
	}

	input:checked + span {
		background: var(--blue);
		border-color: var(--blue);
		color: #ffffff;
	}

	input:focus-visible + span {
		box-shadow: 0 0 0 3px rgba(21, 110, 226, 0.35);
	}
</style>
