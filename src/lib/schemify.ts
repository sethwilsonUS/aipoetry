import { z } from 'zod';

const schemify = (lines: number) => {
  return z.object({
    title: z.string(),
    lines: z.array(z.string()).length(lines),
  });
}

export default schemify;
