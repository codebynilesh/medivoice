import { useEffect, useRef, useState } from 'react';
import { api } from './api.js';
import { useI18n } from './i18n.jsx';
import Background3D from './components/Background3D.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import DocumentWorkspace from './components/DocumentWorkspace.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import About from './components/About.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  const { t } = useI18n();
  const [documentId, setDocumentId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpload, setLastUpload] = useState(null);
  const workspaceRef = useRef(null);

  useEffect(() => {
    if (documentId && workspaceRef.current) {
      workspaceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [documentId]);

  async function handleUpload(file) {
    setBusy(true);
    setError(null);
    setDocumentId(null);
    try {
      const res = await api.uploadDocument(file);
      setLastUpload(res);
      if (res.status === 'REJECTED') {
        setError(t('app.rejected'));
      } else {
        setDocumentId(res.document_id);
      }
    } catch (err) {
      setLastUpload(null);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function scrollToUpload() {
    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      const dz = document.querySelector('.dropzone');
      if (dz) dz.classList.add('pulse');
      setTimeout(() => dz && dz.classList.remove('pulse'), 1200);
    }, 350);
  }

  function resetResult() {
    setDocumentId(null);
    setLastUpload(null);
    setError(null);
  }

  return (
    <div className="app">
      <Background3D />

      <Navbar onUploadClick={scrollToUpload} />

      <main>
        <Hero
          onUpload={handleUpload}
          busy={busy}
          error={error}
          lastUpload={documentId || error ? lastUpload : null}
          onViewResult={() =>
            workspaceRef.current?.scrollIntoView({ behavior: 'smooth' })
          }
        />

        {documentId && (
          <section className="result-screen" ref={workspaceRef}>
            <div className="result-screen-head">
              <div>
                <span className="result-eyebrow">{t('rs.eyebrow')}</span>
                <h2>{t('rs.title')}</h2>
                <p className="result-lead">{t('rs.lead')}</p>
              </div>
            </div>
            <DocumentWorkspace documentId={documentId} onClose={resetResult} />
          </section>
        )}

        <HowItWorks />
        <About />
      </main>

      <Footer />
    </div>
  );
}
