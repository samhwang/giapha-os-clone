import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Download, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { exportData, importData } from '@/server/functions/data';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        setImportStatus({ type: 'error', message: t('data.invalidJson') });
        return;
      }
      setSelectedFile(file);
      setShowConfirm(true);
      setImportStatus(null);
    }
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white/80 backdrop-blur-md border border-stone-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none group-hover:bg-amber-300/30 transition-colors" />
          <div className="flex items-start gap-4 mb-4 relative z-10">
            <div className="p-3 bg-stone-100 rounded-xl text-stone-600">
              <Download className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-800">{t('data.backupTitle')}</h3>
              <p className="text-sm text-stone-500 mt-1">{t('data.backupDesc')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 text-sm shadow-sm"
          >
            {isExporting ? t('data.downloading') : t('data.downloadBackup')}
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white/80 backdrop-blur-md border border-stone-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/20 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none group-hover:bg-rose-300/30 transition-colors" />
          <div className="flex items-start gap-4 mb-4 relative z-10">
            <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
              <Upload className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-800">{t('data.restoreTitle')}</h3>
              <p className="text-sm text-stone-500 mt-1">
                {t('data.restoreDesc')}
                <span className="font-semibold text-rose-600 ml-1">{t('data.restoreWarning')}</span>
              </p>
            </div>
          </div>
          <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition-colors disabled:opacity-50 text-sm"
          >
            {isImporting ? t('data.restoring') : t('data.selectJsonFile')}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm cursor-pointer"
              onClick={() => setShowConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl border border-stone-200/60 p-6 w-full max-w-md relative z-10"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="p-3 bg-rose-100/50 rounded-full text-rose-600 shrink-0 mt-1">
                  <AlertTriangle className="size-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-800">{t('data.confirmTitle')}</h3>
                  <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                    {t('data.confirmMessage')} <span className="font-mono text-xs bg-stone-100 px-1 rounded">{selectedFile?.name}</span>.
                  </p>
                  <p className="text-sm text-rose-600 font-semibold mt-2">{t('data.confirmWarning')}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={isImporting}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                >
                  {t('data.confirmCancel')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={isImporting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  {isImporting ? t('data.confirmRestoring') : t('data.confirmProceed')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Status messages */}
      <AnimatePresence>
        {importStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl flex items-center gap-3 border ${
              importStatus.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {importStatus.type === 'success' ? <CheckCircle2 className="size-5 shrink-0" /> : <AlertTriangle className="size-5 shrink-0" />}
            <p className="text-sm font-medium">{importStatus.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
