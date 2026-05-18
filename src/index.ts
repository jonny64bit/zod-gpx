import { z } from 'zod';
import { gpxSchema } from './schema.js';
import { parseXml, readFile } from './parse.js';

export * from './schema.js';

export type GpxParseResult =
  | { success: true; data: z.infer<typeof gpxSchema> }
  | { success: false; error: z.ZodError };

/**
 * Parse and validate a GPX XML string against the GPX 1.1 schema.
 */
export function parseGpxString(xml: string): GpxParseResult {
  const raw = parseXml(xml);
  return gpxSchema.safeParse(raw) as GpxParseResult;
}

/**
 * Parse and validate a File object (browser File API) as GPX 1.1.
 */
export async function parseGpxFile(file: File): Promise<GpxParseResult> {
  const xml = await readFile(file);
  return parseGpxString(xml);
}
