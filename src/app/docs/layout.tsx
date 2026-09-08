import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import type { CSSProperties } from 'react';

// fumadocs lays the docs shell out as a 5-column grid:
//   [1fr] [sidebar] [main] [toc] [1fr]
// where main = --fd-layout-width - sidebar - toc. The default 97rem leaves the
// two 1fr gutters holding the leftover viewport, which reads as dead space next
// to the sidebar and to the right of the TOC. Setting the layout width to 100%
// collapses both gutters to 0 and hands all the slack to the article column.
const fullWidth = { '--fd-layout-width': '100%' } as CSSProperties;

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      containerProps={{ style: fullWidth }}
      {...baseOptions()}
    >
      {children}
    </DocsLayout>
  );
}
