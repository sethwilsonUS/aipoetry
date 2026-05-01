# Infinite Poetry: Research-Grade Verse Analysis Implementation Brief

## Purpose

Transform Infinite Poetry from a lightweight AI poem generator into an interactive research exhibit about **machine versification under constraint**.

The project should not merely demonstrate that AI can generate poems. It should make visible where generative AI understands, imitates, misreads, or fails poetic form.

Core framing:

> Infinite Poetry is an interactive exhibit and research instrument that generates, scans, critiques, and revises AI poetry in constrained forms, making visible the difference between formal mimicry and poetic understanding.

This brief is intended for Codex or another coding agent to convert into an implementation plan.

## Current Project Context

Repo: `~/dev/ai-poetry`

Current stack observed:

- Next.js 14
- React 18
- TypeScript
- Tailwind
- Convex backend
- OpenAI/AI SDK generation flow
- Existing poem generation by topic and poetic style
- Existing Convex modules for poem generation, image generation, topics, styles, poems, schema, etc.
- Existing tests with Vitest

Current product premise:

- Generate one AI poem at a time from a topic and poetic style.
- Display poem, style explanation, and optional generated art.

New product/research direction:

- Generate poem.
- Analyze how well it satisfies the requested form.
- Surface failures as meaningful critical evidence.
- Optionally revise the poem based on analysis.
- Aggregate results into a research corpus/dashboard.

## Exhibit / Research Thesis

The key claim is:

> LLMs often treat poetic form as visible formatting rather than as a semantic engine.

A sonnet is not simply 14 lines. A villanelle is not simply repeated lines. A sestina is not simply recurring end-words. Poetic form creates meaning through pressure, recurrence, variation, expectation, delay, turn, and closure.

Infinite Poetry should therefore evaluate both:

1. **Formal compliance** — did the poem obey measurable constraints?
2. **Poetic-functional compliance** — did the form do meaningful work?

The exhibit should show the difference between:

- following the surface shape of a form
- understanding how the form produces poetic effect

## Product Goals

### Primary Goal

Create a public-facing **Verse Analysis Report** for each generated poem.

The report should explain, in accessible language, how well the poem follows its requested form.

### Secondary Goal

Create a **Generate → Analyze → Revise → Compare** loop.

The system should:

1. Generate a poem for a selected topic/style.
2. Analyze the poem against the requested style/form.
3. Display strengths, failures, and confidence.
4. Optionally ask the model to revise the poem using analyzer feedback.
5. Compare original vs revised outputs.
6. Save structured metadata for later research use.

### Tertiary Goal

Create the foundation for a research corpus/dashboard.

Over time, stored poems should support analysis such as:

- Which forms do LLMs handle best/worst?
- Which models handle which forms best/worst?
- Which constraints are easiest/hardest?
- Do different models have distinctive failure signatures?
- Does revision improve formal compliance?
- Does formal revision degrade poetic quality?
- What failure modes recur by form and model?

## MVP Scope

Implement the smallest valuable version first.

### MVP 1: Rule-Based Verse Analyzer

Add a TypeScript poetry analysis module that accepts:

```ts
interface AnalyzePoemInput {
  title?: string;
  lines: string[];
  styleName: string;
  styleKey?: string;
  styleExplanation?: string;
}
```

Returns:

```ts
interface VerseAnalysisReport {
  styleName: string;
  overallScore: number; // 0-100
  summary: string;
  checks: VerseAnalysisCheck[];
  detectedFeatures: DetectedPoeticFeatures;
  failureModes: PoetryFailureMode[];
  revisionAdvice: string[];
  confidence: 'low' | 'medium' | 'high';
}

interface VerseAnalysisCheck {
  id: string;
  label: string;
  status: 'pass' | 'partial' | 'fail' | 'unknown';
  score: number; // 0-100
  expected?: string;
  observed?: string;
  explanation: string;
  evidence?: string[];
}

interface DetectedPoeticFeatures {
  lineCount: number;
  syllableCounts: number[];
  endWords: string[];
  rhymeLabels?: string[];
  rhymeScheme?: string;
  repeatedLines?: Array<{
    normalizedLine: string;
    occurrences: number[];
  }>;
  possibleVoltaLine?: number;
}

type PoetryFailureMode =
  | 'wrong_line_count'
  | 'meter_drift'
  | 'syllable_count_drift'
  | 'rhyme_scheme_mismatch'
  | 'missing_refrain'
  | 'refrain_stagnation'
  | 'sestina_end_word_failure'
  | 'missing_or_weak_volta'
  | 'semantic_padding'
  | 'decorative_form'
  | 'archaic_cosplay'
  | 'unknown';
```

