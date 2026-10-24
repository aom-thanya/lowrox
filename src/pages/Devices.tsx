import React, { useCallback, useState } from 'react';
import { Check, Lock, RefreshCw, Smartphone, Watch } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import PageHeader from '../components/common/PageHeader';
import ContentCard from '../components/common/ContentCard';
import Button from '../components/common/Button';
import Dialog from '../components/common/Dialog';
import Switch from '../components/common/Switch';
import Toast from '../components/common/Toast';
import {
  PROVIDERS, connectProvider, disconnectProvider, listConnections, syncProvider, updateConnection,
  type Connection, type Provider, type ProviderId,
} from '../services/deviceRepository';

const relative = new Intl.RelativeTimeFormat('th', { numeric: 'auto' });
const ago = (iso: string) => {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  if (minutes > -1) return 'เมื่อสักครู่';
  if (minutes > -60) return relative.format(minutes, 'minute');
  if (minutes > -1440) return relative.format(Math.round(minutes / 60), 'hour');
  return relative.format(Math.round(minutes / 1440), 'day');
};

// What the app reads once connected; shown before the user leaves for the provider's consent page.
const PERMISSIONS = ['กิจกรรมวิ่ง: ระยะทาง เวลา เพซ และเส้นทาง', 'อัตราการเต้นหัวใจระหว่างวิ่ง', 'ชื่อรุ่นนาฬิกา'];

function ProviderMark({ provider }: { provider: Provider }) {
  return (
    <span className="grid size-12 shrink-0 place-items-center rounded-lg text-xl font-bold text-white" style={{ background: provider.color }} aria-hidden="true">
      {provider.mark}
    </span>
  );
}

function ToggleRow({ id, label, helper, checked, disabled, onChange }: { id: string; label: string; helper: string; checked: boolean; disabled?: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="settings-toggle-row">
      <div>
        <p className="font-medium" id={`${id}-label`}>{label}</p>
        <p className="text-sm text-neutral-600">{helper}</p>
      </div>
      <div className="settings-toggle-control">
        <Switch id={id} aria-labelledby={`${id}-label`} checked={checked} disabled={disabled} onChange={onChange} />
      </div>
    </div>
  );
}

