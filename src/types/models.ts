import type { LucideIcon } from 'lucide-react';

export type UserId = string | number;
export type ValidationErrors = Record<string, string>;
export interface Profile {
  displayName: string;
  bio: string;
  provinceId: string;
  districtId: string;
  avatarUrl: string;
}
export interface User extends Partial<Profile> {
  id: UserId;
  username?: string;
  email?: string;
  authProvider?: 'password' | 'line';
  lineUserId?: string;
  tier?: string;
  created_at?: string;
  updated_at?: string;
  onboardingStatus?: string;
  onboardingData?: OnboardingData;
  showProfile?: boolean;
  publicProfileVisible?: boolean;
  publicAreaVisible?: boolean;
  deletedAt?: string;
  deleted_at?: string;
  isDeleted?: boolean;
  interests?: string[];
  publicOnboarding?: { level?: string; goals?: string[] };
}
export interface FitnessLevel {
  runningDistance: string | number;
  runningDuration: string | number;
  distanceSelection: string;
  customDistance: string;
  durationSelection: string;
  customDurationHours: string;
  customDurationMinutes: string;
}
export interface Goal {
  id: string;
  goalType: string;
  targetValue: string | number;
  targetDate: string;
  targetDistanceSelection?: string;
  customTargetDistance?: string;
  targetDurationSelection?: string;
  customTargetDurationHrs?: string;
  customTargetDurationMins?: string;
  eventSelection?: string;
  customEventName?: string;
  buddyStatus?: string;
  goalEnduranceFocus?: string;
  goalTargetDateSelect?: string;
  goalCustomDate?: string;
  enduranceFocus?: string;
  targetDateSelection?: string;
  customTargetDate?: string;
}
export interface AvailabilityWindow {
  id: string;
  area?: string;
  areaLabel: string;
  areaTypes: string[];
  dayPreset: string;
  selectedDays: string[];
  weeklyFrequency: string;
  timePresets: string[];
  customTimeFrom: string;
  customTimeTo: string;
  note: string;
}
export interface HealthConcern {
  id?: string;
  concernName?: string;
  concernType?: string;
  concern_type: string;
  concern_name: string | string[];
  medication_name: string;
  restriction_level: string;
  restriction_note: string;
  start_date: string;
  end_date: string;
  status: string;
  is_active: boolean;
  custom_concern_name: string;
}
export interface OnboardingData {
  demographics: { age: string | number; gender: string; birthDate: string };
  fitnessLevel: FitnessLevel;
  goals: Goal[];
  availabilityWindows: AvailabilityWindow[];
  safetyCheck: { mainSelection: string[]; concerns: HealthConcern[] };
  constraints?: { id: string; constraintType: string; areaType: string; areaLabel: string | null; dayOfWeek: string | null; availableFrom: string | null; availableTo: string | null; weeklyFrequency: string | number; note: string | null; isActive?: boolean }[];
  health?: { hasConcerns: boolean | null; concerns: HealthConcern[] };
}
export interface StepHandle { validate: () => boolean }
export interface StepProps {
  onNext?: () => void;
  onPrev?: () => void;
  isEditor?: boolean;
  externalShowValidation?: boolean;
}
export interface EventRecord {
  id: string;
  title: string;
  type: string;
  date: string;
  endDate?: string;
  location: string;
  description: string;
  status: string;
  organizer: { id: UserId; name: string; avatarUrl: string | null };
  hostUserId: UserId;
  visibility?: string;
  joinUrl: string | null;
  coverUrl?: string;
  capacity?: number;
  participantCount?: number;
  registrationClosed?: boolean;
  deletedAt?: string;
  deleted_at?: string;
  isDeleted?: boolean;
}
export interface CommentImage { id: string; name: string; url: string; width: number; height: number }
export interface CommentRecord {
  id: string;
  eventId: string;
  userId: UserId;
  userDisplayName: string;
  userAvatarUrl?: string | null;
  message: string;
  images?: CommentImage[];
  createdAt: string;
}
export interface NavigationItem { to: string; label: string; icon: LucideIcon; description?: string }
export interface SelectOption { value: string; label: string }
