import { Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  min?: number;
  max?: number;
}

export default function ZoomControls({ scale, onZoomIn, onZoomOut, onResetZoom, min = 0.3, max = 2 }: ZoomControlsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center bg-white/80 backdrop-blur-md shadow-sm border border-stone-200/60 rounded-full overflow-hidden h-10">
      <button
        type="button"
        onClick={onZoomOut}
        className="px-3 h-full hover:bg-stone-100/50 text-stone-600 transition-colors disabled:opacity-50"
        title={t('tree.zoomOut')}
        disabled={scale <= min}
      >
        <Minus className="size-4" />
      </button>
      <button
        type="button"
        onClick={onResetZoom}
        className="px-2 h-full hover:bg-stone-100/50 text-stone-600 transition-colors text-xs font-medium min-w-12.5 text-center border-x border-stone-200/50"
        title={t('tree.zoomReset')}
      >
        {Math.round(scale * 100)}%
      </button>
      <button
        type="button"
        onClick={onZoomIn}
        className="px-3 h-full hover:bg-stone-100/50 text-stone-600 transition-colors disabled:opacity-50"
        title={t('tree.zoomIn')}
        disabled={scale >= max}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
