import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { t } from '../../../test/i18n';
import { queryWrapper as wrapper } from '../../../test/render-wrapper';
import DataImportExport from './DataImportExport';

function createJsonFile(data: unknown, name = 'backup.json') {
  const content = JSON.stringify(data);
  const file = new File([content], name, { type: 'application/json' });
  file.text = () => Promise.resolve(content);
  return file;
}

const mockExportData = vi.fn();
const mockImportData = vi.fn();

vi.mock('../server/data', () => ({
  exportData: (...args: unknown[]) => mockExportData(...args),
  importData: (...args: unknown[]) => mockImportData(...args),
}));

describe('DataImportExport', () => {
  beforeEach(() => {
    mockExportData.mockReset().mockResolvedValue({ persons: [], relationships: [] });
    mockImportData.mockReset().mockResolvedValue({ imported: { persons: 0, relationships: 0 } });
  });

  it('renders export section with backup title', () => {
    render(<DataImportExport />, { wrapper });
    expect(screen.getByText(new RegExp(t('data.backupTitle'), 'i'))).toBeInTheDocument();
  });

  it('renders import section with restore title', () => {
    render(<DataImportExport />, { wrapper });
    expect(screen.getByText(new RegExp(t('data.restoreTitle'), 'i'))).toBeInTheDocument();
  });

  it('renders download backup button', () => {
    render(<DataImportExport />, { wrapper });
    expect(screen.getByText(new RegExp(t('data.downloadBackup'), 'i'))).toBeInTheDocument();
  });

  it('renders select file button', () => {
    render(<DataImportExport />, { wrapper });
    expect(screen.getByText(new RegExp(t('data.selectFile').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))).toBeInTheDocument();
  });

  it('shows restore warning text', () => {
    render(<DataImportExport />, { wrapper });
    expect(screen.getByText(/xoá toàn bộ/i)).toBeInTheDocument();
  });

  it('export calls exportData and triggers download', async () => {
    const createObjectURLSpy = vi.fn(() => 'blob:mock-url');
    const revokeObjectURLSpy = vi.fn();
    globalThis.URL.createObjectURL = createObjectURLSpy;
    globalThis.URL.revokeObjectURL = revokeObjectURLSpy;

    const user = userEvent.setup();
    render(<DataImportExport />, { wrapper });
    await user.click(screen.getByText(new RegExp(t('data.downloadBackup'), 'i')));

    await waitFor(() => {
      expect(mockExportData).toHaveBeenCalled();
    });
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalled();
  });

  it('import: valid JSON file opens confirm modal', async () => {
    const { container } = render(<DataImportExport />, { wrapper });
    const file = createJsonFile({ persons: [], relationships: [] });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(new RegExp(t('data.confirmTitle'), 'i'))).toBeInTheDocument();
    });
    expect(screen.getByText('backup.json')).toBeInTheDocument();
  });

  it('import: confirm calls importData', async () => {
    mockImportData.mockResolvedValue({ imported: { persons: 5, relationships: 10 } });
    const user = userEvent.setup();
    const { container } = render(<DataImportExport />, { wrapper });
    const file = createJsonFile({ persons: [1, 2, 3], relationships: [4, 5] });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(new RegExp(t('data.confirmTitle'), 'i'))).toBeInTheDocument();
    });

    await user.click(screen.getByText(new RegExp(t('data.confirmProceed'), 'i')));

    await waitFor(() => {
      expect(mockImportData).toHaveBeenCalledWith({
        data: expect.objectContaining({ persons: [1, 2, 3], relationships: [4, 5] }),
      });
    });
  });

  it('import: shows success message', async () => {
    mockImportData.mockResolvedValue({ imported: { persons: 5, relationships: 10 } });
    const user = userEvent.setup();
    const { container } = render(<DataImportExport />, { wrapper });
    const file = createJsonFile({ persons: [1], relationships: [2] });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(new RegExp(t('data.confirmTitle'), 'i'))).toBeInTheDocument();
    });
    await user.click(screen.getByText(new RegExp(t('data.confirmProceed'), 'i')));

    await waitFor(() => {
      expect(screen.getByText(/phục hồi thành công/i)).toBeInTheDocument();
    });
  });

  it('import: shows error for invalid structure', async () => {
    const user = userEvent.setup();
    const { container } = render(<DataImportExport />, { wrapper });
    const file = createJsonFile({ foo: 'bar' }, 'bad.json');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(new RegExp(t('data.confirmTitle'), 'i'))).toBeInTheDocument();
    });
    await user.click(screen.getByText(new RegExp(t('data.confirmProceed'), 'i')));

    await waitFor(() => {
      expect(
        screen.getByText(
          new RegExp(
            t('data.invalidStructure')
              .slice(0, 20)
              .replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            'i'
          )
        )
      ).toBeInTheDocument();
    });
    expect(mockImportData).not.toHaveBeenCalled();
  });

  it('import: cancel closes modal', async () => {
    const user = userEvent.setup();
    const { container } = render(<DataImportExport />, { wrapper });
    const file = createJsonFile({ persons: [], relationships: [] });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(new RegExp(t('data.confirmTitle'), 'i'))).toBeInTheDocument();
    });

    await user.click(screen.getByText(new RegExp(t('data.confirmCancel'), 'i')));

    await waitFor(() => {
      expect(screen.queryByText(new RegExp(t('data.confirmTitle'), 'i'))).not.toBeInTheDocument();
    });
    expect(mockImportData).not.toHaveBeenCalled();
  });
});
