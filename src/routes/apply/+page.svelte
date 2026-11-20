<script lang="ts">
	import { tick } from 'svelte';
	import { enhance, type SubmitFunction } from '$app/forms';
	import { ApplicationForm } from '#lib/apply/form.svelte.ts';
	import { DraftStore } from '#lib/apply/draft.svelte.ts';
	import { outcomeFromResult } from '#lib/apply/outcome.ts';
	import { firstErrorField } from '#lib/apply/fields.ts';
	import { sections, type SectionId } from '#lib/apply/progress.ts';
	import type { ApplicationField } from '#lib/domain/application.ts';
	import { SUBMISSION_ID_FIELD } from '#lib/domain/submissionId.ts';
	import type { PageProps } from './$types';
	import ProgressNav from '#lib/components/apply/ProgressNav.svelte';
	import PersonalDetails from '#lib/components/apply/PersonalDetails.svelte';
	import Availability from '#lib/components/apply/Availability.svelte';
	import RolePreferences from '#lib/components/apply/RolePreferences.svelte';
	import Questions from '#lib/components/apply/Questions.svelte';
	import FormSection from '#lib/components/apply/FormSection.svelte';
	import ResumeInput from '#lib/components/apply/ResumeInput.svelte';
	import ReviewSubmit from '#lib/components/apply/ReviewSubmit.svelte';
	import StatusScreen from '#lib/components/apply/StatusScreen.svelte';
	import { recruitment } from '#lib/config/recruitment.ts';
	import { formatMelbourne } from '#lib/domain/window.ts';
	import Turnstile from '#lib/components/apply/Turnstile.svelte';

	let { data }: PageProps = $props();

	const form = new ApplicationForm();
	const draft = new DraftStore();

	/**
	 * Before opening or after closing, the server's load (step 2.8) says so up front and the form
	 * isn't shown. Unscheduled ("TBD") dates still show the form; the server decides at submit.
	 */
	const notOpen = $derived(data.windowState === 'before' || data.windowState === 'after');

	let active = $state<SectionId>('personal');
	let submitting = $state(false);
	/** Banner for outcomes that keep the form on screen: captcha, duplicate, upstream (design §8). */
	let retryMessage = $state<string | null>(null);
	/** Set once the form is done with: it is replaced by the success or closed screen. */
	let finished = $state<'success' | 'closed' | null>(null);

	let turnstile: Turnstile | undefined = $state();
	let banner: HTMLDivElement | undefined = $state();

	const errorCount = $derived(Object.keys(form.shownErrors).length);
	const showErrorBanner = $derived(form.tried && errorCount > 0);

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

	async function showRetry(message: string) {
		retryMessage = message;
		await tick();
		banner?.focus();
		banner?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
	}

	/**
	 * Progressive enhancement of the form post (design §8). The browser checks run first, so a
	 * submission with mistakes never leaves the page. Every failure keeps the applicant's answers.
	 */
	const submitApplication: SubmitFunction = ({ cancel }) => {
		retryMessage = null;
		const firstError = form.attemptSubmit();
		if (firstError) {
			cancel();
			tick().then(() => focusField(firstError));
			return;
		}
		submitting = true;

		return async ({ result }) => {
			submitting = false;
			const outcome = outcomeFromResult(result);

			if (outcome.kind === 'success') {
				draft.clear();
				finished = 'success';
				scrollTo({ top: 0 });
				return;
			}

			if (outcome.kind === 'closed') {
				finished = 'closed';
				scrollTo({ top: 0 });
				return;
			}

			// A Turnstile token can only be verified once, so every retry needs a fresh check.
			turnstile?.reset();

			if (outcome.kind === 'invalid') {
				form.setServerErrors(outcome.fieldErrors);
				await tick();
				const field = firstErrorField(form.shownErrors);
				if (field) focusField(field);
				return;
			}

			await showRetry(outcome.message);
		};
	};

	function clearForm() {
		form.clear();
		draft.clear();
		retryMessage = null;
		turnstile?.reset();
	}

	// Draft autosave (step 3.5): restore once in the browser, then save (debounced) on every change.
	let restored = false;
	$effect(() => {
		const values = $state.snapshot(form.values);
		if (!restored) {
			restored = true;
			const saved = draft.load();
			if (saved) form.restore(saved);
			return;
		}
		draft.schedule(values);
	});
	$effect(() => () => draft.cancel());

	// Scroll-spy for the progress menu: the section whose top is within 200px of the top of the
	// viewport, or the last section once the page is scrolled to the bottom.
	$effect(() => {
		if (finished) return;
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

{#if finished === 'success'}
	<StatusScreen
		eyebrow="Application received"
		title="Thanks for applying"
		lead="Keep an eye on your student email. Best of luck!"
	/>
{:else if finished === 'closed' || notOpen}
	<StatusScreen
		eyebrow="2027 Semester 1 · Officer application"
		title="Applications are currently closed"
		lead={data.windowState === 'before'
			? `They will open on ${formatMelbourne(recruitment.opensAt)}.`
			: 'Keep an eye on our Discord for the next round.'}
		focus={finished === 'closed'}
	/>
{:else}
	<section class="hero" aria-labelledby="apply-title">
		<div class="hero-inner">
			<span class="eyebrow">2027 Semester 1 · Officer application</span>
			<h1 id="apply-title">Application Form</h1>
			<p>Join to meet cool people, you won't regret it :)</p>
		</div>
	</section>

	<div class="layout">
		<ProgressNav
			sections={form.progress.sections}
			doneCount={form.progress.doneCount}
			total={form.progress.total}
			{active}
			saveNote={draft.note}
			ongo={goToSection}
		/>

		<form
			id="application"
			method="POST"
			enctype="multipart/form-data"
			novalidate
			aria-labelledby="apply-title"
			aria-busy={submitting}
			use:enhance={submitApplication}
		>
			<!-- Same ID on every attempt, so the server recognises a retry (design §6.4). -->
			<input type="hidden" name={SUBMISSION_ID_FIELD} value={draft.submissionId} />

			{#if retryMessage}
				<div class="banner" role="alert" tabindex="-1" bind:this={banner}>
					{retryMessage}
				</div>
			{:else if showErrorBanner}
				<div class="banner" role="alert">
					Please fix {errorCount === 1 ? '1 field' : `${errorCount} fields`} before submitting.
				</div>
			{/if}

			<PersonalDetails {form} />
			<RolePreferences {form} />
			<Questions {form} />
			<FormSection id="resume" title="Resume" gap={14}>
				<ResumeInput bind:file={form.resume} error={form.shownErrors.resume} />
			</FormSection>
			<Availability {form} />
			<ReviewSubmit {submitting} saveNote={draft.note} onclear={clearForm}>
				{#snippet captcha()}
					<Turnstile bind:this={turnstile} />
				{/snippet}
			</ReviewSubmit>
		</form>
	</div>
{/if}

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
		border: 1px solid var(--error);
		border-radius: var(--radius-lg);
		background: var(--error-bg);
		color: var(--error-text);
		font-size: 15px;
		line-height: 1.5;
	}

	.banner:focus {
		outline: none;
	}

	@media (max-width: 899px) {
		/* Keeps focused fields clear of the sticky nav and progress bar (WCAG 2.4.11). */
		:global(html:has(#application)) {
			scroll-padding-top: 140px;
		}

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
