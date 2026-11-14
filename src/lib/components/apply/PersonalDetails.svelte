<script lang="ts">
	import TextField from '#lib/components/form/TextField.svelte';
	import SelectField from '#lib/components/form/SelectField.svelte';
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

	// Interview dates come from the config (step 3.1); until they're confirmed the help text says so.
	const groupHelp = confirmed(groupDate)
		? `The group interview is on ${groupDate}.`
		: 'We’ll confirm the date soon.';
	const individualHelp = confirmed(individualDate)
		? `Individual interviews run on ${individualDate}. We’ll arrange a time with you directly.`
		: 'We’ll arrange a time with you directly.';
</script>

<FormSection id="personal" title="Personal details">
	<TextField
		name="fullName"
		label="Full name"
		required
		autocomplete="name"
		bind:value={form.values.fullName}
		error={form.shownErrors.fullName}
	/>
	<TextField
		name="email"
		type="email"
		label="Student email"
		helpText="Please use your university student email"
		placeholder="you@student.unimelb.edu.au"
		required
		autocomplete="email"
		inputmode="email"
		bind:value={form.values.email}
		error={form.shownErrors.email}
	/>
	<div class="pair">
		<TextField
			name="degree"
			label="Degree"
			placeholder="e.g. Bachelor of Science"
			required
			bind:value={form.values.degree}
			error={form.shownErrors.degree}
		/>
		<SelectField
			name="graduation"
			label="Expected graduation"
			placeholder="Select"
			required
			options={recruitment.graduationOptions}
			bind:value={form.values.graduation}
			error={form.shownErrors.graduation}
		/>
	</div>
	<RadioGroup
		name="availableGroup"
		label="Are you available for the group interview?"
		helpText={groupHelp}
		required
		variant="segmented"
		options={yesNo}
		bind:value={form.values.availableGroup}
		error={form.shownErrors.availableGroup}
	/>
	<RadioGroup
		name="availableIndividual"
		label="Are you available for an individual interview if shortlisted?"
		helpText={individualHelp}
		required
		variant="segmented"
		options={yesNo}
		bind:value={form.values.availableIndividual}
		error={form.shownErrors.availableIndividual}
	/>
</FormSection>

<style>
	.pair {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
		gap: 22px;
	}
</style>
