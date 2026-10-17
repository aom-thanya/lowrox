import type { User, Profile, ValidationErrors } from '../types/models';
export const characterCount = (value: string) => Array.from(value).length;

export function profileFromUser(user: Partial<User>): Profile {
  return {
    displayName: user.displayName ?? user.username ?? '',
    bio: user.bio ?? '',
    provinceId: user.provinceId ?? '',
    districtId: user.districtId ?? '',
    avatarUrl: user.avatarUrl ?? '',
  };
}

export function settingsFromUser(user: User) {
  return {
    showProfile: user.showProfile ?? true,
  };
}

export function validateProfile(profile: Profile, areas: { value: string; districts: { value: string }[] }[]): ValidationErrors {
  const errors: ValidationErrors = {};
  const nameLength = characterCount((profile.displayName || '').trim());
  if (!nameLength) errors.displayName = 'กรุณากรอกชื่อที่แสดง';
  else if (nameLength < 2 || nameLength > 50) errors.displayName = 'ชื่อที่แสดงต้องมี 2–50 ตัวอักษร';
  if (characterCount(profile.bio) > 300) errors.bio = 'แนะนำตัวได้สูงสุด 300 ตัวอักษร';
  const province = areas.find((area) => area.value === profile.provinceId);
  if (profile.provinceId && !province) errors.provinceId = 'กรุณาเลือกจังหวัดจากรายการ';
  if (profile.districtId && !province?.districts.some((area) => area.value === profile.districtId)) {
    errors.districtId = 'กรุณาเลือกเขต / อำเภอในจังหวัดที่เลือก';
  }
  if (profile.avatarUrl && !/^data:image\/(webp|png|jpeg);base64,/.test(profile.avatarUrl)) {
    errors.avatarUrl = 'รูปโปรไฟล์ไม่ถูกต้อง กรุณาเลือกรูปใหม่';
  }
  return errors;
}

export function hasProfileChanges(draft: Profile | null, saved: Profile | null) {
  return Boolean(draft && saved && (Object.keys(draft) as (keyof Profile)[]).some((key) => draft[key] !== saved[key]));
}

export function hasSettingsChanges(draft: { showProfile: boolean } | null, saved: { showProfile: boolean } | null) {
  if (!draft || !saved) return false;
  return draft.showProfile !== saved.showProfile;
}
