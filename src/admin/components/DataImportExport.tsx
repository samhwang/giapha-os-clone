import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Download, Upload } from 'lucide-react';
import { type ChangeEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui/common/Button';
import { Card } from '../../ui/common/Card';
import { Modal, ModalPanel } from '../../ui/common/Modal';
import { cn } from '../../ui/utils/cn';
import { exportData, importData } from '../server/data';
import { exportToCsvZip, parseCsvZip } from '../utils/csv';
import { exportToGedcom, parseGedcom } from '../utils/gedcom';

type ExportFormat = 'json' | 'gedcom' | 'csv';

export default function DataImportExport() {
  const { t } = useTranslation();
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportMutation = useMutation({
    mutationFn: async (format: ExportFormat) => {
      const data = await exportData();
      const dateSuffix = new Date().toISOString().split('T')[0];

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `giapha-export-${dateSuffix}.json`);
      } else if (format === 'gedcom') {
        const gedcomStr = exportToGedcom({ persons: data.persons, relationships: data.relationships });
        const blob = new Blob([gedcomStr], { type: 'text/plain' });
        downloadBlob(blob, `giapha-export-${dateSuffix}.ged`);
      } else if (format === 'csv') {
        const zipBlob = await exportToCsvZip({ persons: data.persons, relationships: data.relationships });
        downloadBlob(zipBlob, `giapha-export-${dateSuffix}.zip`);
      }
    },
    onError: (error: unknown) => {
      setImportStatus({ type: 'error', message: error instanceof Error ? error.message : t('data.downloadError') });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const name = file.name.toLowerCase();
      let persons: unknown[];
      let relationships: unknown[];

      if (name.endsWith('.ged')) {
        const text = await file.text();
        const parsed = parseGedcom(text);
        persons = parsed.persons;
        relationships = parsed.relationships;
      } else if (name.endsWith('.zip')) {
        const parsed = await parseCsvZip(file);
        persons = parsed.persons;
        relationships = parsed.relationships;
      } else {
        const fileText = await file.text();
        const payload = JSON.parse(fileText);
        if (!payload.persons || !payload.relationships) {
          throw new Error(t('data.invalidStructure'));
        }
        persons = payload.persons;
        relationships = payload.relationships;
      }

      return importData({
        data: {
          persons: persons as Parameters<typeof importData>[0]['data']['persons'],
          relationships: relationships as Parameters<typeof importData>[0]['data']['relationships'],
        },
      });
    },
    onSuccess: (result) => {
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
    },
    onError: (error: unknown) => {
      setImportStatus({
        type: 'error',
        message: error instanceof Error ? error.message : t('data.restoreError'),
      });
      setShowConfirm(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
  });

  const isExporting = exportMutation.isPending;
  const isImporting = importMutation.isPending;

  const handleExport = () => {
    exportMutation.mutate(exportFormat);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    const isValid = name.endsWith('.json') || name.endsWith('.ged') || name.endsWith('.zip');
    if (!isValid) {
      setImportStatus({ type: 'error', message: t('data.invalidFileType') });
      return;
    }
    setSelectedFile(file);
    setShowConfirm(true);
    setImportStatus(null);
  };

  const handleConfirmImport = () => {
    if (!selectedFile) return;
    importMutation.mutate(selectedFile);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <Card variant="elevated" className="p-6 hover:shadow-md relative overflow-hidden group">
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
          <div className="flex gap-2 mb-3">
            {(['json', 'gedcom', 'csv'] as const).map((fmt) => (
              <button
                type="button"
                key={fmt}
                onClick={() => setExportFormat(fmt)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                  exportFormat === fmt ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                )}
              >
                {fmt === 'json' ? 'JSON' : fmt === 'gedcom' ? 'GEDCOM' : 'CSV (ZIP)'}
              </button>
            ))}
          </div>
          <Button variant="primary" onClick={handleExport} disabled={isExporting} className="w-full rounded-xl">
            {isExporting ? t('data.downloading') : t('data.downloadBackup')}
          </Button>
        </Card>

        {/* Import Card */}
        <Card variant="elevated" className="p-6 hover:shadow-md relative overflow-hidden group">
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
          <p className="text-xs text-stone-400 mb-3">{t('data.supportedFormats')}</p>
          <input type="file" accept=".json,.ged,.zip" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          <Button
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700"
          >
            {isImporting ? t('data.restoring') : t('data.selectFile')}
          </Button>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)}>
        <ModalPanel maxWidth="md" className="p-6 rounded-2xl">
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
            <Button variant="ghost" size="sm" onClick={() => setShowConfirm(false)} disabled={isImporting}>
              {t('data.confirmCancel')}
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmImport} disabled={isImporting}>
              {isImporting ? t('data.confirmRestoring') : t('data.confirmProceed')}
            </Button>
          </div>
        </ModalPanel>
      </Modal>

      {/* Status messages */}
      {importStatus && (
        <div
          className={cn(
            'p-4 rounded-xl flex items-center gap-3 border animate-[fade-in-up_0.3s_ease-out_forwards]',
            importStatus.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          )}
        >
          {importStatus.type === 'success' ? <CheckCircle2 className="size-5 shrink-0" /> : <AlertTriangle className="size-5 shrink-0" />}
          <p className="text-sm font-medium">{importStatus.message}</p>
        </div>
      )}
    </div>
  );
}
