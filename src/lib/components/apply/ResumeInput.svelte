<script lang="ts">
	import FieldError from '#lib/components/form/FieldError.svelte';
	import { recruitment } from '#lib/config/recruitment.ts';

	interface Props {
		/** The chosen file. Browsers can't keep it across reloads, so drafts never include it. */
		file?: File | null;
		error?: string;
	}

	let { file = $bindable(null), error }: Props = $props();

	const id = $props.id();
	const maxMb = recruitment.maxResumeBytes / (1024 * 1024);
	// "1.2 MB", or "48 KB" for small files so they don't read as "0.0 MB".
	const size = $derived.by(() => {
		if (!file) return '';
		const mb = file.size / (1024 * 1024);
		return mb >= 0.1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;
	});

	let input: HTMLInputElement | undefined = $state();

	function onchange(event: Event & { currentTarget: HTMLInputElement }) {
		file = event.currentTarget.files?.[0] ?? null;
	}

	// When the form is cleared, empty the native input too so it doesn't still post the old file.
	$effect(() => {
		if (file === null && input) input.value = '';
	});
</script>

<div class="resume">
	<!-- The real file input covers the drop zone, so clicking, keyboard and drag-and-drop all work natively. -->
	<div class="zone" class:invalid={Boolean(error)} class:chosen={file}>
		<input
			bind:this={input}
			{id}
			type="file"
			name="resume"
			accept="application/pdf,.pdf"
			required
			{onchange}
			aria-invalid={Boolean(error) || undefined}
			aria-describedby="{id}-hint{error ? ` ${id}-error` : ''}"
		/>
		{#if file}
			<label for={id} class="title">{file.name}</label>
			<span id="{id}-hint" class="hint">{size} · Click to replace</span>
		{:else}
			<label for={id} class="title">Upload your resume</label>
			<span id="{id}-hint" class="hint">PDF only, up to {maxMb} MB</span>
		{/if}
	</div>
	<FieldError id="{id}-error" {error} />
</div>

<style>
	.resume {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.zone {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 32px 20px;
		border: 1px dashed var(--border);
		border-radius: var(--radius-lg);
		background: var(--surface-light);
		text-align: center;
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.zone:hover {
		border-color: var(--blue);
	}

	.zone:focus-within {
		border-color: var(--blue);
		box-shadow: 0 0 0 3px rgba(21, 110, 226, 0.25);
	}

	.zone.invalid {
		border-color: var(--error);
	}

	input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: pointer;
	}

	.title {
		font-size: var(--text-base);
		font-weight: 500;
		color: var(--ink);
		overflow-wrap: anywhere;
	}

	.hint {
		font-size: var(--text-sm);
		color: var(--muted);
	}
</style>
