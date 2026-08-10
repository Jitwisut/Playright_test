let sequence = 0;

export function generateUniqueEmail(prefix = 'qa.playwright'): string {
  sequence += 1;
  return `${prefix}.${Date.now()}.${sequence}@example.test`;
}

export function generateThaiName(): string {
  return 'ทดสอบ ระบบ';
}

export function generateEnglishName(): string {
  return 'Test Automation';
}

export function generateLongString(length: number, character = 'A'): string {
  return character.repeat(Math.max(0, length));
}

export function withWhitespace(value: string): { leading: string; trailing: string; both: string } {
  return { leading: ` ${value}`, trailing: `${value} `, both: ` ${value} ` };
}
