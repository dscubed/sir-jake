<script lang="ts">
	import RadioGroup from '#lib/components/form/RadioGroup.svelte';
	import type { ApplicationForm } from '#lib/apply/form.svelte.ts';
	import { recruitment } from '#lib/config/recruitment.ts';
	import FormSection from './FormSection.svelte';

	let { form }: { form: ApplicationForm } = $props();

	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];

	const { groupDate, individualDate } = recruitment.interviews;
	const confirmed = (date: string) => date !== 'TBD';

	// Interview dates come from the config; until they're confirmed the help text says so.
	const groupHelp = confirmed(groupDate)
		? `There are two sessions, on ${groupDate}. If you’re invited, come to whichever suits you.`
		: 'We’ll confirm the dates soon.';
	const individualHelp = confirmed(individualDate)
		? `Individual interviews run on ${individualDate}. If you’re shortlisted, you’ll book a time on either day.`
		: 'We’ll confirm the dates soon.';
</script>

<FormSection id="availability" title="Availability">
	<RadioGroup
		name="availableGroup"
		label="Can you attend one of the group interview sessions?"
		helpText={groupHelp}
		required
		variant="segmented"
		options={yesNo}
		bind:value={form.values.availableGroup}
		error={form.shownErrors.availableGroup}
	/>
	<RadioGroup
		name="availableIndividual"
		label="Can you attend an individual interview on one of these days if shortlisted?"
		helpText={individualHelp}
		note="If you can’t attend any of these sessions, unfortunately we can’t proceed with your application."
		required
		variant="segmented"
		options={yesNo}
		bind:value={form.values.availableIndividual}
		error={form.shownErrors.availableIndividual}
	/>
</FormSection>
