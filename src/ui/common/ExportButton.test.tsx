import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test/render-wrapper';

const mockToPng = vi.fn().mockResolvedValue('data:image/png;base64,fake');
const mockToJpeg = vi.fn().mockResolvedValue('data:image/jpeg;base64,fake');
const mockSave = vi.fn();
const mockAddImage = vi.fn();

vi.mock('html-to-image', () => ({
  toPng: (...args: unknown[]) => mockToPng(...args),
  toJpeg: (...args: unknown[]) => mockToJpeg(...args),
}));

vi.mock('jspdf', () => ({
  default: class MockJsPDF {
    addImage = mockAddImage;
    save = mockSave;
  },
}));

import ExportButton from './ExportButton';

function setupExportContainer() {
  const el = document.createElement('div');
  el.id = 'export-container';
  Object.defineProperty(el, 'scrollWidth', { value: 800 });
  Object.defineProperty(el, 'scrollHeight', { value: 600 });
  document.body.appendChild(el);
  return el;
}

describe('ExportButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToPng.mockResolvedValue('data:image/png;base64,fake');
    mockToJpeg.mockResolvedValue('data:image/jpeg;base64,fake');
  });

  afterEach(() => {
    const existing = document.getElementById('export-container');
    if (existing) existing.remove();
  });

  it('renders export button text', () => {
    renderWithProviders(<ExportButton />);
    expect(screen.getByText('Xuất file')).toBeInTheDocument();
  });

  it('toggles menu on button click', async () => {
    const { user } = renderWithProviders(<ExportButton />);

    await user.click(screen.getByText('Xuất file'));
    expect(screen.getByText('Lưu thành Ảnh (PNG)')).toBeInTheDocument();
    expect(screen.getByText('Lưu thành PDF')).toBeInTheDocument();

    await user.click(screen.getByText('Xuất file'));
    expect(screen.queryByText('Lưu thành Ảnh (PNG)')).not.toBeInTheDocument();
  });

  it('closes menu on click outside', async () => {
    const { user } = renderWithProviders(<ExportButton />);

    await user.click(screen.getByText('Xuất file'));
    expect(screen.getByText('Lưu thành Ảnh (PNG)')).toBeInTheDocument();

    await user.click(document.body);
    await waitFor(() => {
      expect(screen.queryByText('Lưu thành Ảnh (PNG)')).not.toBeInTheDocument();
    });
  });

  it('exports PNG when PNG option is clicked', async () => {
    setupExportContainer();
    const { user } = renderWithProviders(<ExportButton />);

    await user.click(screen.getByText('Xuất file'));
    await user.click(screen.getByText('Lưu thành Ảnh (PNG)'));

    await waitFor(() => {
      expect(mockToPng).toHaveBeenCalled();
    });
  });

  it('exports PDF when PDF option is clicked', async () => {
    setupExportContainer();
    const { user } = renderWithProviders(<ExportButton />);

    await user.click(screen.getByText('Xuất file'));
    await user.click(screen.getByText('Lưu thành PDF'));

    await waitFor(() => {
      expect(mockToJpeg).toHaveBeenCalled();
      expect(mockAddImage).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
    });
  });

  it('shows error when export container is not found', async () => {
    const { user } = renderWithProviders(<ExportButton />);

    await user.click(screen.getByText('Xuất file'));
    await user.click(screen.getByText('Lưu thành Ảnh (PNG)'));

    await waitFor(() => {
      expect(screen.getByText('Đã xảy ra lỗi khi xuất file. Vui lòng thử lại.')).toBeInTheDocument();
    });
  });

  it('dismisses error when close button is clicked', async () => {
    const { user } = renderWithProviders(<ExportButton />);

    await user.click(screen.getByText('Xuất file'));
    await user.click(screen.getByText('Lưu thành Ảnh (PNG)'));

    await waitFor(() => {
      expect(screen.getByText('Đã xảy ra lỗi khi xuất file. Vui lòng thử lại.')).toBeInTheDocument();
    });

    await user.click(screen.getByText('×'));
    expect(screen.queryByText('Đã xảy ra lỗi khi xuất file. Vui lòng thử lại.')).not.toBeInTheDocument();
  });
});
