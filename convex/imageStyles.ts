export type ImageStyleConfig = {
  name: string;
  label: string;
  promptFragment: string;
};

export const IMAGE_STYLES: ImageStyleConfig[] = [
  {
    name: 'none',
    label: 'No Image',
    promptFragment: '',
  },
  {
    name: 'classical',
    label: 'Classical',
    promptFragment:
      'Ancient Greek or Roman artwork — marble relief, fresco, or red-figure pottery. Heroic or mythological figures rendered in idealized forms, dramatic drapery, architectural symmetry, earth tones and ochre',
  },
  {
    name: 'medieval',
    label: 'Medieval Illuminated Manuscript',
    promptFragment:
      'Medieval illuminated manuscript style — intricate gold leaf borders, flat perspective, jewel-toned pigments (ultramarine, vermillion, emerald), highly decorative patterning, figures rendered with stylized elongation',
  },
  {
    name: 'renaissance',
    label: 'Renaissance',
    promptFragment:
      'Italian Renaissance painting — sfumato, chiaroscuro, perfect anatomical proportion, deep perspectival space, rich oil glazes, warm earthy light reminiscent of Raphael or Leonardo',
  },
  {
    name: 'baroque',
    label: 'Baroque',
    promptFragment:
      'Baroque oil painting — extreme chiaroscuro, theatrical diagonal composition, deep shadows dramatically pierced by a single light source, emotional intensity, rich jewel tones, in the manner of Caravaggio or Rembrandt',
  },
  {
    name: 'romanticism',
    label: 'Romanticism',
    promptFragment:
      'Romantic era painting — sublime and turbulent landscapes, vast scale dwarfing small human figures, stormy skies or golden light, intense emotional atmosphere, in the spirit of Caspar David Friedrich or J.M.W. Turner',
  },
  {
    name: 'impressionism',
    label: 'Impressionism',
    promptFragment:
      'Impressionist oil painting — loose, flickering brushwork capturing transient light, dappled color applied in short strokes, soft atmospheric haze, plein air quality, in the manner of Monet or Renoir',
  },
  {
    name: 'post-impressionism',
    label: 'Post-Impressionism',
    promptFragment:
      'Post-Impressionist painting — bold swirling brushwork, heightened non-naturalistic color, emotional distortion of form, heavy impasto texture, in the style of Van Gogh or Cézanne',
  },
  {
    name: 'art-nouveau',
    label: 'Art Nouveau',
    promptFragment:
      'Art Nouveau illustration — sinuous organic lines, floral and natural motifs woven into decorative borders, flowing hair and drapery, muted gold and sage palette, flat elegant composition in the style of Alphonse Mucha',
  },
  {
    name: 'expressionism',
    label: 'Expressionism',
    promptFragment:
      'German Expressionist painting — distorted angular forms, raw emotional color (acid greens, violent reds, sickly yellows), psychological tension made visible, harsh brushwork, in the spirit of Ernst Ludwig Kirchner or Egon Schiele',
  },
  {
    name: 'cubism',
    label: 'Cubism',
    promptFragment:
      'Analytic Cubist painting — subject fragmented into geometric planes viewed simultaneously from multiple angles, muted grey-brown palette punctuated by faceted shards, overlapping transparent layers, in the manner of early Picasso or Braque',
  },
  {
    name: 'surrealism',
    label: 'Surrealism',
    promptFragment:
      'Surrealist oil painting — hyper-realistic rendering of impossible dreamlike scenes, unexpected juxtapositions, melting or metamorphosing objects, vast empty landscapes, in the style of Salvador Dalí or René Magritte',
  },
  {
    name: 'abstract-expressionism',
    label: 'Abstract Expressionism',
    promptFragment:
      'Abstract Expressionist canvas — large-scale gestural marks, raw emotional energy, dripped and poured paint, dynamic tension between chaos and intention, in the spirit of de Kooning or Franz Kline',
  },
  {
    name: 'ukiyo-e',
    label: 'Japanese Ukiyo-e',
    promptFragment:
      'Japanese Ukiyo-e woodblock print — bold outlines, flat areas of pure color, dramatic cropping, Mt. Fuji silhouettes or crashing waves, seasonal motifs, fine detail in flora and textile patterns, in the style of Hokusai or Hiroshige',
  },
  {
    name: 'bayeux',
    label: 'Bayeux Tapestry',
    promptFragment:
      'Bayeux Tapestry style — medieval Norman embroidery on aged linen, visible wool stitchwork texture throughout. Horizontal narrative frieze composition with bold black outlines and flat stylized figures. Strict period palette: russet red, olive green, steel blue, buff tan, and black only. Geometric fill-hatching on garments and horses. Decorative border bands at top and bottom packed with fantastical beasts, birds, and foliate patterns. 11th-century Romanesque energy — monumental, heraldic, and slightly absurd',
  },
  {
    name: 'sumi-e',
    label: 'Japanese Sumi-e',
    promptFragment:
      'Japanese Sumi-e ink wash painting — spare, contemplative brushwork, vast empty space (ma) as an active element, wet-on-wet ink bleeding into rice paper, a single branch or mountain rendered in a few decisive strokes, profound quietude',
  },
];
