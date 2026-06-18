import { defineCollection, z } from 'astro:content';

// Build Lab tool cards — Joshua adds/edits one Markdown file per tool.
// Hard rule: client-clean. Every card shows the method/build on demo data only.
const buildlab = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tag: z.enum(['Live demo', 'Case study', 'Tool', 'Dashboard', 'Automation', 'Training']),
    blurb: z.string(),
    pill: z.string(),               // small caption, e.g. "Next.js · demo data"
    accent: z.enum(['p', 'b', 'y', 'c']).default('b'),
    href: z.string().optional(),    // live demo / case link (optional)
    order: z.number().default(99),
    featured: z.boolean().default(true),
  }),
});

// "News from the Desk" essays — canonical home of the writing (brief §8).
const essays = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    dek: z.string().optional(),
    date: z.coerce.date(),
    value: z.enum(['origin', 'imua', 'ohana', 'pono', 'aloha', 'mahalo']).optional(),
    pullquote: z.string().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
});

export const collections = { buildlab, essays };