### MVP 2: Core Measurable Checks

Implement generic checks used across forms:

- line count
- syllable count approximation per line
- end word extraction
- rhyme approximation
- repeated line detection
- basic lexical repetition
- possible volta/turn detection

Do not overfit perfection. The analyzer should be honest about uncertainty.

Use confidence labels and plain-language explanations.

### MVP 3: Form-Specific Profiles

Create form definitions/profiles, likely in something like `src/lib/poetry/formProfiles.ts`.

Each profile should define expected constraints and analysis strategy.

Start with forms likely already supported in the project:

#### Haiku

Checks:

- 3 lines
- approximate 5/7/5 syllable pattern
- concise image-based language

Failure modes:

- wrong line count
- syllable_count_drift
- decorative_form

#### Limerick

Checks:

- 5 lines
- rhyme scheme AABBA
- shorter lines 3 and 4
- comic/narrative turn if detectable

Failure modes:

- rhyme_scheme_mismatch
- meter_drift
- decorative_form

#### Sonnet

Support Shakespearean first, then optionally Petrarchan.

Checks:

- 14 lines
- approximate iambic pentameter: use syllable count 9-11 as MVP proxy
- rhyme scheme, if Shakespearean: ABAB CDCD EFEF GG
- couplet detection
- possible volta around line 9 or final couplet

Failure modes:

- wrong_line_count
- meter_drift
- rhyme_scheme_mismatch
- missing_or_weak_volta
- decorative_form

#### Blank Verse

Checks:

- unrhymed lines
- approximate 10-syllable lines
- avoid strong end-rhyme pattern

Failure modes:

- meter_drift
- rhyme_scheme_mismatch if too rhymed

#### Villanelle

Checks:

- 19 lines
- stanza pattern can be approximated by line count and refrain positions
- line 1 refrain should recur at lines 6, 12, 18
- line 3 refrain should recur at lines 9, 15, 19
- rhyme scheme ABA pattern if feasible

Failure modes:

- wrong_line_count
- missing_refrain
- refrain_stagnation
- rhyme_scheme_mismatch

#### Sestina

Checks:

- 39 lines total: six 6-line stanzas + 3-line envoy
- detect six initial end words
- verify approximate end-word rotation across first six stanzas
- verify envoy includes end words

Expected sestina end-word pattern:

- stanza 1: 1 2 3 4 5 6
- stanza 2: 6 1 5 2 4 3
- stanza 3: 3 6 4 1 2 5
- stanza 4: 5 3 2 6 1 4
- stanza 5: 4 5 1 3 6 2
- stanza 6: 2 4 6 5 3 1

Failure modes:

- wrong_line_count
- sestina_end_word_failure
- semantic_padding

#### Terza Rima

Checks:

- tercet grouping
- chained rhyme ABA BCB CDC...
- final couplet or closing line if present

Failure modes:

- rhyme_scheme_mismatch
- decorative_form

#### Old English / Alliterative Verse

MVP checks:

- four strong-stress-ish words per line is hard; do not overclaim
- detect repeated initial consonant sounds among content words
- look for caesura punctuation or spacing
- flag if output is merely archaic diction without alliterative structure

Failure modes:

- archaic_cosplay
- decorative_form

## Analysis Algorithms: Pragmatic MVP

### Syllable Counting

Implement approximate English syllable counting locally.

Possible approach:

- normalize word
- count vowel groups
- subtract silent terminal `e`
- handle common exceptions
- minimum 1 syllable per word

This does not need to be perfect. Include confidence caveat.

Later enhancement:

- use CMU Pronouncing Dictionary package if compatible
- fallback to heuristic for unknown words

### Rhyme Detection

MVP approach:

- extract normalized end words
- compare endings using simple phonetic-ish heuristic
- exact match should count as rhyme but note repeated word separately
- compare last stressed vowel onward if using dictionary later
- otherwise use suffix similarity of 2-4 chars

Return rhyme labels like `ABAB CDCD EFEF GG`.

Important: distinguish:

- exact repeated word
- likely rhyme
- slant rhyme
- no rhyme

### Refrain Detection

Normalize lines by:

