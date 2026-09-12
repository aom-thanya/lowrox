# Business Requirements Document (BRD) & Test Cases
**Project:** Lowrox (Web Application)

## 1. Project Overview
Lowrox is a web application designed to help users find exercise buddies and training parties that match their fitness levels, goals, and availability. The platform guides users through a comprehensive onboarding process to understand their fitness profile, which is then used to connect them with compatible partners.

---

## 2. Business Requirements

### 2.1 Authentication & Session Management (Login/Registration)
**Objective:** Securely authenticate users and maintain their sessions across the platform.
- **BR-1.1:** Users must be able to log in using their credentials (mocked via `test/password` for completed onboarding, `new/password` for new users).
- **BR-1.2:** The system must securely store the user session locally and persist it across browser reloads.
- **BR-1.3:** The system must redirect unauthenticated users attempting to access protected routes (e.g., Profile, Onboarding) back to the Login page.
- **BR-1.4:** Users must be able to log out securely, clearing their session data.

### 2.2 User Onboarding Flow
**Objective:** Collect essential fitness data from new users to provide personalized buddy recommendations.
- **BR-2.1:** New users must be forced to complete the 5-step onboarding flow before accessing the main application.
- **BR-2.2:** The onboarding flow must collect:
  1. Basic demographics (Birth date, Gender).
  2. Current fitness stats (Running distance and duration).
  3. Goals & Challenges (Buddy goals, Event prep, Endurance focus).
  4. Availability (Locations, Days, Times).
  5. Health & Safety constraints.
- **BR-2.3:** Users must be able to navigate back and forth between steps without losing data before final submission.
- **BR-2.4:** Upon completion, the onboarding status must be marked as 'completed' and data saved to the user's profile.

### 2.3 Profile Management
**Objective:** Allow users to view and update their personal and fitness data.
- **BR-3.1:** Users must be able to view and edit their basic profile (Display Name, Bio, Location Province/District, Avatar).
- **BR-3.2:** Profile changes must be validated (e.g., Display Name length 2-50 chars, Bio max 300 chars, valid Province/District).
- **BR-3.3:** Users must be able to upload profile avatars (supported formats: JPG, PNG, WEBP, max 5MB) and crop them to a square ratio.
- **BR-3.4:** The system must prompt users with a Confirm Dialog if they attempt to navigate away from the profile editor with unsaved changes.

### 2.4 Profile Onboarding Editor
**Objective:** Allow users to update their previously submitted onboarding fitness answers.
- **BR-4.1:** Users must be able to edit all 5 onboarding steps within a single, continuous page layout under the Profile section.
- **BR-4.2:** The page must load the previously saved onboarding data as default values.
- **BR-4.3:** The system must validate all 5 sections simultaneously when the user clicks "Save Changes."
- **BR-4.4:** The system must prevent navigation with unsaved changes via a Confirm Dialog.

---

## 3. Test Cases (UAT & Functional)

### TC-1: Authentication
- **TC-1.1 (Login Success):** Enter valid credentials -> User is redirected to `/profile` (if completed) or `/onboarding` (if not).
- **TC-1.2 (Login Failure):** Enter invalid credentials -> System displays error message.
- **TC-1.3 (Route Protection):** Access `/profile` without logging in -> Redirected to `/login`.
- **TC-1.4 (Logout):** Click Logout -> Session is destroyed, redirected to `/`.

### TC-2: Onboarding Flow
- **TC-2.1 (Step Navigation):** Fill valid data in Step 1, click Next -> Proceeds to Step 2. Click Back -> Step 1 retains data.
- **TC-2.2 (Validation Block):** Leave required fields blank in Step 1 -> "Next" button is disabled or shows validation errors.
- **TC-2.3 (Completion):** Finish all 5 steps and submit -> User's onboarding status changes to 'completed', redirected to Profile.

### TC-3: Profile Editing
- **TC-3.1 (Load Profile):** Navigate to Profile -> Name, Bio, Location, and Avatar reflect current user data.
- **TC-3.2 (Validation - Name):** Enter 1 character for Display Name -> Shows error "ชื่อที่แสดงต้องมี 2–50 ตัวอักษร" and Save button is disabled.
- **TC-3.3 (Validation - Bio):** Enter >300 chars for Bio -> Shows error and Save button disabled.
- **TC-3.4 (Unsaved Changes):** Edit Bio, click a sidebar link without saving -> Confirm Dialog appears asking to discard or stay.
- **TC-3.5 (Avatar Upload):** Upload 6MB image -> System rejects with "ไฟล์ขนาดใหญ่เกินไป (สูงสุด 5MB)".

### TC-4: Profile Onboarding Editor
- **TC-4.1 (Load Data):** Navigate to `/profile/onboarding` -> Form fields are pre-filled with the user's past onboarding data.
- **TC-4.2 (Bulk Validation):** Clear required fields in "ข้อมูลพื้นฐาน" and "ช่วงเวลาที่สะดวก", click Save -> Both sections display red error texts, Save fails.
- **TC-4.3 (Save Success):** Change fitness level distance, click Save -> Success Toast appears, data persists on reload.
- **TC-4.4 (Unsaved Changes):** Change a goal, attempt to navigate back to Profile -> Confirm Dialog appears.

---

## 4. Technical Unit Test Coverage
We have implemented automated unit tests covering the core logic and data services of the application:
1. **Profile Utilities (`profile.test.js`)**: Validates text lengths, Thai/emoji character counts, and province/district mapping logic.
2. **Image Upload (`profile.test.js`)**: Validates image types, size boundaries, and cropping math.
3. **User Repository (`profile.test.js`)**: Tests mocked local storage persistence, isolated session management, legacy session migration, data corruption recovery, and robust saving of profile and onboarding data.
4. **Onboarding Utilities (`onboarding.test.js`)**: Tests calculation functions like age mapping, pace/speed calculations, and formatting.
5. **Auth Guards (`auth.test.js`)**: Tests logic that redirects users based on auth and onboarding status.
