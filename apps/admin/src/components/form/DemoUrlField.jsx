import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { isEmbeddableDemoUrl } from '@devhouse/shared';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { Modal } from '../ui/Modal.jsx';

export const isDemoUrlValid = value => value === '' || isEmbeddableDemoUrl(value);

/**
 * Demo link that opens inside the website, with a button to check that the page
 * allows being shown in a frame.
 */
export function DemoUrlField({ value, onChange, label = 'Link xem thử (demo)' }) {
  const [isOpen, setIsOpen] = useState(false);
  const valid = isDemoUrlValid(value);

  return (
    <div className="space-y-2">
      <Input
        label={label}
        placeholder="https://demo.tenmien.com"
        value={value}
        onChange={e => onChange(e.target.value)}
        error={!valid ? 'Link demo phải bắt đầu bằng https://' : undefined}
        helperText="Khách xem demo ngay trong khung trên website, không bị chuyển sang trang khác."
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!value || !valid}
        onClick={() => setIsOpen(true)}
      >
        <Play className="mr-1.5 h-3.5 w-3.5" />
        Kiểm tra xem có hiện được trong khung không
      </Button>
      <p className="text-[11px] text-fg-subtle">
        Một số trang web chặn việc hiển thị trong khung nhúng. Nếu khung bên dưới trống, hãy dùng
        link khác.
      </p>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Xem thử trong khung"
        size="xl"
        footer={
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Đóng
          </Button>
        }
      >
        {isOpen && (
          <iframe
            title="Xem thử demo"
            src={value}
            className="h-[60vh] w-full rounded-lg border border-border bg-surface"
            sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-presentation"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}
      </Modal>
    </div>
  );
}
