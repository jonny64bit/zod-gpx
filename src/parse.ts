import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseAttributeValue: true,
  parseTagValue: true,
  trimValues: true,
  isArray: (tagName) =>
    ['wpt', 'rte', 'trk', 'trkseg', 'trkpt', 'rtept', 'link'].includes(tagName),
});

export function parseXml(xml: string): unknown {
  return parser.parse(xml);
}

export async function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsText(file);
  });
}