- lowercase
- remove punctuation
- collapse whitespace
- optionally allow small edit distance

Use for villanelle detection.

### Volta Detection

MVP heuristic only.

Look for discourse markers around expected turn regions:

- but
- yet
- however
- still
- nevertheless
- now
- then
- so
- therefore
- although
- despite

Also detect major sentiment/semantic shift only if easy; otherwise keep this simple.

Report as “possible volta” rather than definitive.

### Semantic Padding Detection

Heuristic signs:

- lines with filler phrases like “in the night,” “so bright,” “takes flight,” etc.
- repeated generic abstractions
- abrupt extra adjectives/adverbs near line ends
- revision that improves syllable count while worsening specificity

MVP can be simple and conservative.

## UI Requirements

Add a visible analysis panel near each poem.

Suggested labels:

- “Verse Analysis”
- “How well did the AI follow the form?”
- “Formal score”
- “What worked”
- “Where it drifted”
- “Revision advice”

Do not present the analyzer as omniscient. Use language like:

- “likely”
- “appears to”
- “approximately”
- “the analyzer detected”

Example UI output:

```text
Verse Analysis: Shakespearean Sonnet
Overall: 72/100

Passed:
- 14-line structure
- final couplet present

Partial:
- Rhyme scheme approximates ABAB CDCD EFEF GG, but lines 5/7 are weak slant rhymes.
- Meter averages 10.6 syllables, but several lines drift beyond pentameter.

Failed:
- Volta is weak or missing; the poem changes topic but does not clearly turn in argument.

Failure modes:
- meter drift
- weak volta
- decorative form
```

## Revision Loop Requirements

Add an action or mutation flow that can request a revised poem.

Input:

- original poem
- topic
- style
- analysis report
- specific revision advice

Prompt strategy:

- Tell the model exactly which constraints failed.
- Ask it to revise while preserving the topic and best images.
- Avoid generic “make it better.”
- Ask for same JSON shape currently expected by app.

Store both original and revised poem, linked by parent/revision ID if possible.

Then run the analyzer again on the revised poem.

UI should compare:

- original score
- revised score
- changed checks
- regressions

Important research question to surface:

> Did formal compliance improve at the cost of poetic vitality?


## Model Comparison

Because the project uses Vercel's AI Gateway, model comparison should be treated as a first-class research feature rather than a future nice-to-have.

Core research question:

> Do different language models fail poetic form in different, recognizable ways?

The system should support generating the same topic/form prompt across multiple models and comparing both outputs and analysis reports.

### Model Comparison Goals

- Compare formal compliance across models.
- Compare failure-mode patterns across models.
- Compare revision responsiveness across models.
- Compare tradeoffs between formal accuracy, semantic coherence, and poetic vitality.
- Make model behavior legible to visitors without turning the exhibit into a generic benchmark leaderboard.

### Data to Store Per Generation

Store enough metadata to make comparisons meaningful:

```ts
interface ModelGenerationMetadata {
  provider?: string;
  model: string;
  gatewayModelId?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  promptVersion: string;
  systemPromptVersion?: string;
  generatedAt: number;
}
```

Every generated poem and revision should record the exact model used.

### Comparison Modes

#### Same Prompt, Multiple Models

Given one topic and one poetic form, generate one poem from each selected model using the same prompt template and parameters where possible.

Then show:

- poem text by model
- verse-analysis score by model
- passed/failed checks by model
- detected rhyme scheme by model
- syllable/meter drift by model
- failure modes by model

#### Same Poem, Multiple Analyzer/Judge Models

Optional later phase: use different models as qualitative judges for the same poem.

Important: keep rule-based analysis as the stable baseline. LLM judges may be useful for subjective dimensions, but they should not replace transparent rule-based checks.

#### Revision Responsiveness

For each model:

1. generate initial poem
2. analyze it
3. feed back the same structured critique
4. generate revision
5. compare score delta and quality tradeoff

Research question:

> Which models can use formal critique most effectively, and which models merely patch the obvious errors while damaging the poem?

### UI Ideas

Add a “Compare Models” mode.

Possible display:

- Model cards side by side
- Formal score
- strongest check
- weakest check
- top failure modes
- “revision improved / regressed” badge

Avoid a simplistic “winner” framing. Prefer language like:

- “best formal compliance”
- “most stable meter”
- “strongest rhyme adherence”
- “most semantically coherent”
- “most prone to decorative form”

