<script lang="ts">
	import { collectionNotice } from '#lib/config/notice.ts';

	/** Shown above Submit so applicants read it before sending (step 3.10). */
	let { id = 'collection-notice' }: { id?: string } = $props();
</script>

<section class="notice" aria-labelledby={id}>
	<h3 {id}>{collectionNotice.title}</h3>
	<p>{collectionNotice.paragraphs.join(' ')}</p>
</section>

<style>
	.notice {
		display: flex;
		flex-direction: column;
		gap: 10px;
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--muted);
	}

	h3 {
		font-size: var(--text-sm);
		font-weight: 500;
		line-height: var(--leading-relaxed);
		color: var(--ink);
	}
</style>
