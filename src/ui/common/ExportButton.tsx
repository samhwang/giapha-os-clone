import { toJpeg, toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Download, FileImage, FileText, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { logger } from '../../lib/logger';
import { Button } from './Button';

export default function ExportButton() {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: 'png' | 'pdf') => {
    try {
      setIsExporting(true);
      setShowMenu(false);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const element = document.getElementById('export-container');
      if (!element) throw new Error('No export container found');

      const exportOptions = {
        cacheBust: true,
        backgroundColor: '#f5f5f4',
        pixelRatio: 2,
        width: element.scrollWidth,
        height: element.scrollHeight,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          width: `${element.scrollWidth}px`,
          height: `${element.scrollHeight}px`,
        },
      };

      if (format === 'png') {
        const url = await toPng(element, exportOptions);
        const a = document.createElement('a');
        a.href = url;
        a.download = `giapha-sodo-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else if (format === 'pdf') {
        const imgData = await toJpeg(element, { ...exportOptions, quality: 0.95 });
        const width = element.scrollWidth;
        const height = element.scrollHeight;
        const pdf = new jsPDF({
          orientation: width > height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [width, height],
        });
        pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
        pdf.save(`giapha-sodo-${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } catch (error) {
      logger.error('Export error:', error);
      setExportError(t('export.exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button onClick={() => setShowMenu(!showMenu)} disabled={isExporting}>
        {isExporting ? <Loader2 className="size-4 shrink-0 animate-spin" /> : <Download className="size-4 shrink-0" />}
        <span className="hidden sm:inline tracking-wide min-w-max">{isExporting ? t('export.exporting') : t('export.exportFile')}</span>
      </Button>

      {exportError && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg p-3 shadow-lg z-50 flex items-center justify-between gap-2">
          <p>{exportError}</p>
          <button type="button" onClick={() => setExportError(null)} className="text-red-500 hover:text-red-700 font-bold shrink-0">
            ×
          </button>
        </div>
      )}

      {showMenu && !isExporting && (
        <div className="absolute top-full right-0 sm:right-auto sm:left-0 mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-border-default py-2 z-50 overflow-hidden animate-[scale-in_0.15s_ease-out_forwards]">
          <button
            type="button"
            onClick={() => handleExport('png')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-stone-700 hover:text-amber-700 hover:bg-amber-50 transition-colors text-left"
          >
            <FileImage className="size-4" />
            {t('export.saveAsPng')}
          </button>
          <button
            type="button"
            onClick={() => handleExport('pdf')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-stone-700 hover:text-amber-700 hover:bg-amber-50 transition-colors text-left"
          >
            <FileText className="size-4" />
            {t('export.saveAsPdf')}
          </button>
        </div>
      )}
    </div>
  );
}