// Connect a watch or running app so runs come in by themselves instead of being logged by hand.
export default function Devices() {
  const { user } = useAuth();
  useDocumentTitle('เชื่อมต่ออุปกรณ์ | Lowrox');
  const [connections, setConnections] = useState(() => (user ? listConnections(user.id) : {}));
  const [pending, setPending] = useState<ProviderId | null>(null);
  const [connecting, setConnecting] = useState<Provider | null>(null);
  const [disconnecting, setDisconnecting] = useState<Provider | null>(null);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const dismissToast = useCallback(() => setToast(''), []);

  const run = async (provider: ProviderId, action: () => Promise<typeof connections>, done?: string) => {
    setPending(provider);
    setError('');
    try {
      setConnections(await action());
      if (done) setToast(done);
    } catch {
      setError('ทำรายการไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      setPending(null);
    }
  };

  if (!user) return null;
  const connected = PROVIDERS.filter(provider => connections[provider.id]);
  const available = PROVIDERS.filter(provider => !connections[provider.id]);

  const confirmConnect = async () => {
    if (!connecting) return;
    const provider = connecting;
    await run(provider.id, () => connectProvider(user.id, provider.id), `เชื่อมต่อ ${provider.name} แล้ว`);
    setConnecting(null);
  };
  const confirmDisconnect = async () => {
    if (!disconnecting) return;
    const provider = disconnecting;
    setDisconnecting(null);
    await run(provider.id, () => disconnectProvider(user.id, provider.id), `ยกเลิกการเชื่อมต่อ ${provider.name} แล้ว`);
  };

  return (
    <div className="settings-page">
      <PageHeader title="เชื่อมต่ออุปกรณ์" description="เชื่อมนาฬิกาหรือแอปวิ่ง วิ่งเสร็จแล้วกิจกรรมจะเข้ามาเอง ไม่ต้องกรอกเวลาเอง" />

      <div className="settings-sections">
        {error && <p className="form-feedback text-error" role="alert">{error}</p>}

        {connected.length > 0 && (
          <section className="grid gap-4" aria-labelledby="devices-connected">
            <h2 id="devices-connected" className="heading-4">เชื่อมต่ออยู่</h2>
            {connected.map(provider => {
              const connection = connections[provider.id] as Connection;
              const busy = pending === provider.id;
              return (
                <ContentCard key={provider.id} className="settings-card">
                  <div className="flex w-full flex-wrap items-center gap-4">
                    <ProviderMark provider={provider} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 font-bold text-neutral-900">
                        {provider.name}
                        <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success"><Check size={12} aria-hidden="true" />เชื่อมต่อแล้ว</span>
                      </p>
                      <p className="text-sm text-neutral-600">ซิงก์ล่าสุด {ago(connection.lastSyncAt)}</p>
                    </div>
                    <Button variant="secondary" className="gap-2" loading={busy} onClick={() => run(provider.id, () => syncProvider(user.id, provider.id), `ซิงก์ ${provider.name} แล้ว`)}>
                      <RefreshCw size={16} className={busy ? 'animate-spin' : ''} aria-hidden="true" /> {busy ? 'กำลังซิงก์…' : 'ซิงก์ตอนนี้'}
                    </Button>
                  </div>

                  <div className="grid w-full gap-4 border-t border-neutral-200 pt-4">
                    <ToggleRow id={`${provider.id}-import`} label="นำการวิ่งเข้า My Level อัตโนมัติ" helper="ใช้คำนวณเลเวลและแผนซ้อม แทนการบันทึกเอง"
                      checked={connection.importRuns} disabled={busy}
                      onChange={checked => run(provider.id, () => updateConnection(user.id, provider.id, { importRuns: checked }))} />
                    <ToggleRow id={`${provider.id}-post`} label="โพสต์ลงฟีดของตี้ที่จอยอยู่" helper="วิ่งตรงเวลาและสถานที่ของตี้ จะขึ้นในฟีดให้เพื่อนในตี้เห็น"
                      checked={connection.postToParty} disabled={busy}
                      onChange={checked => run(provider.id, () => updateConnection(user.id, provider.id, { postToParty: checked }))} />
                  </div>

                  <button type="button" onClick={() => setDisconnecting(provider)} disabled={busy}
                    className="cursor-pointer border-0 bg-transparent p-0 font-[inherit] text-sm font-semibold text-error underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-40">
                    ยกเลิกการเชื่อมต่อ
                  </button>
                </ContentCard>
              );
            })}
          </section>
        )}

        <section className="grid gap-4" aria-labelledby="devices-available">
          <h2 id="devices-available" className="heading-4">{connected.length ? 'เชื่อมต่อเพิ่ม' : 'เลือกอุปกรณ์ที่ใช้'}</h2>
          <ContentCard className="settings-card gap-0! p-0!">
            <ul className="m-0 w-full list-none divide-y divide-neutral-200 p-0">
              {available.map(provider => (
                <li key={provider.id} className="flex items-center gap-4 p-4 md:p-5">
                  <ProviderMark provider={provider} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-neutral-900">{provider.name}</p>
                    <p className="text-sm text-neutral-600">{provider.description}</p>
                  </div>
                  {provider.appOnly ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-neutral-500"><Smartphone size={16} aria-hidden="true" />ใช้ในแอป iPhone</span>
                  ) : (
                    <Button variant="secondary" className="shrink-0" loading={pending === provider.id} onClick={() => setConnecting(provider)}>เชื่อมต่อ</Button>
                  )}
                </li>
              ))}
            </ul>
          </ContentCard>
        </section>

        <p className="flex items-start gap-2 text-sm text-neutral-600">
          <Lock size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          เราอ่านเฉพาะข้อมูลการวิ่ง ไม่โพสต์อะไรแทนคุณบนแอปอื่น และยกเลิกการเชื่อมต่อได้ทุกเมื่อ
        </p>
      </div>

      <Dialog open={Boolean(connecting)} title={`เชื่อมต่อ ${connecting?.name ?? ''}`} onClose={() => pending ? undefined : setConnecting(null)}>
        <div className="flex items-center gap-3">
          {connecting && <ProviderMark provider={connecting} />}
          <Watch size={20} className="text-neutral-400" aria-hidden="true" />
          <span className="grid size-12 place-items-center rounded-lg bg-brand-500 text-xl font-bold text-white" aria-hidden="true">L</span>
        </div>
        <p>เราจะพาไปหน้าของ {connecting?.name} เพื่อให้คุณอนุญาตให้ Lowrox อ่านข้อมูลเหล่านี้</p>
        <ul className="m-0 grid list-none gap-2 p-0">
          {PERMISSIONS.map(item => <li key={item} className="flex items-start gap-2"><Check size={18} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />{item}</li>)}
        </ul>
        <div className="form-actions">
          <Button variant="secondary" onClick={() => setConnecting(null)} disabled={Boolean(pending)} autoFocus>ยกเลิก</Button>
          <Button onClick={confirmConnect} loading={Boolean(pending)}>{pending ? 'กำลังเชื่อมต่อ…' : `ไปที่ ${connecting?.name ?? ''}`}</Button>
        </div>
      </Dialog>

      <Dialog open={Boolean(disconnecting)} title={`ยกเลิกการเชื่อมต่อ ${disconnecting?.name ?? ''}?`} onClose={() => setDisconnecting(null)}>
        <p>การวิ่งใหม่จะไม่เข้ามาอัตโนมัติ ส่วนการวิ่งที่ซิงก์มาแล้วยังอยู่ครบ</p>
        <div className="form-actions">
          <Button variant="secondary" onClick={() => setDisconnecting(null)} autoFocus>ไม่ยกเลิก</Button>
          <Button onClick={confirmDisconnect}>ยกเลิกการเชื่อมต่อ</Button>
        </div>
      </Dialog>

      <Toast message={toast} onDismiss={dismissToast} />
    </div>
  );
}
