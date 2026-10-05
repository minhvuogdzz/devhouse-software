import React from 'react';
import { LocalizedField } from '../form/LocalizedField.jsx';
import { ListField } from '../form/ListField.jsx';
import { Toggle } from '../form/Toggle.jsx';
import { IconSelect } from '../form/IconSelect.jsx';
import { DisplayField } from '../form/DisplayField.jsx';
import { GalleryField } from '../form/GalleryField.jsx';
import { Input, Select } from '../ui/Input.jsx';
import { ImageField } from '../media-picker/MediaPickerModal.jsx';
import { normalizeDisplay } from '@devhouse/shared';

/**
 * Draws an editor for one page section from the field descriptors defined in
 * @devhouse/content (the same descriptors that validate the content on the server).
 * Adding a field to a section in code makes it editable here with no admin code.
 */

const LABELS = {
  eyebrow: 'Nhãn phụ phía trên (Eyebrow)',
  heading: 'Tiêu đề chính (Heading)',
  subheading: 'Mô tả ngắn dưới tiêu đề (Subheading)',
  intro: 'Đoạn giới thiệu (Intro)',
  title: 'Tiêu đề (Title)',
  description: 'Mô tả chi tiết (Description)',
  text: 'Nội dung',
  body: 'Nội dung',
  items: 'Danh sách',
  steps: 'Các bước',
  highlights: 'Điểm nhấn (các dòng ngắn)',
  primaryCta: 'Nút chính',
  secondaryCta: 'Nút phụ',
  button: 'Nút',
  label: 'Chữ trên nút',
  url: 'Đường dẫn',
  target: 'Cách mở',
  icon: 'Biểu tượng',
  image: 'Hình ảnh',
  name: 'Tên',
  role: 'Chức danh',
  members: 'Thành viên',
  nodes: 'Sơ đồ tổ chức',
  parent: 'Thuộc về (mã của mục cấp trên, để trống nếu là cấp cao nhất)',
  id: 'Mã định danh (không dấu, không trùng nhau)',
  values: 'Các giá trị',
  offerings: 'Các nhóm việc',
  offeringsHeading: 'Tiêu đề của các nhóm việc',
  groupNote: 'Ghi chú về tập đoàn',
  lastUpdated: 'Dòng "cập nhật lần cuối"',
  linkLabel: 'Chữ của liên kết',
  stepNumber: 'Số bước',
  question: 'Câu hỏi',
  answer: 'Trả lời',
  content: 'Nội dung',
  paragraphs: 'Các đoạn giới thiệu',
  images: 'Ảnh (slide)',
  display: 'Cách hiển thị danh sách',
  path: 'Đường dẫn trang (ví dụ /services/thiet-ke-website)',
  caption: 'Chú thích',
};

const labelOf = name => LABELS[name] || name;

const MULTILINE = new Set([
  'subheading',
  'description',
  'intro',
  'text',
  'body',
  'groupNote',
  'content',
  'answer',
  'paragraphs',
]);

export function emptyValue(descriptor) {
  switch (descriptor?.type) {
    case 'string':
      return '';
    case 'text':
    case 'textarea':
    case 'richText':
      return { vi: '', en: '' };
    case 'image':
      return null;
    case 'link':
      return { label: { vi: '', en: '' }, url: '', target: '_self' };
    case 'boolean':
      return false;
    case 'select':
      return descriptor.options?.[0] ?? '';
    case 'list':
      return [];
    case 'display':
      return normalizeDisplay({});
    case 'gallery':
      return [];
    case 'group':
      return Object.fromEntries(
        Object.entries(descriptor.fields || {}).map(([k, d]) => [k, emptyValue(d)]),
      );
    default:
      return '';
  }
}

