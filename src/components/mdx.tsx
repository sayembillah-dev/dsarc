import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { IfElseAnim, SwitchAnim } from './anim/control-flow';
import { ForLoopAnim, WhileLoopAnim } from './anim/loops';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    IfElseAnim,
    SwitchAnim,
    ForLoopAnim,
    WhileLoopAnim,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
