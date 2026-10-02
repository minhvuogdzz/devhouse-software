import React from 'react';

export function RichTextRenderer({ content, className = '' }) {
  if (!content) return null;

  if (typeof content === 'string') {
    return (
      <div className={`prose max-w-none text-fg-muted space-y-4 leading-relaxed ${className}`}>
        {content.split('\n\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    );
  }

  // If TipTap doc
  if (content.type === 'doc' && Array.isArray(content.content)) {
    return (
      <div className={`prose max-w-none text-fg-muted space-y-5 leading-relaxed ${className}`}>
        {content.content.map((node, i) => renderNode(node, i))}
      </div>
    );
  }

  return null;
}

function renderNode(node, index) {
  if (!node) return null;

  switch (node.type) {
    case 'paragraph':
      return (
        <p key={index} className="text-fg-muted leading-relaxed">
          {node.content ? node.content.map((c, i) => renderInline(c, i)) : <br />}
        </p>
      );

    case 'heading': {
      const level = node.attrs?.level || 2;
      const HeadingTag = `h${level}`;
      const headingStyles = {
        1: 'text-3xl sm:text-4xl font-bold font-display text-fg mt-8 mb-4 tracking-tight',
        2: 'text-2xl sm:text-3xl font-bold font-display text-fg mt-7 mb-3 tracking-tight',
        3: 'text-xl sm:text-2xl font-semibold font-display text-fg mt-6 mb-2',
        4: 'text-lg sm:text-xl font-semibold font-display text-fg mt-5 mb-2',
      };
      return (
        <HeadingTag key={index} className={headingStyles[level] || headingStyles[2]}>
          {node.content?.map((c, i) => renderInline(c, i))}
        </HeadingTag>
      );
    }

    case 'bulletList':
      return (
        <ul key={index} className="list-disc list-inside space-y-2 text-fg-muted pl-4">
          {node.content?.map((c, i) => renderNode(c, i))}
        </ul>
      );

    case 'orderedList':
      return (
        <ol key={index} className="list-decimal list-inside space-y-2 text-fg-muted pl-4">
          {node.content?.map((c, i) => renderNode(c, i))}
        </ol>
      );

    case 'listItem':
      return (
        <li key={index} className="leading-relaxed">
          {node.content?.map((c, i) => renderNode(c, i))}
        </li>
      );

    case 'blockquote':
      return (
        <blockquote
          key={index}
          className="border-l-4 border-primary pl-4 py-1 italic text-fg bg-surface-2 rounded-r-md my-4"
        >
          {node.content?.map((c, i) => renderNode(c, i))}
        </blockquote>
      );

    case 'codeBlock': {
      // P5: Monospace font permitted ONLY here inside blog code block
      const _lang = node.attrs?.language || '';
      const text = node.content?.map(c => c.text || '').join('') || '';
      return (
        <pre
          key={index}
          className="bg-surface-3 text-fg p-4 rounded-lg overflow-x-auto font-mono text-sm border border-border my-6"
        >
          <code>{text}</code>
        </pre>
      );
    }

    case 'horizontalRule':
      return <hr key={index} className="border-border my-8" />;

    default:
      if (node.text) return renderInline(node, index);
      return null;
  }
}

function renderInline(node, index) {
  if (!node) return null;
  let element = node.text || '';

  if (node.marks) {
    for (const mark of node.marks) {
      if (mark.type === 'bold') {
        element = (
          <strong key={`b-${index}`} className="font-semibold text-fg">
            {element}
          </strong>
        );
      } else if (mark.type === 'italic') {
        element = <em key={`i-${index}`}>{element}</em>;
      } else if (mark.type === 'code') {
        element = (
          <code
            key={`c-${index}`}
            className="font-mono text-xs px-1.5 py-0.5 rounded bg-surface-2 text-primary border border-border-subtle"
          >
            {element}
          </code>
        );
      } else if (mark.type === 'link') {
        element = (
          <a
            key={`a-${index}`}
            href={mark.attrs?.href}
            target={mark.attrs?.target || '_blank'}
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            {element}
          </a>
        );
      }
    }
  }

  return <React.Fragment key={index}>{element}</React.Fragment>;
}
