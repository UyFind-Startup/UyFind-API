export function normalizePhone(phone: string): string {
  return String(phone ?? '').replace(/\D/g, '');
}
