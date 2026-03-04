import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Download, Upload } from 'lucide-react';
import { type ChangeEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';
import { exportData, importData } from '../server/data';

export default function DataImportExport() {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await exportData();

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `giapha-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : t('data.downloadError'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isInvalidJsonFile = file.type !== 'application/json' && !file.name.endsWith('.json');
    if (isInvalidJsonFile) {
      setImportStatus({ type: 'error', message: t('data.invalidJson') });
      return;
    }
    setSelectedFile(file);
    setShowConfirm(true);
    setImportStatus(null);
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) return;

    try {
      setIsImporting(true);
      setImportStatus(null);

      const fileText = await selectedFile.text();
      const payload = JSON.parse(fileText);

      if (!payload.persons || !payload.relationships) {
        throw new Error(t('data.invalidStructure'));
      }

      const result = await importData({
        data: {
          persons: payload.persons,
          relationships: payload.relationships,
        },
      });

      setImportStatus({
        type: 'success',
        message: t('data.restoreSuccess', {
          persons: result.imported.persons,
          relationships: result.imported.relationships,
        }),
      });
      setShowConfirm(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: unknown) {
      setImportStatus({
        type: 'error',
        message: error instanceof Error ? error.message : t('data.restoreError'),
      });
      setShowConfirm(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsImporting(false);
    }
  };

  const statusStyles =
    importStatus?.type === 'success'
      ? { backgroundColor: 'emerald.50', borderColor: 'rgb(34 197 94 / 0.3)', color: 'emerald.800' }
      : { backgroundColor: 'rose.50', borderColor: 'rgb(244 63 94 / 0.3)', color: 'rose.800' };

  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
      <div className={css({ display: 'grid', gridTemplateColumns: { base: '1', md: '2' }, gap: '6' })}>
        <div
          className={css({
            backgroundColor: 'rgb(255 255 255 / 0.8)',
            backdropFilter: 'blur(12px)',
            borderWidth: '1px',
            borderColor: 'rgb(228 228 231 / 0.6)',
            borderRadius: '2xl',
            padding: '6',
            boxShadow: 'sm',
            _hover: { boxShadow: 'md' },
            transition: 'box-shadow 0.2s',
            position: 'relative',
            overflow: 'hidden',
          })}
        >
          <div
            className={css({
              position: 'absolute',
              top: 0,
              right: 0,
              width: '32',
              height: '32',
              borderRadius: 'full',
              backgroundColor: 'rgb(251 191 36 / 0.2)',
              blur: '3xl',
              marginRight: '-4rem',
              marginTop: '-4rem',
              pointerEvents: 'none',
            })}
          />
          <div className={css({ display: 'flex', alignItems: 'flex-start', gap: '4', marginBottom: '4', position: 'relative', zIndex: 10 })}>
            <div className={css({ padding: '3', backgroundColor: 'stone.100', borderRadius: 'xl', color: 'stone.600' })}>
              <Download className={css({ width: '6', height: '6' })} />
            </div>
            <div>
              <h3 className={css({ fontSize: 'lg', fontWeight: 'bold', color: 'stone.800' })}>{t('data.backupTitle')}</h3>
              <p className={css({ fontSize: 'sm', color: 'stone.500', marginTop: '1' })}>{t('data.backupDesc')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className={css(
              {
                width: '100%',
                display: 'inlineFlex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2',
                paddingX: '5',
                paddingY: '2.5',
                backgroundColor: 'amber.600',
                color: 'white',
                fontWeight: 'semibold',
                borderRadius: 'xl',
                transition: 'colors 0.2s',
                _disabled: { opacity: 0.5 },
                fontSize: 'sm',
                boxShadow: 'sm',
              },
              { _hover: { backgroundColor: 'amber.700' } }
            )}
          >
            {isExporting ? t('data.downloading') : t('data.downloadBackup')}
          </button>
        </div>

        <div
          className={css({
            backgroundColor: 'rgb(255 255 255 / 0.8)',
            backdropFilter: 'blur(12px)',
            borderWidth: '1px',
            borderColor: 'rgb(228 228 231 / 0.6)',
            borderRadius: '2xl',
            padding: '6',
            boxShadow: 'sm',
            _hover: { boxShadow: 'md' },
            transition: 'box-shadow 0.2s',
            position: 'relative',
            overflow: 'hidden',
          })}
        >
          <div
            className={css({
              position: 'absolute',
              top: 0,
              right: 0,
              width: '32',
              height: '32',
              borderRadius: 'full',
              backgroundColor: 'rgb(244 114 182 / 0.2)',
              blur: '3xl',
              marginRight: '-4rem',
              marginTop: '-4rem',
              pointerEvents: 'none',
            })}
          />
          <div className={css({ display: 'flex', alignItems: 'flex-start', gap: '4', marginBottom: '4', position: 'relative', zIndex: 10 })}>
            <div className={css({ padding: '3', backgroundColor: 'rose.50', borderRadius: 'xl', color: 'rose.600' })}>
              <Upload className={css({ width: '6', height: '6' })} />
            </div>
            <div>
              <h3 className={css({ fontSize: 'lg', fontWeight: 'bold', color: 'stone.800' })}>{t('data.restoreTitle')}</h3>
              <p className={css({ fontSize: 'sm', color: 'stone.500', marginTop: '1' })}>
                {t('data.restoreDesc')}
                <span className={css({ fontWeight: 'semibold', color: 'rose.600', marginLeft: '1' })}>{t('data.restoreWarning')}</span>
              </p>
            </div>
          </div>
          <input type="file" accept=".json" className={css({ display: 'none' })} ref={fileInputRef} onChange={handleFileChange} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className={css(
              {
                width: '100%',
                display: 'inlineFlex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2',
                paddingX: '5',
                paddingY: '2.5',
                backgroundColor: 'stone.100',
                color: 'stone.700',
                fontWeight: 'semibold',
                borderRadius: 'xl',
                transition: 'colors 0.2s',
                _disabled: { opacity: 0.5 },
                fontSize: 'sm',
              },
              { _hover: { backgroundColor: 'stone.200' } }
            )}
          >
            {isImporting ? t('data.restoring') : t('data.selectJsonFile')}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <div className={css({ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4' })}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={css({ position: 'absolute', inset: 0, backgroundColor: 'rgb(28 25 23 / 0.4)', backdropFilter: 'blur(4px)', cursor: 'pointer' })}
              onClick={() => setShowConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={css({
                backgroundColor: 'white',
                borderRadius: '2xl',
                boxShadow: 'xl',
                borderWidth: '1px',
                borderColor: 'rgb(228 228 231 / 0.6)',
                padding: '6',
                width: '100%',
                maxWidth: '28rem',
                position: 'relative',
                zIndex: 10,
              })}
            >
              <div className={css({ display: 'flex', alignItems: 'flex-start', gap: '4', marginBottom: '5' })}>
                <div
                  className={css({
                    padding: '3',
                    backgroundColor: 'rgb(254 242 242 / 0.5)',
                    borderRadius: 'full',
                    color: 'rose.600',
                    marginTop: '1',
                    flexShrink: 0,
                  })}
                >
                  <AlertTriangle className={css({ width: '6', height: '6' })} />
                </div>
                <div>
                  <h3 className={css({ fontSize: 'lg', fontWeight: 'bold', color: 'stone.800' })}>{t('data.confirmTitle')}</h3>
                  <p className={css({ fontSize: 'sm', color: 'stone.600', marginTop: '2', lineHeight: 'relaxed' })}>
                    {t('data.confirmMessage')}{' '}
                    <code className={css({ fontFamily: 'mono', fontSize: 'xs', backgroundColor: 'stone.100', paddingX: '1', borderRadius: 'sm' })}>
                      {selectedFile?.name}
                    </code>
                    .
                  </p>
                  <p className={css({ fontSize: 'sm', color: 'rose.600', fontWeight: 'semibold', marginTop: '2' })}>{t('data.confirmWarning')}</p>
                </div>
              </div>
              <div className={css({ display: 'flex', justifyContent: 'flex-end', gap: '3', marginTop: '6' })}>
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={isImporting}
                  className={css({
                    paddingX: '4',
                    paddingY: '2',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    color: 'stone.600',
                    _hover: { color: 'stone.900', backgroundColor: 'stone.200' },
                    borderRadius: 'xl',
                    transition: 'colors 0.2s',
                  })}
                >
                  {t('data.confirmCancel')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={isImporting}
                  className={css({
                    paddingX: '4',
                    paddingY: '2',
                    fontSize: 'sm',
                    fontWeight: 'semibold',
                    color: 'white',
                    backgroundColor: 'rose.600',
                    _hover: { backgroundColor: 'rose.700' },
                    borderRadius: 'xl',
                    transition: 'colors 0.2s',
                    boxShadow: 'sm',
                    opacity: isImporting ? 0.5 : 1,
                  })}
                >
                  {isImporting ? t('data.confirmRestoring') : t('data.confirmProceed')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {importStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={css({ padding: '4', borderRadius: 'xl', display: 'flex', alignItems: 'center', gap: '3', borderWidth: '1px' }, statusStyles)}
          >
            {importStatus.type === 'success' ? (
              <CheckCircle2 className={css({ width: '5', height: '5', flexShrink: 0 })} />
            ) : (
              <AlertTriangle className={css({ width: '5', height: '5', flexShrink: 0 })} />
            )}
            <p className={css({ fontSize: 'sm', fontWeight: 'medium' })}>{importStatus.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