### Research Dashboard Additions

Aggregate by model:

- average overall score by form
- pass rate per constraint
- failure-mode frequency
- average revision improvement
- forms each model handles best/worst
- model-specific signatures, e.g. “high line-count reliability but weak volta detection/performance”

### Vercel AI Gateway Notes

Implementation should centralize model selection so generation can be routed through Vercel's AI Gateway with minimal branching.

Suggested abstraction:

```ts
interface PoetryModelConfig {
  id: string;
  label: string;
  gatewayModelId: string;
  provider?: string;
  enabled: boolean;
  defaultForGeneration?: boolean;
  defaultForRevision?: boolean;
}
```

The generation code should accept a model config rather than hard-coding a single model.

For comparison runs, use a configured list of enabled models and run either:

- serially, to control cost/rate limits, or
- with limited concurrency, if gateway limits permit.

The UI should make cost/latency implications clear if model comparison is user-triggered.

### MVP Model Comparison Acceptance Criteria

- At least two gateway-backed models can be selected/configured.
- A single topic/form prompt can be generated across selected models.
- Each output is analyzed with the same rule-based analyzer.
- The UI can compare scores, checks, and failure modes by model.
- Stored poem records include model metadata.
- Dashboard planning includes model-level aggregate metrics.

## Data Model Suggestions

Extend poem records to include analysis metadata.

Possible fields:

```ts
analysis?: VerseAnalysisReport;
analysisVersion?: string;
model?: string;
generationPromptVersion?: string;
revisionOf?: Id<'poems'>;
revisionNumber?: number;
researchTags?: string[];
```

Or create separate `poemAnalyses` table:

```ts
poemAnalyses: defineTable({
  poemId: v.id('poems'),
  styleName: v.string(),
  analysisVersion: v.string(),
  overallScore: v.number(),
  summary: v.string(),
  checksJson: v.string(),
  detectedFeaturesJson: v.string(),
  failureModes: v.array(v.string()),
  revisionAdvice: v.array(v.string()),
  confidence: v.string(),
  createdAt: v.number(),
})
```

Recommendation: if Convex schema complexity is manageable, use a separate table for analyses so old poems can be re-analyzed with newer analyzer versions.

## Research Dashboard

Not required for first MVP, but design toward it.

Future dashboard metrics:

- average formal score by form
- pass/fail rates by constraint
- most common failure modes
- average improvement after revision
- forms most harmed by revision
- model comparison if multiple models are used
- topic/form interaction: do some subjects degrade form compliance?

Possible dashboard title:

- “Machine Versification Lab”
- “Constraint Observatory”
- “Form Failure Atlas”

## Human Feedback / Participatory DH Layer

Future feature:

Let readers respond to analyzer claims.

Examples:

- “Do these lines rhyme to you?”
- “Where do you hear the volta?”
- “Did the refrain gain meaning or merely repeat?”
- “Is this a poem, or a poem-shaped object?”

Store feedback as research annotations.

This makes the exhibit participatory rather than purely automated.

## Failure Taxonomy

Use this taxonomy in code and UI.

### decorative_form

The poem has the visible shape of the form but not its deeper poetic function.

Example: 14 lines that do not meaningfully develop or turn like a sonnet.

### wrong_line_count

The poem does not have the expected number of lines.

### syllable_count_drift

The poem substantially misses expected syllable counts.

### meter_drift

The poem begins near the expected meter but loses rhythmic regularity.

### rhyme_scheme_mismatch

The detected rhyme pattern does not match the expected form.

### missing_refrain

A refrain-based form does not repeat required lines in required positions.

### refrain_stagnation

The repeated lines recur but do not gain, shift, or complicate meaning.

This may require LLM-assisted or human feedback later; MVP can flag only when refrains repeat exactly with no surrounding semantic development.

### sestina_end_word_failure

The sestina does not preserve or rotate its six end words correctly.

### missing_or_weak_volta

A sonnet-like form lacks a detectable rhetorical or emotional turn.

### semantic_padding

The poem appears to add generic filler to satisfy syllable/rhyme/line constraints.

### archaic_cosplay

The poem imitates old/archaic diction without satisfying the actual structural requirements of the requested historical form.

## Suggested File/Module Structure

Possible implementation structure:

```text
src/lib/poetry/
  analysisTypes.ts
  analyzePoem.ts
  formProfiles.ts
  syllables.ts
  rhyme.ts
  lineFeatures.ts
  failureModes.ts
  __tests__/
    syllables.test.ts
    rhyme.test.ts
    analyzePoem.test.ts
```

UI components:

```text
src/components/poetry/
  VerseAnalysisPanel.tsx
  VerseAnalysisCheckList.tsx
  RevisionComparison.tsx
```

Convex:

```text
convex/analyzePoem.ts
convex/revisePoem.ts
```

Exact paths may need adjustment based on current app structure.

## Testing Requirements

Add unit tests for:

- syllable counter basic cases
- end-word extraction
- rhyme scheme detection
- line count checks
- haiku analysis
- limerick AABBA detection
- sonnet line count/rhyme checks
- villanelle refrain position checks
- sestina end-word rotation checks

Use small fixture poems, including intentionally bad AI-like examples.

Test examples should include:

- perfect/near-perfect sample
- wrong line count
- rhyme mismatch
- repeated exact end words masquerading as rhyme
- missing refrain
- sestina with broken rotation

## Implementation Phases

### Phase 1: Analyzer Core

- Add analysis types.
- Add generic line/word/syllable/rhyme utilities.
- Add form profiles for haiku, limerick, sonnet, villanelle, sestina.
- Add tests.

Deliverable:

- `analyzePoem(input)` returns useful structured report.

### Phase 2: UI Integration

- Run analyzer on generated poem.
- Display analysis panel.
- Keep language accessible.
- Add visual score treatment but avoid overclaiming precision.

Deliverable:

- User can see how well each poem followed the form.

### Phase 3: Persistence

- Store analysis report/version with poem or in separate table.
- Store model/provider/gateway metadata for every poem.
- Add migration/backfill path if needed.

Deliverable:

- Generated poems accumulate research metadata.

### Phase 4: Revision Loop

- Add “Revise for form” action.
- Feed analysis report back into model.
- Store revised poem linked to original.
- Re-analyze revised poem.
- Show before/after comparison.

Deliverable:

- User can observe whether critique improves or damages the poem.

### Phase 5: Research Dashboard and Model Comparison

- Aggregate scores and failure modes by form.
- Aggregate scores and failure modes by model.
- Show hardest/easiest forms.
- Show which models perform best/worst on each form and constraint.
- Show revision improvement/regression by model.

Deliverable:

- Exhibit has visible research findings, not just individual artifacts.
- Visitors can compare how different gateway-backed models perform under identical poetic constraints.

## Academic / ELO Framing

Use language like:

- computational poetics
- constrained generation
- form as semantic engine
- algorithmic scansion
- human-machine literary criticism
- generative failure as interface
- machine reading of machine writing
- electronic literature as instrument, archive, and performance

Possible exhibit description:

> Infinite Poetry is a generative poetry system that does not stop at generation. Each poem is scanned, scored, and critiqued by a verse-analysis layer that tests whether the model has satisfied the formal constraints it was asked to perform. By exposing line count, rhyme, meter, refrain, end-word rotation, and rhetorical turn, the system makes visible the gap between poem-shaped text and poetic form. Visitors can compare original and revised generations, watching how attempts to repair meter or rhyme may improve formal compliance while flattening imagery, voice, or semantic force. The project treats AI poetic failure not as a bug to conceal but as evidence: a way to study what language models know, imitate, and misunderstand about literary form.

## Non-Goals for MVP

Do not attempt perfect literary judgment.

Avoid:

- claiming definitive meter analysis if using heuristic syllable counts
- pretending rhyme detection is phonetically perfect without a pronouncing dictionary
- over-scoring subjective qualities as if they are objective
- building the dashboard before the analysis model is stable
- blocking launch on perfect scansion

The goal is a useful, transparent, extensible analyzer — not The One Scansion Ring, secretly forged in Mount Doom.

## Acceptance Criteria

A first successful implementation should satisfy:

- Existing app still generates and displays poems.
- Each generated poem can produce a structured `VerseAnalysisReport`.
- At least 5 forms have form-specific analysis.
- Analysis panel appears in UI.
- Model metadata is stored for generated poems.
- At least two Vercel AI Gateway-backed models can be compared with the same prompt/form.
- Unit tests cover core analyzer utilities.
- Analyzer output is understandable to non-specialists.
- Analyzer uncertainty is clearly communicated.
- Code is structured so additional forms/checks can be added later.

