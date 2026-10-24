import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { vi } from 'vitest';
import Devices from '../src/pages/Devices';
import { useAuth } from '../src/context/AuthContext';
import { connectProvider, disconnectProvider, listConnections, updateConnection } from '../src/services/deviceRepository';

vi.mock('../src/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = vi.fn(function(this: HTMLDialogElement) { this.setAttribute('open', ''); });
  HTMLDialogElement.prototype.close = vi.fn(function(this: HTMLDialogElement) { this.removeAttribute('open'); });
}

function memoryStorage() {
  const data = new Map<string, string>();
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } };
}

describe('deviceRepository', () => {
  test('connects, changes settings and disconnects per user', async () => {
    const storage = memoryStorage();
    await connectProvider('u1', 'garmin', storage);
    expect(listConnections('u1', storage).garmin).toMatchObject({ importRuns: true, postToParty: false });
    expect(listConnections('u2', storage)).toEqual({});

    await updateConnection('u1', 'garmin', { postToParty: true }, storage);
    expect(listConnections('u1', storage).garmin?.postToParty).toBe(true);

    await disconnectProvider('u1', 'garmin', storage);
    expect(listConnections('u1', storage)).toEqual({});
  });
});

describe('Devices page', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(useAuth, { partial: true }).mockReturnValue({ user: { id: 'u1', username: 'runner' } as never });
  });

  test('connects Garmin after the consent step and shows it as connected', async () => {
    render(<Devices />);
    const garmin = screen.getByText('Garmin Connect').closest('li')!;
    fireEvent.click(within(garmin).getByRole('button', { name: 'เชื่อมต่อ' }));

    const dialog = screen.getByRole('dialog', { name: 'เชื่อมต่อ Garmin Connect' });
    expect(within(dialog).getByText('อัตราการเต้นหัวใจระหว่างวิ่ง')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'ไปที่ Garmin Connect' }));

    expect(await screen.findByText('เชื่อมต่อแล้ว', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'นำการวิ่งเข้า My Level อัตโนมัติ' })).toBeInTheDocument();
    expect(listConnections('u1').garmin).toBeDefined();
  });

  test('Apple Health points to the iPhone app instead of connecting on the web', () => {
    render(<Devices />);
    const apple = screen.getByText('Apple Health').closest('li')!;
    expect(within(apple).queryByRole('button')).not.toBeInTheDocument();
    expect(within(apple).getByText('ใช้ในแอป iPhone')).toBeInTheDocument();
  });
});
