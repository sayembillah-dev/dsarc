import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { IfElseAnim, SwitchAnim } from './anim/control-flow';
import { ForLoopAnim, WhileLoopAnim } from './anim/loops';
import { ArrayOpsAnim, FunctionAnim, OopAnim } from './anim/basics';
import {
  ArrayVsLinkedListAnim,
  CircularLinkedListAnim,
  DeletionAnim,
  DoublyLinkedListAnim,
  SinglyLinkedListAnim,
  WhatIsLinkedListAnim,
} from './anim/linked-list';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    IfElseAnim,
    SwitchAnim,
    ForLoopAnim,
    WhileLoopAnim,
    ArrayOpsAnim,
    FunctionAnim,
    OopAnim,
    WhatIsLinkedListAnim,
    SinglyLinkedListAnim,
    DeletionAnim,
    DoublyLinkedListAnim,
    CircularLinkedListAnim,
    ArrayVsLinkedListAnim,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
