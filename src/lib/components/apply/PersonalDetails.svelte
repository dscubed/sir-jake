<script lang="ts">
	import TextField from '#lib/components/form/TextField.svelte';
	import SelectField from '#lib/components/form/SelectField.svelte';
	import type { ApplicationForm } from '#lib/apply/form.svelte.ts';
	import { recruitment } from '#lib/config/recruitment.ts';
	import FormSection from './FormSection.svelte';

	let { form }: { form: ApplicationForm } = $props();
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
</FormSection>

<style>
	.pair {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
		gap: 22px;
	}
</style>
