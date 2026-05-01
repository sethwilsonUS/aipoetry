'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import {
  DeepVerseAnalysisReport,
  VerseAnalysisCheck,
  VerseAnalysisReport,
} from '@/lib/poetry/analysisTypes';

interface VerseAnalysisPanelProps {
  analysis: VerseAnalysisReport | null;
  deepAnalysis: DeepVerseAnalysisReport | null;
  deepAnalysisStatus: 'pending' | 'generating' | 'complete' | 'error' | null;
  deepAnalysisError: string | null;
  deepAnalysisModel: string | null;
  poemId: string;
  styleName: string;
  identifier: string;
}

const statusLabels: Record<VerseAnalysisCheck['status'], string> = {
  pass: 'Passed',
  partial: 'Partial',
  fail: 'Drifted',
  unknown: 'Context note',
};

const failureModeLabels: Record<string, string> = {
  wrong_line_count: 'wrong line count',
  meter_drift: 'meter drift',
  syllable_count_drift: 'syllable-count drift',
  rhyme_scheme_mismatch: 'rhyme-scheme mismatch',
  missing_refrain: 'missing refrain',
  refrain_stagnation: 'static refrain',
  sestina_end_word_failure: 'sestina end-word failure',
  missing_or_weak_volta: 'missing or weak volta',
  semantic_padding: 'semantic padding',
  decorative_form: 'decorative form',
  archaic_cosplay: 'archaic cosplay',
  unknown: 'unknown form profile',
};

function checksByStatus(
  checks: VerseAnalysisCheck[],
  status: VerseAnalysisCheck['status'],
): VerseAnalysisCheck[] {
  return checks.filter((check) => check.status === status);
}

function scoreTone(score: number): string {
  if (score >= 85) return 'text-[var(--accent)]';
  if (score >= 60) return 'text-[var(--text-primary)]';
  return 'text-[#b45309] dark:text-[#fbbf24]';
}

