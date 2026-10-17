import { useRef, useState } from 'react';
import { useI18n } from '../i18n.jsx';

const ACCEPTED = '.pdf,.png,.jpg,.jpeg';
const MAX_BYTES = 25 * 1024 * 1024;

export default function UploadPanel({ onUpload, busy, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState(null);
  const { t } = useI18n();

  function validate(file) {
    const okType = /\.(pdf|png|jpe?g)$/i.test(file.name);
    if (!okType) {
      return t('upload.errType');
    }
    if (file.size > MAX_BYTES) {
      return t('upload.errSize');
    }
    return null;
  }

  function handleFile(file) {
    if (!file) return;
    const problem = validate(file);
    if (problem) {
      setLocalError(problem);
      return;
    }
    setLocalError(null);
    onUpload(file);
  }

  const shownError = localError || error;

  return (
    <div className="upload-panel">
      <div
        className={`dropzone ${dragging ? 'dragging' : ''} ${busy ? 'busy' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files && e.dataTransfer.files[0]);
        }}
        onClick={() => !busy && inputRef.current && inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          hidden
          disabled={busy}
          onChange={(e) => {
            handleFile(e.target.files && e.target.files[0]);
            e.target.value = '';
          }}
        />
        <div className="dropzone-icon">⤴</div>
        <p className="dropzone-title">
          {busy ? t('upload.processing') : t('upload.dropTitle')}
        </p>
        <p className="dropzone-sub">
          {busy ? t('upload.busySub') : t('upload.dropSub')}
        </p>
      </div>
      {shownError && <div className="alert alert-error">{shownError}</div>}
    </div>
  );
}
