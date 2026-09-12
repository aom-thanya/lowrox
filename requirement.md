# Lowrox Requirements (Input-Process-Output Model)

This document outlines the requirements for each key page in the Lowrox application using the Input-Process-Output (IPO) model.

---

## 1. Login Page (`/login`)
**Description:** The authentication entry point for users.

* **Input:**
  * User credentials (Username/Password).
  * URL redirect parameter (where the user came from).
* **Process:**
  * Validate if the fields are empty.
  * Authenticate credentials against the mock `userRepository`.
  * Retrieve user data and check `onboardingStatus`.
  * Determine the redirection target (`getLoginDestination`):
    * If `onboardingStatus` is `not_started`, target is `/onboarding`.
    * If `onboardingStatus` is `completed`, target is `/profile` (or the previous internal URL).
* **Output:**
  * **Success:** Create session in local storage. Redirect user to the target URL.
  * **Error:** Display "ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง" (Invalid credentials) error message.

---

## 2. Onboarding Flow (`/onboarding`)
**Description:** A 5-step wizard to collect fitness data from new users.

* **Input:**
  * **Step 1:** Birth date, Gender.
  * **Step 2:** Average distance (km), Average duration (minutes), Training environment.
  * **Step 3:** Running goals, Selected challenge date/event.
  * **Step 4:** Preferred running days, Preferred time slots.
  * **Step 5:** Health conditions, Medication, Emergency contact.
* **Process:**
  * **Validation:** Calculate age from DOB (must be valid). Calculate pace/speed from distance/duration.
  * **State Management:** Keep track of data in `OnboardingContext` when moving Back/Next.
  * **Submission:** On step 5 completion, merge all data. Update `user.onboardingData` and set `user.onboardingStatus` to `completed`.
* **Output:**
  * **Success:** Data is saved in the database. Redirect to `/profile`.
  * **Error:** Prevent advancing to the next step if validation fails.

---

## 3. Profile Management Page (`/profile`)
**Description:** The dashboard where users can update their identity and location.

* **Input:**
  * Display Name (String).
  * Bio (String).
  * Province & District (Dropdown selections).
  * Avatar Image (File upload).
  * Navigation attempts (Sidebar clicks).
* **Process:**
  * **Text Validation:** Validate Display Name length (2-50 chars). Validate Bio length (max 300 chars including pasted text).
  * **Location Logic:** Reset District to empty if Province is changed.
  * **Image Validation:** Validate file type (JPG, PNG, WEBP) and file size (≤ 5MB).
  * **Image Processing:** Calculate square crop dimensions based on zoom/pan coordinates.
  * **Unsaved Changes:** Compare draft state with saved state (`hasProfileChanges`). Block navigation if dirty.
* **Output:**
  * **Success:** Data is saved. Toast notification "บันทึกโปรไฟล์แล้ว" appears.
  * **Error:** Show inline validation errors under inputs. Show Confirm Dialog if attempting to leave with unsaved changes.

---

## 4. Profile Onboarding Editor (`/profile/onboarding`)
**Description:** An inline editor for users to update their previously submitted onboarding answers.

* **Input:**
  * Initial data loaded from `userRepository`.
  * Modified form inputs across 5 concatenated sections.
* **Process:**
  * **Initialization:** Pre-fill all forms using `initialData`.
  * **Unsaved Changes:** Track `isDirty` by deep comparing current `formData` against `initialData`. Block external navigation if dirty.
  * **Validation:** Upon clicking "Save", trigger `validate()` on all 5 child components via React Refs simultaneously.
  * **Submission:** If all sections pass, persist updated `onboardingData` via `saveOnboardingData`.
* **Output:**
  * **Success:** Reset `isDirty` to false. Toast notification "บันทึกข้อมูลสำเร็จ" appears.
  * **Error:** Focus invalid inputs and display inline red text. Prevent saving. Show Confirm Dialog if attempting to leave with unsaved changes.

---

## 5. Settings Page (`/profile/settings`)
**Description:** A settings page for managing account configuration and logging out.

* **Input:**
  * User's authentication information (e.g., username, email).
  * Profile Visibility Toggle ("แสดงโปรไฟล์ในการหา Buddy").
  * Logout action (button click).
* **Process:**
  * **Visibility Management:** Deep compare current toggle state vs saved state (`showProfile`). Block navigation if unsaved changes exist. Update `userRepository` when "Save Changes" is pressed.
  * **Logout:** Confirm intent via a Dialog. If confirmed, call the logout flow to clear the session and redirect to the home page.
  * **Unsaved Changes:** Warn users if they attempt to leave or log out without saving their settings.
* **Output:**
  * **Success:** Settings are updated with a Toast notification "บันทึกการตั้งค่าแล้ว". Logged out users are sent to `/` as unauthenticated visitors.
  * **Error:** Show error message if saving or logging out fails.

---

## 6. Automated Testing Coverage (Node:Test)
The backend logic, validations, and data processing that support the above IPO models are tested via automated unit tests:

1. **Authentication (`tests/auth.test.js`)**
   * Tests the routing logic (`getLoginDestination`) for directing users to `/profile` or `/onboarding` based on status.
2. **Onboarding Process (`tests/onboarding.test.js`)**
   * Tests calculations for age mapping, running pace, and target date mapping.
3. **Profile Processing (`tests/profile.test.js`)**
   * Tests text validation (Thai/emoji lengths).
   * Tests location mapping (Province/District matching).
   * Tests Image upload boundaries (5MB max) and crop logic.
   * Tests Database persistence (`userRepository`), session migration, error handling, and `onboardingData` merging.
