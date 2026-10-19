export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function assertNonEmptyString(value: unknown, fieldName: string): asserts value is string {
  if (!isNonEmptyString(value)) {
    throw new Error(`${fieldName} is required`);
  }
}
