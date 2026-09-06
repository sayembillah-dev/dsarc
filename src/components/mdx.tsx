import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import {
  ArrayOpsPlayground,
  ClassBlueprint,
  CodeToOutput,
  DecisionFlow,
  FunctionMachine,
  LoopTracer,
  PseudoToCode,
  TruthTableExplorer,
  VariableBoxes,
} from './viz/js-fundamentals';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ArrayOpsPlayground,
    ClassBlueprint,
    CodeToOutput,
    DecisionFlow,
    FunctionMachine,
    LoopTracer,
    PseudoToCode,
    TruthTableExplorer,
    VariableBoxes,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
