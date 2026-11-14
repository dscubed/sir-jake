<script lang="ts">
	import { tick } from 'svelte';
	import { ApplicationForm } from '#lib/apply/form.svelte.ts';
	import { sections, type SectionId } from '#lib/apply/progress.ts';
	import type { ApplicationField } from '#lib/domain/application.ts';
	import ProgressNav from '#lib/components/apply/ProgressNav.svelte';
	import PersonalDetails from '#lib/components/apply/PersonalDetails.svelte';
	import RolePreferences from '#lib/components/apply/RolePreferences.svelte';
	import Questions from '#lib/components/apply/Questions.svelte';
	import FormSection from '#lib/components/apply/FormSection.svelte';
	import ResumeInput from '#lib/components/apply/ResumeInput.svelte';
	import ReviewSubmit from '#lib/components/apply/ReviewSubmit.svelte';

	const form = new ApplicationForm();

	let active = $state<SectionId>('personal');
	/** Shown when every check passes, until the form action exists (step 2.8). */
	let notConnected = $state(false);

	const errorCount = $derived(Object.keys(form.shownErrors).length);
	const showBanner = $derived(form.tried && errorCount > 0);

	const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

	function goToSection(id: SectionId) {
		const el = document.getElementById(id);
		if (!el) return;
		el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
		el.focus({ preventScroll: true });
		active = id;
	}

	/** Moves focus to the first invalid field, which also scrolls it into view (step 3.6). */
	function focusField(field: ApplicationField) {
		const el = document.querySelector<HTMLElement>(`#application [name="${field}"]`);
		el?.focus();
		el?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
	}

	async function onsubmit(event: SubmitEvent) {
		// Until ApplicationService and the form action land (steps 2.7–2.8) there is nowhere to post to,
		// so the browser never submits. The next slice switches this to `use:enhance`.
		event.preventDefault();
		const firstError = form.attemptSubmit();
		await tick();
		if (firstError) {
			notConnected = false;
			focusField(firstError);
		} else {
			notConnected = true;
		}
	}

	function clearForm() {
		form.clear();
		notConnected = false;
	}

	// Scroll-spy for the progress menu: the section whose top is within 200px of the top of the
	// viewport, or the last section once the page is scrolled to the bottom.
	$effect(() => {
		let frame = 0;
		const update = () => {
			frame = 0;
			let current: SectionId = sections[0].id;
			for (const { id } of sections) {
				const el = document.getElementById(id);
				if (el && el.getBoundingClientRect().top < 200) current = id;
			}
			if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) current = 'submit';
			active = current;
		};
		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};
		addEventListener('scroll', onScroll, { passive: true });
		update();
		return () => {
			removeEventListener('scroll', onScroll);
			cancelAnimationFrame(frame);
		};
	});
</script>

<svelte:head>
	<title>Apply · DSCubed Recruitment</title>
</svelte:head>

<section class="hero" aria-labelledby="apply-title">
	<div class="hero-inner">
		<span class="eyebrow">2027 Semester 1 · Officer application</span>
		<h1 id="apply-title">Apply to join the DSCubed committee</h1>
		<p>Your answers save automatically on this device, so you can come back and finish later.</p>
	</div>
</section>

<div class="layout">
	<ProgressNav
		sections={form.progress.sections}
		doneCount={form.progress.doneCount}
		total={form.progress.total}
		{active}
		saveNote="Drafts save automatically"
		ongo={goToSection}
	/>

	<form
		id="application"
		method="POST"
		enctype="multipart/form-data"
		novalidate
		aria-labelledby="apply-title"
		{onsubmit}
	>
		{#if showBanner}
			<div class="banner error" role="alert">
				Please fix {errorCount === 1 ? '1 field' : `${errorCount} fields`} before submitting.
			</div>
		{:else if notConnected}
			<div class="banner info" role="status">
				Everything looks good. Sending applications is switched on in a later step, so nothing was
				submitted.
			</div>
		{/if}

		<PersonalDetails {form} />
		<RolePreferences {form} />
		<Questions {form} />
		<FormSection id="resume" title="Resume" gap={14}>
			<ResumeInput bind:file={form.resume} error={form.shownErrors.resume} />
		</FormSection>
		<ReviewSubmit saveNote="Drafts save automatically" onclear={clearForm} />
	</form>
</div>

<style>
	.hero {
		margin-bottom: 48px;
		background: var(--bg-dark);
	}

	.hero-inner {
		max-width: var(--section-width);
		margin: 0 auto;
		padding: clamp(56px, 7vw, 88px) var(--section-gutter) clamp(48px, 6vw, 72px);
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	h1 {
		max-width: 20ch;
		font-size: var(--text-h1-app);
		line-height: var(--leading-tight);
		color: #ffffff;
		text-wrap: balance;
	}

	.hero-inner p {
		max-width: 60ch;
		line-height: var(--leading-normal);
		color: var(--text-on-dark-2);
	}

	.layout {
		max-width: var(--section-width);
		margin: 0 auto;
		padding: 8px var(--section-gutter) 120px;
		display: grid;
		grid-template-columns: 260px minmax(0, 1fr);
		gap: 72px;
		align-items: start;
	}

	form {
		min-width: 0;
		width: 100%;
		max-width: var(--form-width);
		display: flex;
		flex-direction: column;
		gap: 56px;
	}

	.banner {
		padding: 16px 18px;
		border-radius: var(--radius-lg);
		font-size: 15px;
		line-height: 1.5;
	}

	.banner.error {
		border: 1px solid var(--error);
		background: var(--error-bg);
		color: var(--error-text);
	}

	.banner.info {
		border: 1px solid var(--border);
		background: var(--surface-light);
		color: var(--ink-2);
	}

	@media (max-width: 899px) {
		.hero {
			margin-bottom: 0;
		}

		.layout {
			grid-template-columns: minmax(0, 1fr);
			gap: 32px;
			padding-top: 0;
		}
	}
</style>
