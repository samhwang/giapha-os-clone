import { AnimatePresence, motion } from 'framer-motion';
import { toJpeg, toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Download, FileImage, FileText, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';
import { button } from '../../../styled-system/recipes';

export default function ExportButton() {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
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
      console.error('Export error:', error);
      alert(t('export.exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={css({ position: 'relative' })} ref={menuRef}>
      <button type="button" onClick={() => setShowMenu(!showMenu)} disabled={isExporting} className={button({ visual: 'outline' })}>
        {isExporting ? (
          <Loader2 className={css({ width: '4', height: '4', flexShrink: 0, animation: 'spin 1s linear infinite' })} />
        ) : (
          <Download className={css({ width: '4', height: '4', flexShrink: 0 })} />
        )}
        <span className={css({ letterSpacing: '0.025em', minWidth: 'max-content' })}>{isExporting ? t('export.exporting') : t('export.exportFile')}</span>
      </button>

      <AnimatePresence>
        {showMenu && !isExporting && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={css({
              position: 'absolute',
              top: '100%',
              right: 0,
              sm: { right: 'auto', left: 0 },
              marginTop: '2',
              width: '48',
              backgroundColor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(24px)',
              borderRadius: '2xl',
              boxShadow: 'xl',
              border: '1px solid rgba(28,25,23,0.06)',
              paddingY: '2',
              zIndex: '50',
              overflow: 'hidden',
            })}
          >
            <button
              type="button"
              onClick={() => handleExport('png')}
              className={css({
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '3',
                paddingX: '4',
                paddingY: '2.5',
                fontSize: 'sm',
                fontWeight: '500',
                color: 'stone.700',
                transition: 'all 0.2s',
                textAlign: 'left',
                _hover: { color: 'amber.700', backgroundColor: 'amber.50' },
              })}
            >
              <FileImage className={css({ width: '4', height: '4' })} />
              {t('export.saveAsPng')}
            </button>
            <button
              type="button"
              onClick={() => handleExport('pdf')}
              className={css({
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '3',
                paddingX: '4',
                paddingY: '2.5',
                fontSize: 'sm',
                fontWeight: '500',
                color: 'stone.700',
                transition: 'all 0.2s',
                textAlign: 'left',
                _hover: { color: 'amber.700', backgroundColor: 'amber.50' },
              })}
            >
              <FileText className={css({ width: '4', height: '4' })} />
              {t('export.saveAsPdf')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
