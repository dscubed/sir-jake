<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import FieldError from './FieldError.svelte';
	import { describedBy, hasError, normaliseOptions, type SelectOption } from './field.ts';

	interface Props extends Omit<HTMLSelectAttributes, 'value' | 'name' | 'id'> {
		name: string;
		label: string;
		helpText?: string;
		required?: boolean;
		value?: string;
		error?: string | string[];
		options: readonly (string | SelectOption)[];
		/** Shown while nothing is chosen. */
		placeholder?: string;
	}

	let {
		name,
		label,
		helpText,
		required = false,
		value = $bindable(''),
		error,
		options,
		placeholder = 'Choose…',
		...rest
	}: Props = $props();

	const id = $props.id();
	const normalised = $derived(normaliseOptions(options));
</script>

<div class="field">
	<label for={id}>
		{label}
		{#if !required}<span class="optional">(optional)</span>{/if}
	</label>
	{#if helpText}<p id="{id}-help" class="help">{helpText}</p>{/if}
	<select
		{...rest}
		{id}
		{name}
		{required}
		bind:value
		aria-invalid={hasError(error) || undefined}
		aria-describedby={describedBy(id, helpText, error)}
	>
		<option value="" disabled={required}>{placeholder}</option>
		{#each normalised as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
	<FieldError id="{id}-error" {error} />
</div>
