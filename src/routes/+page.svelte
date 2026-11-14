<script lang="ts">
	import Hero from '#lib/components/landing/Hero.svelte';
	import About from '#lib/components/landing/About.svelte';
	import RolesSection from '#lib/components/RolesSection.svelte';
	import Process from '#lib/components/landing/Process.svelte';
	import FinalCta from '#lib/components/landing/FinalCta.svelte';
	import Faq from '#lib/components/landing/Faq.svelte';
	import { site } from '#lib/config/site.ts';
	import { landing } from '#lib/config/landing.ts';
	import { liveWindowStatus } from '#lib/state/windowStatus.svelte.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const status = liveWindowStatus(() => data.windowStatus);
</script>

<svelte:head>
	<title>{site.name} Recruitment · 2027 Semester 1</title>
	<meta name="description" content={landing.hero.lead} />
</svelte:head>

<Hero status={status.current} />
<About />
<RolesSection />
<Process />
<FinalCta status={status.current} />
<Faq />
