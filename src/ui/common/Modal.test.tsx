import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Modal, ModalCloseButton, ModalPanel } from './Modal';

describe('Modal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false}>
        <div>Content</div>
      </Modal>
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders children when isOpen is true', () => {
    render(
      <Modal isOpen>
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('locks body scroll when open', () => {
    const { unmount } = render(
      <Modal isOpen>
        <div>Content</div>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('unset');
  });

  it('renders backdrop button when onClose is provided', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose}>
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByLabelText('Close overlay')).toBeInTheDocument();
  });

  it('does not render backdrop button when onClose is not provided', () => {
    render(
      <Modal isOpen>
        <div>Content</div>
      </Modal>
    );
    expect(screen.queryByLabelText('Close overlay')).not.toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose}>
        <div>Content</div>
      </Modal>
    );
    await user.click(screen.getByLabelText('Close overlay'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('ModalPanel', () => {
  it('renders children', () => {
    render(<ModalPanel>Panel content</ModalPanel>);
    expect(screen.getByText('Panel content')).toBeInTheDocument();
  });

  it('applies 4xl max-width by default', () => {
    const { container } = render(<ModalPanel>Content</ModalPanel>);
    expect(container.firstChild).toHaveClass('max-w-4xl');
  });

  it('applies custom max-width', () => {
    const { container } = render(<ModalPanel maxWidth="2xl">Content</ModalPanel>);
    expect(container.firstChild).toHaveClass('max-w-2xl');
  });

  it('applies custom className', () => {
    const { container } = render(<ModalPanel className="p-8">Content</ModalPanel>);
    expect(container.firstChild).toHaveClass('p-8');
  });
});

describe('ModalCloseButton', () => {
  it('renders with default label', () => {
    render(<ModalCloseButton onClick={vi.fn()} />);
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<ModalCloseButton onClick={vi.fn()} label="Dismiss" />);
    expect(screen.getByLabelText('Dismiss')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ModalCloseButton onClick={onClick} />);
    await user.click(screen.getByLabelText('Close'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
