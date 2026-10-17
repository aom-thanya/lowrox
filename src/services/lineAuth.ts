// LINE account adapter.
//
// Currently a mock: the UI shows a simulated consent screen and approves with MOCK_LINE_PROFILE.
// To switch to real LINE Login (https://developers.line.biz/en/docs/line-login/):
//   1. Redirect to https://access.line.me/oauth2/v2.1/authorize with your Channel ID,
//      scope "profile openid email", a random `state`, and a callback URL.
//   2. On the callback, send `code` + `state` to a backend that exchanges it for tokens
//      (the Channel Secret must never ship to the browser) and verifies the ID token.
//   3. Have the backend return a LineProfile in the shape below; the rest of the app is unchanged.

export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  email?: string;
}

export const LINE_SCOPES = ['ชื่อที่แสดง', 'รูปโปรไฟล์', 'อีเมล'];

export const MOCK_LINE_PROFILE: LineProfile = {
  userId: 'U0mocklowrox000000000000000000001',
  displayName: 'นักวิ่ง LINE',
  email: 'line.runner@example.com'
};

export async function approveMockLineConsent(): Promise<LineProfile> {
  // Simulates the round trip to LINE and back.
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { ...MOCK_LINE_PROFILE };
}
