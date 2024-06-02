export interface IPoetry {
  title: string;
  lines: string[];
  styleName: string;
  styleExplanation: string;
}

export interface IPoetryComponentProps extends IPoetry {
  ttl: number;
}
