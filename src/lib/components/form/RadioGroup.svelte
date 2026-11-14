<script lang="ts">
	import FieldError from './FieldError.svelte';
	import { describedBy, hasError, normaliseOptions, type SelectOption } from './field.ts';

	interface Props {
		name: string;
		/** Read out as the group's name, e.g. "Are you available for the group interview?". */
		label: string;
		helpText?: string;
		required?: boolean;
		value?: string;
		error?: string | string[];
		options: readonly (string | SelectOption)[];
		/** Lay the options out side by side instead of stacked. */
		inline?: boolean;
	}

	let {
		name,
		label,
		helpText,
		required = false,
		value = $bindable(''),
		error,
		options,
		inline = false
	}: Props = $props();

	const id = $props.id();
	const normalised = $derived(normaliseOptions(options));
</script>

<fieldset
	role="radiogroup"
	class="field"
	aria-describedby={describedBy(id, helpText, error)}
	aria-invalid={hasError(error) || undefined}
>
	<legend>
		{label}
		{#if !required}<span class="optional">(optional)</span>{/if}
	</legend>
	{#if helpText}<p id="{id}-help" class="help">{helpText}</p>{/if}
	<div class="options" class:inline>
		{#each normalised as option (option.value)}
			<label class="option">
				<input type="radio" {name} value={option.value} {required} bind:group={value} />
				{option.label}
			</label>
		{/each}
	</div>
	<FieldError id="{id}-error" {error} />
</fieldset>

<style>
	fieldset {
		border: 0;
		padding: 0;
		margin-inline: 0;
		min-width: 0;
	}

	legend {
		padding: 0;
		font-weight: 600;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}

	.options.inline {
		flex-direction: row;
		flex-wrap: wrap;
		gap: var(--space-5);
	}

	.option {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-weight: 400;
		cursor: pointer;
	}

	.option input {
		width: 1.125rem;
		height: 1.125rem;
		margin: 0;
		accent-color: var(--color-accent);
	}
</style>
