// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	/** The parts of Cloudflare Turnstile's browser API the form uses (step 3.7). */
	interface TurnstileApi {
		render(
			el: HTMLElement,
			options: { sitekey: string; theme?: 'light' | 'dark' | 'auto'; size?: 'normal' | 'flexible' }
		): string;
		reset(widgetId: string): void;
		remove(widgetId: string): void;
	}

	interface Window {
		turnstile?: TurnstileApi;
	}
}

export {};
