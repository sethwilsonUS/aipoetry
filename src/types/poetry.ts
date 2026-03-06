import { ReactNode } from 'react';

export interface IPoetry {
  title: string;
  lines: string[];
  styleName: string;
  styleExplanation: string;
  children?: ReactNode;
}
