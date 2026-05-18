# zod-gpx

[![npm](https://img.shields.io/npm/v/zod-gpx)](https://www.npmjs.com/package/zod-gpx)
[![license](https://img.shields.io/npm/l/zod-gpx)](LICENSE)

Parse and validate [GPX 1.1](https://www.topografix.com/gpx.asp) files using [Zod](https://zod.dev). Works in the browser and Node.js.

## Features

- Full GPX 1.1 schema validation (tracks, routes, waypoints, metadata)
- Parse from XML string or browser `File` object
- Fully typed — inferred TypeScript types for every GPX element
- Zod v4 peer dependency
- ESM and CJS dual build

## Install

```bash
pnpm add zod-gpx zod
# or
npm install zod-gpx zod
```

`zod` is a peer dependency — install it alongside `zod-gpx`.

## Usage

### Parse an XML string

```ts
import { parseGpxString } from 'zod-gpx';

const result = parseGpxString(xmlString);

if (result.success) {
  const { gpx } = result.data;
  console.log(gpx['@_creator']); // "MyApp"
  console.log(gpx.trk?.[0].name); // "Morning Run"
} else {
  console.error(result.error.issues);
}
```

### Parse a browser File

```ts
import { parseGpxFile } from 'zod-gpx';

async function onFileInput(file: File) {
  const result = await parseGpxFile(file);

  if (result.success) {
    const waypoints = result.data.gpx.wpt ?? [];
    console.log(`${waypoints.length} waypoints loaded`);
  }
}
```

## API

### `parseGpxString(xml: string): GpxParseResult`

Synchronously parses and validates a GPX XML string. Returns a discriminated union:

```ts
type GpxParseResult =
  | { success: true; data: Gpx }
  | { success: false; error: z.ZodError };
```

### `parseGpxFile(file: File): Promise<GpxParseResult>`

Reads a browser `File` object as text then calls `parseGpxString`. Uses the `FileReader` API — browser only.

## Schemas and types

All Zod schemas and their inferred types are exported.

| Export | Type | Description |
|---|---|---|
| `gpxSchema` | `Gpx` | Root GPX document |
| `metadataSchema` | `Metadata` | `<metadata>` element |
| `wptSchema` | `Wpt` | Waypoint / track point / route point |
| `trkSchema` | `Trk` | `<trk>` element |
| `trkSegSchema` | `TrkSeg` | `<trkseg>` element |
| `rteSchema` | `Rte` | `<rte>` element |
| `linkSchema` | `Link` | `<link>` element |
| `personSchema` | `Person` | `<author>` element |
| `boundsSchema` | `Bounds` | `<bounds>` element |
| `fixSchema` | `Fix` | `"none" \| "2d" \| "3d" \| "dgps" \| "pps"` |

### Example: using a type directly

```ts
import type { Trk, Wpt } from 'zod-gpx';

function getTrackPoints(track: Trk): Wpt[] {
  return track.trkseg?.flatMap((seg) => seg.trkpt ?? []) ?? [];
}
```

## Validation rules

Constraints match the [GPX 1.1 XSD](https://www.topografix.com/GPX/1/1/gpx.xsd):

- `@_version` must be `"1.1"`
- `@_creator` must be a non-empty string
- Latitude: `−90` to `90` inclusive
- Longitude: `−180` to `< 180`
- `magvar` / `degreesType`: `0` to `< 360`
- `dgpsid`: integer `0–1023`
- `fix`: one of `none`, `2d`, `3d`, `dgps`, `pps`
- `sat`: non-negative integer

Unknown `<extensions>` elements pass through as `Record<string, unknown>`.

## Development

```bash
pnpm install
pnpm test          # run tests
pnpm test:watch    # watch mode
pnpm typecheck     # type-check only
pnpm build         # build dist/
```

## License

MIT — [Jonathan Dent](https://github.com/jonny64bit)