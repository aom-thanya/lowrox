import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import 'vitest';

// Vitest 5 uses the first generic parameter for the matcher return type.
declare module 'vitest' {
  interface Matchers<R, T> extends TestingLibraryMatchers<unknown, R> {}
}
