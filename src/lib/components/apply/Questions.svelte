<script lang="ts">
	import type { ApplicationForm } from '#lib/apply/form.svelte.ts';
	import { recruitment } from '#lib/config/recruitment.ts';
	import FormSection from './FormSection.svelte';
	import QuestionField from './QuestionField.svelte';

	let { form }: { form: ApplicationForm } = $props();

	const noPreferences = $derived(
		form.values.firstPreference === '' && form.values.secondPreference === ''
	);
</script>

<FormSection id="questions" title="Questions" gap={32}>
	{#snippet intro()}
		Be yourself! There are no right answers.
	{/snippet}
	{#each form.questions as question (question.field)}
		<QuestionField
			name={question.field}
			kicker={question.kicker}
			label={question.label}
			wordLimit={recruitment.wordLimit}
			bind:value={form.values[question.field]}
			error={form.shownErrors[question.field]}
		/>
	{/each}
	{#if noPreferences}
		<p class="hint">Choose your role preferences above to see the question for each team.</p>
	{/if}
</FormSection>

<style>
	/* The intro sits a little closer to the heading here because the section gap is larger. */
	:global(#questions > .intro) {
		margin-top: -18px;
	}

	.hint {
		padding: 16px 18px;
		border: 1px dashed var(--border);
		border-radius: var(--radius-md);
		font-size: 15px;
		color: var(--muted);
	}
</style>
