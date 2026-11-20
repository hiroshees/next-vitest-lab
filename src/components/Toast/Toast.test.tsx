import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from './Toast';

describe('Toast', () => {
  it('メッセージが表示される', () => {
    render(<Toast message="保存しました" onClose={vi.fn()} />);

    expect(screen.getByRole('status')).toHaveTextContent('保存しました');
  });

  it('「閉じる」を押すと、すぐに onClose が呼ばれる', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Toast message="保存しました" onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: '閉じる' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  describe('時間による自動クローズ', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('3秒たつと onClose が呼ばれる（直前ではまだ呼ばれない）', () => {
      const onClose = vi.fn();
      render(<Toast message="保存しました" onClose={onClose} />);

      vi.advanceTimersByTime(2999);
      expect(onClose).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('duration を指定すると、その時間で閉じる', () => {
      const onClose = vi.fn();
      render(
        <Toast message="保存しました" duration={5000} onClose={onClose} />,
      );

      vi.advanceTimersByTime(4999);
      expect(onClose).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('時間になる前に画面から消えたら、onClose は呼ばれない', () => {
      const onClose = vi.fn();
      const { unmount } = render(
        <Toast message="保存しました" onClose={onClose} />,
      );

      unmount();
      vi.advanceTimersByTime(3000);

      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