function FieldEditor({ name, descriptor, value, onChange }) {
  const label = labelOf(name);

  switch (descriptor.type) {
    case 'string':
      return (
        <Input
          label={label}
          value={value ?? ''}
          maxLength={descriptor.max}
          onChange={e => onChange(e.target.value)}
        />
      );

    case 'text':
    case 'textarea':
    case 'richText': {
      const multiline = descriptor.type !== 'text' || MULTILINE.has(name);
      return (
        <LocalizedField
          label={label}
          type={multiline ? 'textarea' : 'text'}
          rows={descriptor.type === 'richText' ? 8 : 3}
          value={value || { vi: '', en: '' }}
          onChange={onChange}
          required={descriptor.required}
        />
      );
    }

    case 'image':
      return <ImageField label={label} value={value} onChange={onChange} />;

    case 'display':
      return (
        <DisplayField label={label} value={value} onChange={onChange} descriptor={descriptor} />
      );

    case 'gallery':
      return <GalleryField label={label} value={value} onChange={onChange} />;

    case 'boolean':
      return <Toggle label={label} checked={value} onChange={onChange} />;

    case 'select': {
      if (descriptor.options?.includes('globe')) {
        return (
          <IconSelect
            label={label}
            value={value}
            onChange={onChange}
            options={descriptor.options}
          />
        );
      }
      return (
        <Select label={label} value={value ?? ''} onChange={e => onChange(e.target.value)}>
          {descriptor.options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      );
    }

    case 'link': {
      const link = value || emptyValue(descriptor);
      return (
        <div className="space-y-3 rounded-xl border border-border/70 p-3">
          <p className="text-xs font-semibold text-fg">{label}</p>
          <LocalizedField
            label="Chữ trên nút"
            value={link.label || { vi: '', en: '' }}
            onChange={next => onChange({ ...link, label: next })}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Đường dẫn"
              placeholder="/contact hoặc https://…"
              value={link.url || ''}
              onChange={e => onChange({ ...link, url: e.target.value })}
            />
            <Select
              label="Cách mở"
              value={link.target || '_self'}
              onChange={e => onChange({ ...link, target: e.target.value })}
            >
              <option value="_self">Mở trong cùng tab</option>
              <option value="_blank">Mở tab mới</option>
            </Select>
          </div>
        </div>
      );
    }

    case 'list': {
      const itemDescriptor = descriptor.of;
      return (
        <ListField
          label={label}
          items={value}
          onChange={onChange}
          max={descriptor.max}
          createItem={() => emptyValue(itemDescriptor)}
          itemTitle={(item, index) => {
            const title = item?.title?.vi || item?.name || item?.vi || item?.question?.vi;
            const text = typeof title === 'string' && title ? title : 'Mục mới';
            return `${index + 1}. ${text.length > 56 ? `${text.slice(0, 56)}…` : text}`;
          }}
          renderItem={(item, setItem) => (
            <FieldEditor
              name={itemDescriptor.type === 'group' ? name : 'text'}
              descriptor={itemDescriptor}
              value={item}
              onChange={setItem}
            />
          )}
        />
      );
    }

    case 'group':
      return (
        <div className="space-y-3">
          {Object.entries(descriptor.fields || {}).map(([childName, childDescriptor]) => (
            <FieldEditor
              key={childName}
              name={childName}
              descriptor={childDescriptor}
              value={value?.[childName]}
              onChange={next => onChange({ ...(value || {}), [childName]: next })}
            />
          ))}
        </div>
      );

    default:
      return null;
  }
}

export function SectionForm({ section, value, onChange }) {
  const current = value || {};
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-surface-raised/40 p-3.5">
        <Toggle
          label="Hiển thị phần này trên website"
          hint="Tắt đi nếu bạn chưa muốn phần này xuất hiện."
          checked={current.visible !== false}
          onChange={visible => onChange({ ...current, visible })}
        />
      </div>

      {Object.entries(section.fields || {}).map(([name, descriptor]) => (
        <FieldEditor
          key={name}
          name={name}
          descriptor={descriptor}
          value={current[name]}
          onChange={next => onChange({ ...current, [name]: next })}
        />
      ))}
    </div>
  );
}
