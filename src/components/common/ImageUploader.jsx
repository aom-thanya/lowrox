import React, { useEffect, useId, useRef, useState } from 'react';
import Avatar from './Avatar';
import Button from './Button';
import Dialog from './Dialog';
import { cropBounds, validateImageFile } from '../../utils/imageUpload';

export default function ImageUploader({ value, onChange, disabled, onPendingChange }) {
  const inputId = useId();
  const input = useRef(null);
  const canvas = useRef(null);
  const selection = useRef(0);
  const [source, setSource] = useState(null);
  const [error, setError] = useState('');
  const [decoding, setDecoding] = useState(false);
  const [crop, setCrop] = useState({ zoom: 1, x: 50, y: 50 });

  useEffect(() => () => { selection.current += 1; }, []);
  useEffect(() => { onPendingChange?.(Boolean(source) || decoding); }, [source, decoding, onPendingChange]);
  useEffect(() => {
    if (!source || !canvas.current) return;
    const context = canvas.current.getContext('2d');
    const { sx, sy, side } = cropBounds(source.naturalWidth, source.naturalHeight, crop.zoom, crop.x, crop.y);
    context.clearRect(0, 0, 512, 512);
    context.drawImage(source, sx, sy, side, side, 0, 0, 512, 512);
  }, [source, crop]);

  const selectFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const attempt = ++selection.current;
    const validation = validateImageFile(file);
    if (validation) { setError(validation); return; }
    setError('');
    setDecoding(true);
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      if (attempt !== selection.current) return;
      if (!image.naturalWidth || !image.naturalHeight) throw new Error('Invalid image');
      setCrop({ zoom: 1, x: 50, y: 50 });
      setSource(image);
    } catch {
      if (attempt === selection.current) setError('อ่านรูปไม่สำเร็จ กรุณาเลือกไฟล์รูปภาพใหม่');
    } finally {
      URL.revokeObjectURL(url);
      if (attempt === selection.current) setDecoding(false);
    }
  };
  const applyCrop = () => {
    try {
      const data = canvas.current.toDataURL('image/webp', 0.9);
      if (!data.startsWith('data:image/')) throw new Error('Crop failed');
      onChange(data);
      setSource(null);
    } catch { setError('เตรียมรูปไม่สำเร็จ กรุณาลองอีกครั้ง'); setSource(null); }
  };
  return <div className="image-uploader">
    <div className="avatar-controls">
      <Avatar src={value} size="large" />
      <div className="upload-details">
        <div className="form-actions form-actions-start">
          <Button variant="secondary" disabled={disabled || decoding} onClick={() => input.current.click()}>เปลี่ยนรูป</Button>
          <Button variant="secondary" disabled={disabled || decoding || !value} onClick={() => { setError(''); onChange(''); }}>ลบรูป</Button>
        </div>
        <p className="field-helper" id={`${inputId}-help`}>JPG, PNG หรือ WebP ขนาดไม่เกิน 5 MB</p>
        {decoding && <p role="status">กำลังเตรียมรูป…</p>}
      </div>
    </div>
    <input ref={input} id={inputId} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp"
      tabIndex={-1} aria-label="เลือกรูปโปรไฟล์" aria-describedby={`${inputId}-help ${inputId}-error`} disabled={disabled || decoding} onChange={selectFile} />
    <p id={`${inputId}-error`} className="field-error" role="alert">{error}</p>
    <Dialog open={Boolean(source)} title="ปรับรูปโปรไฟล์" onClose={() => setSource(null)}>
      <p className="field-helper">ครอปรูปสัดส่วน 1:1 แล้วปรับตำแหน่งให้พอดีวงกลม</p>
      <canvas ref={canvas} width={512} height={512} className="crop-preview" role="img" aria-label="ตัวอย่างรูปโปรไฟล์หลังครอป" />
      {[{ key: 'zoom', label: 'ขยายรูป', min: 1, max: 3, step: 0.01 }, { key: 'x', label: 'ตำแหน่งแนวนอน', min: 0, max: 100, step: 1 }, { key: 'y', label: 'ตำแหน่งแนวตั้ง', min: 0, max: 100, step: 1 }].map(({ key, label, ...range }) => (
        <label className="crop-control" key={key}>{label}<input type="range" {...range} value={crop[key]} onChange={(event) => setCrop((current) => ({ ...current, [key]: Number(event.target.value) }))} /></label>
      ))}
      <div className="form-actions"><Button variant="secondary" onClick={() => setSource(null)}>ยกเลิก</Button><Button onClick={applyCrop}>ใช้รูปนี้</Button></div>
    </Dialog>
  </div>;
}
