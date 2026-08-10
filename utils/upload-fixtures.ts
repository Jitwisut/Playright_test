import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { TestInfo } from '@playwright/test';

export type UploadKind = 'jpg' | 'jpeg' | 'png' | 'gif' | 'pdf' | 'txt' | 'docx' | 'svg' | 'exe' | 'corrupt' | 'zero';

const onePixelPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
const onePixelGif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64');
const tinyJpeg = Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/AYf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AYf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Av/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8hH//Z', 'base64');

function contentFor(kind: UploadKind): Buffer {
  switch (kind) {
    case 'png': return onePixelPng;
    case 'gif': return onePixelGif;
    case 'jpg':
    case 'jpeg': return tinyJpeg;
    case 'pdf': return Buffer.from('%PDF-1.4 synthetic test file\n');
    case 'txt': return Buffer.from('synthetic text upload\n');
    case 'docx': return Buffer.from('PK\x03\x04 synthetic docx placeholder\n');
    case 'svg': return Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1"/></svg>');
    case 'exe': return Buffer.from('MZ synthetic harmless dummy file\n');
    case 'corrupt': return Buffer.from('not-an-image');
    case 'zero': return Buffer.alloc(0);
  }
}

function mimeFor(kind: UploadKind): string {
  if (kind === 'png') return 'image/png';
  if (kind === 'gif') return 'image/gif';
  if (kind === 'jpg' || kind === 'jpeg') return 'image/jpeg';
  if (kind === 'pdf') return 'application/pdf';
  if (kind === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (kind === 'svg') return 'image/svg+xml';
  if (kind === 'exe') return 'application/octet-stream';
  return 'text/plain';
}

export async function createUploadFixture(testInfo: TestInfo, kind: UploadKind, fileName?: string): Promise<string> {
  const extension = kind === 'corrupt' || kind === 'zero' ? 'png' : kind;
  const name = fileName ?? `synthetic-${kind}.${extension}`;
  const directory = testInfo.outputPath('uploads');
  await mkdir(directory, { recursive: true });
  const filePath = path.join(directory, name);
  await writeFile(filePath, contentFor(kind));
  return filePath;
}

export function createUploadPayload(kind: UploadKind, fileName = `synthetic-${kind}.jpg`): { name: string; mimeType: string; buffer: Buffer } {
  return { name: fileName, mimeType: mimeFor(kind), buffer: contentFor(kind) };
}
