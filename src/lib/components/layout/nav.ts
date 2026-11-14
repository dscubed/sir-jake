export interface NavLink {
	label: string;
	href: string;
	/** Opens in a new tab, e.g. the Discord invite. */
	external?: boolean;
}
