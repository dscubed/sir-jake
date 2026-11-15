<script lang="ts">
	import CheckboxGroup from '#lib/components/form/CheckboxGroup.svelte';
	import type { ApplicationForm } from '#lib/apply/form.svelte.ts';
	import { recruitment } from '#lib/config/recruitment.ts';
	import FormSection from './FormSection.svelte';

	let { form }: { form: ApplicationForm } = $props();
</script>

<FormSection id="availability" title="Availability" gap={32}>
	<CheckboxGroup
		name="availableGroup"
		label="Which group interview sessions can you attend?"
		helpText="If you’re invited, you’ll be placed in one of the sessions you select."
		required
		options={recruitment.interviews.group}
		bind:value={form.values.availableGroup}
		error={form.shownErrors.availableGroup}
	/>
	<CheckboxGroup
		name="availableIndividual"
		label="Which days could you do an individual interview if shortlisted?"
		helpText="You’ll book a time on one of the days you select."
		note="If you can’t attend any of these, unfortunately we can’t proceed with your application."
		required
		options={recruitment.interviews.individual}
		bind:value={form.values.availableIndividual}
		error={form.shownErrors.availableIndividual}
	/>
</FormSection>
