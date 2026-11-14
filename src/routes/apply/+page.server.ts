import { fail } from '@sveltejs/kit';
import * as env from '$app/env/private';
import { recruitment } from '#lib/config/recruitment.ts';
import { applicationWindow, windowState } from '#lib/domain/window.ts';
import { createContainer, type Container } from '#lib/server/container.ts';
import { toActionResponse } from '#lib/server/submitResponse.ts';
import type { Actions, PageServerLoad } from './$types';

let container: Container | undefined;

/** Built on first use so the fake repository keeps its applications between requests. */
function getContainer(): Container {
	if (!container) {
		container = createContainer(env, recruitment);
		console.info(
			JSON.stringify({
				event: 'container',
				repo: container.repoKind,
				database: container.database
			})
		);
	}
	return container;
}

const applyWindow = applicationWindow(recruitment);

export const load: PageServerLoad = () => {
	const now = getContainer().clock.now();
	return {
		windowState: windowState(now, applyWindow),
		opensAt: applyWindow?.opensAt.toISOString(),
		closesAt: applyWindow?.closesAt.toISOString(),
		form: {
			wordLimit: recruitment.wordLimit,
			maxResumeBytes: recruitment.maxResumeBytes,
			graduationOptions: recruitment.graduationOptions,
			interviews: recruitment.interviews,
			generalQuestion: recruitment.generalQuestion,
			roles: recruitment.roles.map(({ id, name, question }) => ({ id, name, question }))
		}
	};
};

export const actions: Actions = {
	default: async ({ request, getClientAddress }) => {
		let form: FormData;
		try {
			form = await request.formData();
		} catch {
			return fail(400, { ok: false, reason: 'invalid', fieldErrors: {} });
		}

		const result = await getContainer().service.submit(form, getClientAddress());
		const { status, data } = toActionResponse(result);
		return status === 200 ? data : fail(status, data);
	}
};
