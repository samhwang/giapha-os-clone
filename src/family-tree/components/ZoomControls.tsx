import { Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cardVariants } from '../../ui/common/Card';
import { cn } from '../../ui/utils/cn';

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
    <div className={cn(cardVariants({ variant: 'elevated' }), 'flex h-10 items-center rounded-full')}>
      <button
        type="button"
        onClick={onZoomOut}
        className="h-full px-3 text-stone-600 transition-colors hover:bg-stone-100/50 disabled:opacity-50"
        title={t('tree.zoomOut')}
        disabled={scale <= min}
      >
        <Minus className="size-4" />
      </button>
      <button
        type="button"
        onClick={onResetZoom}
        className="h-full min-w-12.5 border-x border-stone-200/50 px-2 text-center text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100/50"
        title={t('tree.zoomReset')}
      >
        {Math.round(scale * 100)}%
      </button>
      <button
        type="button"
        onClick={onZoomIn}
        className="h-full px-3 text-stone-600 transition-colors hover:bg-stone-100/50 disabled:opacity-50"
        title={t('tree.zoomIn')}
        disabled={scale >= max}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
