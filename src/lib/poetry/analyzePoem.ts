import {
  ANALYSIS_VERSION,
  AnalyzePoemInput,
  AnalysisConfidence,
  VerseAnalysisReport,
} from './analysisTypes';
import { buildBaseFeatures, extractEndWord } from './lineFeatures';
import { formatRhymeScheme, getRhymeLabels } from './rhyme';
import { findFormProfile, genericAnalysis } from './formProfiles';

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function reportConfidence(
  profileConfidence: AnalysisConfidence,
  lineCount: number,
): AnalysisConfidence {
  if (lineCount === 0) return 'low';
  return profileConfidence;
}

function buildSummary(report: Omit<VerseAnalysisReport, 'summary'>): string {
  const passed = report.checks.filter((check) => check.status === 'pass').length;
  const failed = report.checks.filter((check) => check.status === 'fail').length;
  const partial = report.checks.filter((check) => check.status === 'partial').length;

  if (report.confidence === 'low') {
    return `The analyzer can only make a cautious reading of this ${report.styleName}. It detected ${passed} passing check(s), ${partial} partial check(s), and ${failed} failed check(s).`;
  }

  if (report.overallScore >= 85) {
    return `The poem appears to follow the requested ${report.styleName} constraints closely, with the usual caveat that rhyme and meter are approximate.`;
  }

  if (report.overallScore >= 60) {
    return `The poem appears to capture parts of the ${report.styleName} form, but the analyzer detected some formal drift worth reading closely.`;
  }

  return `The poem has some surface features of ${report.styleName}, but the analyzer detected substantial drift from the requested constraints.`;
}

export function analyzePoem(input: AnalyzePoemInput): VerseAnalysisReport {
  const lines = input.lines.filter((line) => line.trim().length > 0);
  const preliminaryLabels = getRhymeLabels(lines.map(extractEndWord));
  const features = buildBaseFeatures(lines, preliminaryLabels, formatRhymeScheme(preliminaryLabels));
  const profile = findFormProfile(input.styleName);
  const profileAnalysis = profile
    ? profile.analyze({ input: { ...input, lines }, features })
    : genericAnalysis({ input: { ...input, lines }, features });

  const checks = profileAnalysis.checks;
  const overallScore = checks.length
    ? clampScore(checks.reduce((sum, check) => sum + check.score, 0) / checks.length)
    : 0;
  const confidence = reportConfidence(
    profileAnalysis.confidence ?? profile?.confidence ?? 'low',
    lines.length,
  );

  const reportWithoutSummary = {
    styleName: input.styleName,
    overallScore,
    checks,
    detectedFeatures: features,
    failureModes: profileAnalysis.failureModes,
    revisionAdvice: profileAnalysis.revisionAdvice,
    confidence,
  };

  return {
    ...reportWithoutSummary,
    summary: buildSummary(reportWithoutSummary),
  };
}

export { ANALYSIS_VERSION };
