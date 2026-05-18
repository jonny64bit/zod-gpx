import { describe, it, expect } from 'vitest';
import { parseGpxString } from '../index.js';

const minimalGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="test" xmlns="http://www.topografix.com/GPX/1/1">
</gpx>`;

const trackGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TestApp" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>Test Track</name>
    <time>2024-01-15T10:00:00Z</time>
  </metadata>
  <trk>
    <name>My Track</name>
    <trkseg>
      <trkpt lat="51.5074" lon="-0.1278">
        <ele>10.0</ele>
        <time>2024-01-15T10:00:00Z</time>
      </trkpt>
      <trkpt lat="51.5080" lon="-0.1270">
        <ele>12.5</ele>
        <time>2024-01-15T10:01:00Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

const waypointGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TestApp" xmlns="http://www.topografix.com/GPX/1/1">
  <wpt lat="51.5074" lon="-0.1278">
    <name>London</name>
    <ele>5.0</ele>
    <sym>City</sym>
  </wpt>
</gpx>`;

const routeGpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TestApp" xmlns="http://www.topografix.com/GPX/1/1">
  <rte>
    <name>My Route</name>
    <rtept lat="51.5074" lon="-0.1278">
      <name>Start</name>
    </rtept>
    <rtept lat="51.5200" lon="-0.1000">
      <name>End</name>
    </rtept>
  </rte>
</gpx>`;

describe('parseGpxString', () => {
  it('accepts minimal valid GPX', () => {
    const result = parseGpxString(minimalGpx);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.gpx['@_version']).toBe('1.1');
      expect(result.data.gpx['@_creator']).toBe('test');
    }
  });

  it('accepts GPX with track', () => {
    const result = parseGpxString(trackGpx);
    expect(result.success).toBe(true);
    if (result.success) {
      const trk = result.data.gpx.trk?.[0];
      expect(trk?.name).toBe('My Track');
      expect(trk?.trkseg?.[0].trkpt).toHaveLength(2);
    }
  });

  it('accepts GPX with waypoints', () => {
    const result = parseGpxString(waypointGpx);
    expect(result.success).toBe(true);
    if (result.success) {
      const wpt = result.data.gpx.wpt?.[0];
      expect(wpt?.name).toBe('London');
      expect(wpt?.['@_lat']).toBe(51.5074);
    }
  });

  it('accepts GPX with route', () => {
    const result = parseGpxString(routeGpx);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.gpx.rte?.[0].rtept).toHaveLength(2);
    }
  });

  it('rejects wrong version', () => {
    const xml = minimalGpx.replace('version="1.1"', 'version="1.0"');
    const result = parseGpxString(xml);
    expect(result.success).toBe(false);
  });

  it('rejects missing creator', () => {
    const xml = `<?xml version="1.0"?><gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1"></gpx>`;
    const result = parseGpxString(xml);
    expect(result.success).toBe(false);
  });

  it('rejects latitude out of range', () => {
    const xml = waypointGpx.replace('lat="51.5074"', 'lat="91.0"');
    const result = parseGpxString(xml);
    expect(result.success).toBe(false);
  });

  it('rejects longitude out of range', () => {
    const xml = waypointGpx.replace('lon="-0.1278"', 'lon="180.0"');
    const result = parseGpxString(xml);
    expect(result.success).toBe(false);
  });

  it('rejects invalid fix value', () => {
    const xml = trackGpx.replace('</trkpt>', '<fix>4d</fix></trkpt>');
    const result = parseGpxString(xml);
    expect(result.success).toBe(false);
  });

  it('rejects non-XML input', () => {
    expect(() => parseGpxString('not xml at all')).not.toThrow();
    const result = parseGpxString('not xml at all');
    expect(result.success).toBe(false);
  });
});
