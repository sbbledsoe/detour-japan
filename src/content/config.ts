import { defineCollection, z } from 'astro:content';

const locationSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
});

const mapSchema = z.object({
  center: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  zoom: z.number().optional(),
  locations: z.array(locationSchema).optional(),
});

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    heroImageCredit: z.string().optional(),
    prefecture: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    map: mapSchema.optional(),
  }),
});

const draftsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    heroImageCredit: z.string().optional(),
    prefecture: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(true),
  }),
});

export const collections = {
  posts: postsCollection,
  drafts: draftsCollection,
};
