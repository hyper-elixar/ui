import { HF_ACCESS_TOKEN, MODELS } from "$env/static/private";
import { z } from "zod";

const modelsRaw = z
	.array(
		z.object({
			name: z.string().min(1),
			displayName: z.string().min(1).optional(),
			websiteUrl: z.string().url().optional(),
			datasetName: z.string().min(1).optional(),
			userMessageToken: z.string().min(1),
			assistantMessageToken: z.string().min(1),
			preprompt: z.string().default(""),
			maxInputTokens: z.number().int().positive().optional(),
			prepromptUrl: z.string().url().optional(),
			endpoints: z
				.array(
					z.object({
						url: z.string().url(),
						authorization: z.string().min(1).default(`Bearer ${HF_ACCESS_TOKEN}`),
						weight: z.number().int().positive().default(1),
					})
				)
				.optional(),
		})
	)
	.parse(JSON.parse(MODELS));

export const models = await Promise.all(
	modelsRaw.map((m) => ({
		...m,
		preprompt: m.prepromptUrl ? fetch(m.prepromptUrl).then((r) => r.text()) : m.preprompt,
	}))
);

export type BackendModel = (typeof models)[0];

export const defaultModel = models[0];
