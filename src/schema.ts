import { z } from 'zod';

// --- Primitive types from XSD ---

export const latitudeSchema = z.number().min(-90).max(90);
export const longitudeSchema = z.number().min(-180).lt(180);
// degreesType: 0.0 inclusive to 360.0 exclusive
export const degreesSchema = z.number().min(0).lt(360);
// dgpsStationType: integer 0–1023
export const dgpsStationSchema = z.number().int().min(0).max(1023);
export const fixSchema = z.enum(['none', '2d', '3d', 'dgps', 'pps']);

// --- Supporting types ---

export const emailSchema = z.object({
  '@_id': z.string(),
  '@_domain': z.string(),
});

export const linkSchema = z.object({
  '@_href': z.string(),
  text: z.string().optional(),
  type: z.string().optional(),
});

export const personSchema = z.object({
  name: z.string().optional(),
  email: emailSchema.optional(),
  // parser always returns link as array
  link: z.array(linkSchema).optional(),
});

export const copyrightSchema = z.object({
  '@_author': z.string(),
  year: z.string().optional(),
  license: z.string().optional(),
});

export const boundsSchema = z.object({
  '@_minlat': latitudeSchema,
  '@_minlon': longitudeSchema,
  '@_maxlat': latitudeSchema,
  '@_maxlon': longitudeSchema,
});

// extensions is an open type — any additional elements permitted
const extensionsSchema = z.record(z.string(), z.unknown()).optional();

// --- wptType (used for wpt, rtept, trkpt) ---

export const wptSchema = z.object({
  '@_lat': latitudeSchema,
  '@_lon': longitudeSchema,
  ele: z.number().optional(),
  time: z.string().optional(),
  magvar: degreesSchema.optional(),
  geoidheight: z.number().optional(),
  name: z.string().optional(),
  cmt: z.string().optional(),
  desc: z.string().optional(),
  src: z.string().optional(),
  link: z.array(linkSchema).optional(),
  sym: z.string().optional(),
  type: z.string().optional(),
  fix: fixSchema.optional(),
  sat: z.number().int().min(0).optional(),
  hdop: z.number().optional(),
  vdop: z.number().optional(),
  pdop: z.number().optional(),
  ageofdgpsdata: z.number().optional(),
  dgpsid: dgpsStationSchema.optional(),
  extensions: extensionsSchema,
});

// --- rteType ---

export const rteSchema = z.object({
  name: z.string().optional(),
  cmt: z.string().optional(),
  desc: z.string().optional(),
  src: z.string().optional(),
  link: z.array(linkSchema).optional(),
  number: z.number().int().min(0).optional(),
  type: z.string().optional(),
  extensions: extensionsSchema,
  rtept: z.array(wptSchema).optional(),
});

// --- trkType ---

export const trkSegSchema = z.object({
  trkpt: z.array(wptSchema).optional(),
  extensions: extensionsSchema,
});

export const trkSchema = z.object({
  name: z.string().optional(),
  cmt: z.string().optional(),
  desc: z.string().optional(),
  src: z.string().optional(),
  link: z.array(linkSchema).optional(),
  number: z.number().int().min(0).optional(),
  type: z.string().optional(),
  extensions: extensionsSchema,
  trkseg: z.array(trkSegSchema).optional(),
});

// --- metadataType ---

export const metadataSchema = z.object({
  name: z.string().optional(),
  desc: z.string().optional(),
  author: personSchema.optional(),
  copyright: copyrightSchema.optional(),
  link: z.array(linkSchema).optional(),
  time: z.string().optional(),
  keywords: z.string().optional(),
  bounds: boundsSchema.optional(),
  extensions: extensionsSchema,
});

// --- Root gpxType ---

export const gpxSchema = z.object({
  gpx: z.object({
    // parser returns version as number 1.1 — coerce to string before validating
    '@_version': z.preprocess((v) => String(v), z.literal('1.1')),
    '@_creator': z.string().min(1),
    '@_xmlns': z.string().optional(),
    metadata: metadataSchema.optional(),
    wpt: z.array(wptSchema).optional(),
    rte: z.array(rteSchema).optional(),
    trk: z.array(trkSchema).optional(),
    extensions: extensionsSchema,
  }),
});

// --- Inferred types ---

export type Gpx = z.infer<typeof gpxSchema>;
export type GpxRoot = Gpx['gpx'];
export type Wpt = z.infer<typeof wptSchema>;
export type Rte = z.infer<typeof rteSchema>;
export type Trk = z.infer<typeof trkSchema>;
export type TrkSeg = z.infer<typeof trkSegSchema>;
export type Metadata = z.infer<typeof metadataSchema>;
export type Link = z.infer<typeof linkSchema>;
export type Person = z.infer<typeof personSchema>;
export type Bounds = z.infer<typeof boundsSchema>;
export type Fix = z.infer<typeof fixSchema>;
