'use node';

import { generateText } from 'ai';
import { v } from 'convex/values';
import { internalAction } from './_generated/server';
import { internal } from './_generated/api';
import { DEEP_ANALYSIS_MODEL_CONFIG } from './poetryModelConfig';
import {
  AnalysisConfidence,
  DeepVerseAnalysisReport,
} from '../src/lib/poetry/analysisTypes';

function buildDeepAnalysisPrompt(args: {
  title: string;
  lines: string[];
  styleName: string;
  styleExplanation: string;
  topicName: string;
  ruleAnalysisJson: string | null;
}): string {
  const poemText = [`Title: ${args.title}`, '', ...args.lines].join('\n');

  return `Analyze this AI-generated poem as a literary critic and verse-form specialist.

This is a deep qualitative analysis. The rule-based report, if present, is the transparent baseline; do not replace it or pretend meter/rhyme detection is certain.

Poetic form: ${args.styleName}
Form notes: ${args.styleExplanation || 'No extra form notes provided.'}
Topic: ${args.topicName || 'Unknown'}

Poem:
${poemText}

Rule-based analysis JSON:
${args.ruleAnalysisJson ?? 'No rule-based analysis is available.'}

Return only JSON in this exact shape:
{
  "styleName": "${args.styleName}",
  "overallAssessment": "2-4 sentences on how the poem works as a poem and as an attempt at the requested form.",
  "formalReading": "2-4 sentences interpreting form, structure, turns, repetition, rhythm, and visible constraint handling.",
  "imageryAndVoice": "2-4 sentences on imagery, diction, tone, argument, and poetic force.",
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "weaknesses": ["specific weakness 1", "specific weakness 2", "specific weakness 3"],
  "revisionPriorities": ["specific revision priority 1", "specific revision priority 2", "specific revision priority 3"],
  "confidence": "low"
}

Set confidence to "low", "medium", or "high". Be candid, specific, and concise.`;
}

function parseJsonObject(text: string): unknown {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  return JSON.parse(jsonMatch[0]);
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function readConfidence(value: unknown): AnalysisConfidence {
  return value === 'low' || value === 'medium' || value === 'high' ? value : 'low';
}

function parseDeepAnalysisReport(text: string, styleName: string): DeepVerseAnalysisReport {
  const parsed = parseJsonObject(text);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Model did not return a JSON object.');
  }

  const record = parsed as Record<string, unknown>;
  return {
    styleName,
    overallAssessment: readString(
      record.overallAssessment,
      'The model did not provide an overall assessment.',
    ),
    formalReading: readString(
      record.formalReading,
      'The model did not provide a formal reading.',
    ),
    imageryAndVoice: readString(
      record.imageryAndVoice,
      'The model did not provide an imagery and voice reading.',
    ),
    strengths: readStringArray(record.strengths),
    weaknesses: readStringArray(record.weaknesses),
    revisionPriorities: readStringArray(record.revisionPriorities),
    confidence: readConfidence(record.confidence),
  };
}

export const runDeepAnalysis = internalAction({
  args: {
    analysisId: v.id('poemDeepAnalyses'),
    poemId: v.id('poems'),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.deepPoemAnalyses.markDeepAnalysisGenerating, {
      analysisId: args.analysisId,
    });

    try {
      const poem = await ctx.runQuery(internal.deepPoemAnalyses.getForDeepAnalysis, {
        poemId: args.poemId,
      });
      if (!poem || poem.status !== 'complete') {
        throw new Error('Poem is not complete.');
      }

      const { text } = await generateText({
        model: DEEP_ANALYSIS_MODEL_CONFIG.model,
        maxOutputTokens: DEEP_ANALYSIS_MODEL_CONFIG.maxOutputTokens,
        temperature: DEEP_ANALYSIS_MODEL_CONFIG.temperature,
        system:
          'You are a precise literary critic. You analyze poems with generosity, candor, and technical specificity. Return valid JSON only.',
        prompt: buildDeepAnalysisPrompt(poem),
      });

      const report = parseDeepAnalysisReport(text, poem.styleName);
      await ctx.runMutation(internal.deepPoemAnalyses.storeDeepAnalysis, {
        analysisId: args.analysisId,
        reportJson: JSON.stringify(report),
      });
    } catch (error) {
      await ctx.runMutation(internal.deepPoemAnalyses.setDeepAnalysisError, {
        analysisId: args.analysisId,
        error: error instanceof Error ? error.message : 'Deep analysis failed.',
      });
    }
  },
});
