export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
export const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateImageFile(file: Pick<File, 'type' | 'size'>) {
  if (!AVATAR_TYPES.includes(file.type)) return 'รองรับไฟล์ JPG, PNG และ WebP เท่านั้น';
  if (file.size > MAX_AVATAR_BYTES) return 'กรุณาเลือกรูปขนาดไม่เกิน 5 MB';
  return '';
}

export function cropBounds(width: number, height: number, zoom: number, x: number, y: number) {
  const side = Math.min(width, height) / zoom;
  return { sx: (width - side) * x / 100, sy: (height - side) * y / 100, side };
}
