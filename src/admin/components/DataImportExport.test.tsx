import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DataImportExport from './DataImportExport';

vi.mock('../server/data', () => ({
  exportData: vi.fn(() => Promise.resolve({ persons: [], relationships: [] })),
  importData: vi.fn(() => Promise.resolve({ imported: { persons: 0, relationships: 0 } })),
}));

describe('DataImportExport', () => {
  it('renders export section with backup title', () => {
    render(<DataImportExport />);
    expect(screen.getByText(/sao lưu dữ liệu/i)).toBeInTheDocument();
  });

  it('renders import section with restore title', () => {
    render(<DataImportExport />);
    expect(screen.getByText(/phục hồi dữ liệu/i)).toBeInTheDocument();
  });

  it('renders download backup button', () => {
    render(<DataImportExport />);
    expect(screen.getByText(/tải xuống bản sao lưu/i)).toBeInTheDocument();
  });

  it('renders select JSON file button', () => {
    render(<DataImportExport />);
    expect(screen.getByText(/chọn file json/i)).toBeInTheDocument();
  });

  it('shows restore warning text', () => {
    render(<DataImportExport />);
    expect(screen.getByText(/xoá toàn bộ/i)).toBeInTheDocument();
  });
});
