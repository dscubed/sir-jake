export interface NavLink {
	label: string;
	href: string;
	/** Opens in a new tab, e.g. the Discord invite. */
	external?: boolean;
	/** The link points to the page being viewed. */
	current?: boolean;
}

/** The pill on the right: a link, or plain text when there's nowhere to go. */
export type NavCta = (NavLink & { href: string }) | { label: string; href?: undefined };
