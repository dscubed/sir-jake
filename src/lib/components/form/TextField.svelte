<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import FieldError from './FieldError.svelte';
	import { describedBy, hasError } from './field.ts';

	interface Props extends Omit<HTMLInputAttributes, 'value' | 'name' | 'id'> {
		name: string;
		label: string;
		helpText?: string;
		required?: boolean;
		value?: string;
		error?: string | string[];
		type?: 'text' | 'email';
	}

	let {
		name,
		label,
		helpText,
		required = false,
		value = $bindable(''),
		error,
		type = 'text',
		...rest
	}: Props = $props();

	const id = $props.id();
</script>

<div class="field">
	<label for={id}>
		{label}
		{#if !required}<span class="optional">(optional)</span>{/if}
	</label>
	{#if helpText}<p id="{id}-help" class="help">{helpText}</p>{/if}
	<input
		{...rest}
		{id}
		{name}
		{type}
		{required}
		bind:value
		aria-invalid={hasError(error) || undefined}
		aria-describedby={describedBy(id, helpText, error)}
	/>
	<FieldError id="{id}-error" {error} />
</div>
