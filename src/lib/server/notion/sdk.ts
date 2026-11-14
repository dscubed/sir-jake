// The Notion SDK is published as CommonJS. Vite's dev server can't take named imports from it, so
// import the whole module once here and re-export what the rest of the code uses.
import notion from '@notionhq/client';

export const { Client, APIErrorCode, RequestTimeoutError, isFullPage, isHTTPResponseError } =
	notion;
export type Client = InstanceType<typeof Client>;
