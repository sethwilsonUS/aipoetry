import { z } from "zod";

const formatSchema = z.object({
  title: z.string(),
  lines: z.array(z.string()).length(5),
});

const styles: IStyle[] = [
  {
    name: 'limerick',
    description: 'a traditional Irish limerick',
    format: formatSchema.shape,
  }
]

export const getRandomStyle = () => {
  const randomIndex = Math.floor(Math.random() * styles.length);
  return styles[randomIndex];
};