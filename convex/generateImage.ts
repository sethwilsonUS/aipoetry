'use node';

import { internalAction } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { generateText } from 'ai';
import { STYLES } from './stylesConfig';
import { IMAGE_STYLES } from './imageStyles';

const IMAGE_MODEL = 'google/gemini-3-pro-image';

function buildImagePrompt({
  artStyleFragment,
  poeticStyleName,
  poemTitle,
  topicName,
  lines,
}: {
  artStyleFragment: string;
  poeticStyleName: string;
  poemTitle: string;
  topicName: string;
  lines: string[];
}): string {
  const poemText = lines.join('\n');
  return `${artStyleFragment}.

The subject is ${topicName}. Illustrate the following ${poeticStyleName} titled "${poemTitle}":

${poemText}

The subject — ${topicName} — should be visually recognizable in the illustration.
Beyond that, draw from the specific imagery, metaphors, and emotional tone of the poem.
Use the art style as a visual language — adopt its techniques, palette, and compositional sensibility — but do NOT recreate or directly reference any famous existing artwork. The illustration should feel original, not derivative of a known piece.
Unexpected compositional choices, dramatic use of light, color, and form are encouraged.
Emotionally resonant, even slightly surreal interpretation permitted.
Museum-quality composition. No text, no typography, no words anywhere in the image.

After generating the image, write exactly one sentence describing what is depicted in it. This sentence will be used as a visible caption and as alt text for accessibility. Start it with "Illustration:".`;
}

export const runImageGeneration = internalAction({
  args: { poemId: v.id('poems') },
  handler: async (ctx, args) => {
    const poem = await ctx.runQuery(internal.poems.getForImageGen, { id: args.poemId });
    if (!poem || poem.status !== 'complete' || !poem.artStyle || poem.artStyle === 'none') return;

    await ctx.runMutation(internal.poems.updateImageStatus, {
      id: args.poemId,
      imageStatus: 'generating',
    });

    try {
      const artStyleConfig = IMAGE_STYLES.find((s) => s.name === poem.artStyle);
      const poeticStyleConfig = STYLES.find((s) => s.name === poem.styleName);

      const prompt = buildImagePrompt({
        artStyleFragment: artStyleConfig?.promptFragment ?? poem.artStyle ?? '',
        poeticStyleName: poeticStyleConfig?.name ?? poem.styleName,
        poemTitle: poem.title,
        topicName: poem.topicName,
        lines: poem.lines,
      });

      const result = await generateText({
        model: IMAGE_MODEL,
        prompt,
      });

      const imageFile = result.files?.find((f) => f.mediaType?.startsWith('image/'));
      if (!imageFile) throw new Error('No image file in response');

      const blob = new Blob([imageFile.uint8Array.buffer as ArrayBuffer], { type: imageFile.mediaType ?? 'image/png' });
      const storageId = await ctx.storage.store(blob);

      const rawDescription = result.text?.trim() ?? '';
      const imageDescription = rawDescription.startsWith('Illustration:')
        ? rawDescription
        : rawDescription || undefined;

      await ctx.runMutation(internal.poems.updateImage, {
        id: args.poemId,
        imageStorageId: storageId,
        imageDescription,
        imageStatus: 'complete',
      });
    } catch {
      await ctx.runMutation(internal.poems.updateImageStatus, {
        id: args.poemId,
        imageStatus: 'error',
      });
    }
  },
});
