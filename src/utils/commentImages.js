export const MAX_COMMENT_IMAGES = 8;
export const MAX_COMMENT_IMAGE_BYTES = 20 * 1024 * 1024;
export const COMMENT_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.jepg,.png,.webp,.heic,.heif';

export function validateCommentImage(file) {
  if (!/\.(jpe?g|jepg|png|webp|heic|heif)$/i.test(file.name) && !/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type)) throw new Error('รองรับ JPG, JPEG, PNG, WebP และ HEIC/HEIF');
  if (!file.size || file.size > MAX_COMMENT_IMAGE_BYTES) throw new Error('รูปต้องมีขนาดไม่เกิน 20 MB และไม่ใช่ไฟล์ว่าง');
}

function decode(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    const timer = setTimeout(() => { cleanup(); reject(new Error('อ่านรูปไม่สำเร็จ')); }, 30000);
    function cleanup() { clearTimeout(timer); URL.revokeObjectURL(url); }
    img.onload = () => { cleanup(); resolve(img); };
    img.onerror = () => { cleanup(); reject(new Error('อ่านรูปไม่สำเร็จ')); };
    img.src = url;
  });
}

export async function prepareCommentImage(file) {
  validateCommentImage(file);
  let img;
  try { img = await decode(file); }
  catch (error) {
    if (!/\.(heic|heif)$/i.test(file.name) && !/^image\/hei[cf]$/.test(file.type)) throw error;
    const { default: heic2any } = await import('heic2any');
    let timer;
    let converted;
    try {
      converted = await Promise.race([
        heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 }),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('แปลงรูปไม่สำเร็จ')), 45000); })
      ]);
    } finally { clearTimeout(timer); }
    img = await decode(Array.isArray(converted) ? converted[0] : converted);
  }
  const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('อุปกรณ์นี้ไม่สามารถเตรียมรูปได้');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
  return { id: crypto.randomUUID(), name: file.name, url: canvas.toDataURL('image/jpeg', 0.82), width: canvas.width, height: canvas.height };
}