export default function VerseAnalysisPanel({
  analysis,
  deepAnalysis,
  deepAnalysisStatus,
  deepAnalysisError,
  deepAnalysisModel,
  poemId,
  styleName,
  identifier,
}: VerseAnalysisPanelProps) {
  const requestAnalysis = useMutation(api.poemAnalyses.requestAnalysis);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState('');

  const handleRequestAnalysis = async () => {
    setError('');
    setIsRequesting(true);
    try {
      const result = await requestAnalysis({ poemId: poemId as Id<'poems'> });
      if (!result.success) {
        setError(result.error || 'Analysis could not be created.');
      }
    } catch {
      setError('Analysis could not be created.');
    } finally {
      setIsRequesting(false);
    }
  };

  if (!analysis) {
    return (
      <>
        <section className='max-w-2xl mx-auto px-6 pb-8' aria-labelledby='verse-analysis-heading'>
          <div className='garden-bed p-5 sm:p-6 space-y-4'>
            <div>
              <p className='text-xs uppercase tracking-widest text-[var(--text-muted)] mb-1'>
                Automatic reading lens
              </p>
              <h2
                id='verse-analysis-heading'
                className='text-xl font-semibold text-[var(--text-primary)] mb-2'
                style={{ fontFamily: 'var(--font-display), serif' }}
              >
                Verse Analysis
              </h2>
              <p className='text-sm text-[var(--text-secondary)] leading-relaxed'>
                The rule-based form check should appear automatically for this {styleName}.
                If this is an older poem or the background pass missed it, you can rebuild it
                without using AI model credits.
              </p>
            </div>

            {error && (
              <div role='alert' aria-live='assertive' className='alert-error'>
                <span className='text-sm'>{error}</span>
              </div>
            )}

            <button
              type='button'
              onClick={handleRequestAnalysis}
              disabled={isRequesting}
              className='inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--accent)] transition-colors duration-150 hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60'
              aria-busy={isRequesting}
            >
              {isRequesting ? 'Checking...' : 'Rebuild rule check'}
            </button>
          </div>
        </section>

        <DeepAnalysisPanel
          poemId={poemId}
          identifier={identifier}
          report={deepAnalysis}
          status={deepAnalysisStatus}
          error={deepAnalysisError}
          model={deepAnalysisModel}
        />
      </>
    );
  }

  const passed = checksByStatus(analysis.checks, 'pass');
  const partial = checksByStatus(analysis.checks, 'partial');
  const failed = checksByStatus(analysis.checks, 'fail');
  const unknown = checksByStatus(analysis.checks, 'unknown');

  return (
    <>
      <section className='max-w-2xl mx-auto px-6 pb-8' aria-labelledby='verse-analysis-heading'>
        <div className='garden-bed p-5 sm:p-6 space-y-5'>
          <header className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
            <div>
              <p className='text-xs uppercase tracking-widest text-[var(--text-muted)] mb-1'>
                Rule-based form check
              </p>
              <h2
                id='verse-analysis-heading'
                className='text-2xl font-semibold text-[var(--text-primary)]'
                style={{ fontFamily: 'var(--font-display), serif' }}
              >
                Verse Analysis: {analysis.styleName}
              </h2>
            </div>
            <div className='shrink-0 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-4 py-3 text-center'>
              <div className={`text-3xl font-bold leading-none ${scoreTone(analysis.overallScore)}`}>
                {analysis.overallScore}
              </div>
              <div className='text-xs text-[var(--text-muted)] mt-1'>formal score</div>
            </div>
          </header>

          <p className='text-sm leading-relaxed text-[var(--text-secondary)]'>
            {analysis.summary}
          </p>

          <dl className='grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm'>
            <div className='rounded-lg border border-[var(--border-color)] p-3'>
              <dt className='text-xs text-[var(--text-muted)]'>Confidence</dt>
              <dd className='font-semibold capitalize text-[var(--text-primary)]'>
                {analysis.confidence}
              </dd>
            </div>
            <div className='rounded-lg border border-[var(--border-color)] p-3'>
              <dt className='text-xs text-[var(--text-muted)]'>Detected rhyme</dt>
              <dd className='font-semibold text-[var(--text-primary)]'>
                {analysis.detectedFeatures.rhymeScheme || 'unknown'}
              </dd>
            </div>
            <div className='rounded-lg border border-[var(--border-color)] p-3'>
              <dt className='text-xs text-[var(--text-muted)]'>Lines</dt>
              <dd className='font-semibold text-[var(--text-primary)]'>
                {analysis.detectedFeatures.lineCount}
              </dd>
            </div>
          </dl>

          <div className='space-y-4'>
            <CheckGroup label='What worked' checks={passed} />
            <CheckGroup label='Where it partly held' checks={partial} />
            <CheckGroup label='Where it drifted' checks={failed} />
            <CheckGroup label='Context notes' checks={unknown} />
          </div>

          <FeatureDetails analysis={analysis} />

          {analysis.failureModes.length > 0 && (
            <div>
              <h3 className='text-sm font-semibold text-[var(--text-primary)] mb-2'>
                Failure modes
              </h3>
              <div className='flex flex-wrap gap-2'>
                {analysis.failureModes.map((mode) => (
                  <span
                    key={mode}
                    className='rounded-full border border-[var(--border-color)] px-3 py-1 text-xs text-[var(--text-secondary)]'
                  >
                    {failureModeLabels[mode] ?? mode}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysis.revisionAdvice.length > 0 && (
            <div>
              <h3 className='text-sm font-semibold text-[var(--text-primary)] mb-2'>
                Revision advice
              </h3>
              <ul className='space-y-2'>
                {analysis.revisionAdvice.map((advice) => (
                  <li key={advice} className='text-sm text-[var(--text-secondary)] leading-relaxed'>
                    {advice}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <DeepAnalysisPanel
        poemId={poemId}
        identifier={identifier}
        report={deepAnalysis}
        status={deepAnalysisStatus}
        error={deepAnalysisError}
        model={deepAnalysisModel}
      />
    </>
  );
}

function formatModel(model: string | null): string {
  if (!model) return 'Claude Opus 4.6';
  const raw = model.includes('/') ? model.split('/').pop() ?? model : model;
  if (raw === 'claude-opus-4-6') return 'Claude Opus 4.6';
  return raw
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function DeepAnalysisPanel({
  poemId,
  identifier,
  report,
  status,
  error,
  model,
}: {
  poemId: string;
  identifier: string;
  report: DeepVerseAnalysisReport | null;
  status: VerseAnalysisPanelProps['deepAnalysisStatus'];
  error: string | null;
  model: string | null;
}) {
  const requestDeepAnalysis = useMutation(api.deepPoemAnalyses.requestDeepAnalysis);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestError, setRequestError] = useState('');
  const displayModel = formatModel(model);
  const isRunning = status === 'pending' || status === 'generating' || isRequesting;

  const handleRequestDeepAnalysis = async () => {
    setRequestError('');
    setIsRequesting(true);
    try {
      const result = await requestDeepAnalysis({
        poemId: poemId as Id<'poems'>,
        identifier,
      });
      if (!result.success) {
        setRequestError(result.error || 'Deep analysis could not be started.');
      }
    } catch {
      setRequestError('Deep analysis could not be started.');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <section className='max-w-2xl mx-auto px-6 pb-8' aria-labelledby='deep-analysis-heading'>
      <div className='garden-bed p-5 sm:p-6 space-y-4'>
        <div>
          <p className='text-xs uppercase tracking-widest text-[var(--text-muted)] mb-1'>
            Optional model critique
          </p>
          <h2
            id='deep-analysis-heading'
            className='text-xl font-semibold text-[var(--text-primary)] mb-2'
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            Deep AI Analysis
          </h2>
          <p className='text-sm text-[var(--text-secondary)] leading-relaxed'>
            This runs a separate qualitative critique with {displayModel}. It uses AI model
            credits, so it only starts when you ask for it.
          </p>
        </div>

        {(requestError || (status === 'error' && error)) && (
          <div role='alert' aria-live='assertive' className='alert-error'>
            <span className='text-sm'>{requestError || error}</span>
          </div>
        )}

        {report ? (
          <div className='space-y-4'>
            <p className='text-sm leading-relaxed text-[var(--text-secondary)]'>
              {report.overallAssessment}
            </p>

            <div className='grid grid-cols-1 gap-3 text-sm'>
              <DeepAnalysisSection label='Formal reading' text={report.formalReading} />
              <DeepAnalysisSection label='Imagery and voice' text={report.imageryAndVoice} />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              <DeepAnalysisList label='Strengths' items={report.strengths} />
              <DeepAnalysisList label='Weaknesses' items={report.weaknesses} />
              <DeepAnalysisList label='Revision priorities' items={report.revisionPriorities} />
            </div>

            <p className='text-xs text-[var(--text-muted)] capitalize'>
              AI critique confidence: {report.confidence}
            </p>
          </div>
        ) : (
          <button
            type='button'
            onClick={handleRequestDeepAnalysis}
            disabled={isRunning}
            className='inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--accent)] transition-colors duration-150 hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60'
            aria-busy={isRunning}
          >
            {isRunning ? 'Deep analysis running...' : 'Run deep AI analysis'}
          </button>
        )}
      </div>
    </section>
  );
}

function DeepAnalysisSection({ label, text }: { label: string; text: string }) {
  return (
    <div className='rounded-lg border border-[var(--border-color)] p-3'>
      <h3 className='text-sm font-semibold text-[var(--text-primary)] mb-1'>{label}</h3>
      <p className='text-sm leading-relaxed text-[var(--text-secondary)]'>{text}</p>
    </div>
  );
}

function DeepAnalysisList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className='rounded-lg border border-[var(--border-color)] p-3'>
      <h3 className='text-sm font-semibold text-[var(--text-primary)] mb-2'>{label}</h3>
      <ul className='space-y-2'>
        {items.map((item) => (
          <li key={item} className='text-sm leading-relaxed text-[var(--text-secondary)]'>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CheckGroup({
  label,
  checks,
}: {
  label: string;
  checks: VerseAnalysisCheck[];
}) {
  if (checks.length === 0) return null;

  return (
    <div>
      <h3 className='text-sm font-semibold text-[var(--text-primary)] mb-2'>{label}</h3>
      <ul className='space-y-2'>
        {checks.map((check) => (
          <li
            key={check.id}
            className='rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] p-3'
          >
            <div className='flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between'>
              <p className='font-medium text-[var(--text-primary)]'>
                {check.label}
                <span className='sr-only'>: {statusLabels[check.status]}</span>
              </p>
              <p className='text-xs text-[var(--text-muted)]'>{check.score}/100</p>
            </div>
            <p className='mt-1 text-sm leading-relaxed text-[var(--text-secondary)]'>
              {check.explanation}
            </p>
            {(check.expected || check.observed) && (
              <p className='mt-2 text-xs text-[var(--text-muted)]'>
                Expected: {check.expected ?? 'unknown'}; observed: {check.observed ?? 'unknown'}.
              </p>
            )}
            {check.evidence && check.evidence.length > 0 && (
              <p className='mt-2 text-xs text-[var(--text-muted)]'>
                Evidence: {check.evidence.join(' / ')}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeatureDetails({ analysis }: { analysis: VerseAnalysisReport }) {
  const syllables = analysis.detectedFeatures.syllableCounts.join(', ');
  const endWords = analysis.detectedFeatures.endWords.join(', ');
  const repeatedLines = analysis.detectedFeatures.repeatedLines ?? [];

  return (
    <details className='style-info group rounded-lg border border-[var(--border-color)] p-3'>
      <summary className='inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-150'>
        <span style={{ fontFamily: 'var(--font-display), serif' }}>Detected features</span>
        <svg className='w-3.5 h-3.5 transition-transform duration-200 group-open:rotate-180' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
          <path d='m6 9 6 6 6-6' />
        </svg>
      </summary>
      <div className='mt-3 space-y-2 text-xs leading-relaxed text-[var(--text-secondary)]'>
        <p>Syllables by line: {syllables || 'unknown'}.</p>
        <p>End words: {endWords || 'unknown'}.</p>
        {analysis.detectedFeatures.possibleVoltaLine && (
          <p>Possible turn marker near line {analysis.detectedFeatures.possibleVoltaLine}.</p>
        )}
        {repeatedLines.length > 0 && (
          <p>
            Repeated lines:{' '}
            {repeatedLines
              .map((line) => `lines ${line.occurrences.join(', ')}`)
              .join('; ')}
            .
          </p>
        )}
      </div>
    </details>
  );
}
