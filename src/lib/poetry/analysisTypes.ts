export const ANALYSIS_VERSION = 'verse-analysis-v1';
export const DEEP_ANALYSIS_VERSION = 'deep-ai-analysis-v1';

export interface AnalyzePoemInput {
  title?: string;
  lines: string[];
  styleName: string;
  styleKey?: string;
  styleExplanation?: string;
}

export interface VerseAnalysisReport {
  styleName: string;
  overallScore: number;
  summary: string;
  checks: VerseAnalysisCheck[];
  detectedFeatures: DetectedPoeticFeatures;
  failureModes: PoetryFailureMode[];
  revisionAdvice: string[];
  confidence: AnalysisConfidence;
}

export interface DeepVerseAnalysisReport {
  styleName: string;
  overallAssessment: string;
  formalReading: string;
  imageryAndVoice: string;
  strengths: string[];
  weaknesses: string[];
  revisionPriorities: string[];
  confidence: AnalysisConfidence;
}

export interface VerseAnalysisCheck {
  id: string;
  label: string;
  status: AnalysisStatus;
  score: number;
  expected?: string;
  observed?: string;
  explanation: string;
  evidence?: string[];
}

export interface DetectedPoeticFeatures {
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

export type AnalysisStatus = 'pass' | 'partial' | 'fail' | 'unknown';
export type AnalysisConfidence = 'low' | 'medium' | 'high';

export type PoetryFailureMode =
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

export interface FormProfile {
  styleNames: string[];
  confidence: AnalysisConfidence;
  // eslint-disable-next-line no-unused-vars
  analyze(context: AnalysisContext): ProfileAnalysis;
}

export interface AnalysisContext {
  input: AnalyzePoemInput;
  features: DetectedPoeticFeatures;
}

export interface ProfileAnalysis {
  checks: VerseAnalysisCheck[];
  failureModes: PoetryFailureMode[];
  revisionAdvice: string[];
  confidence?: AnalysisConfidence;
}
