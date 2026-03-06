'use client';

import { useId } from 'react';
import { StyleConfig } from '../../convex/stylesConfig';

interface PoemFormFieldsProps {
  topic: string;
  onTopicChange: (value: string) => void;
  styleName: string;
  onStyleNameChange: (value: string) => void;
  styles: StyleConfig[];
  disabled?: boolean;
  topicInvalid?: boolean;
  styleInvalid?: boolean;
  autoFocusTopic?: boolean;
}

export default function PoemFormFields({
  topic,
  onTopicChange,
  styleName,
  onStyleNameChange,
  styles,
  disabled = false,
  topicInvalid = false,
  styleInvalid = false,
  autoFocusTopic = false,
}: PoemFormFieldsProps) {
  const topicId = useId();
  const styleId = useId();

  return (
    <>
      <div className='space-y-2'>
        <label
          htmlFor={topicId}
          className='block text-sm font-semibold text-[var(--text-primary)]'
        >
          Topic
        </label>
        <input
          id={topicId}
          type='text'
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          placeholder='e.g. coffee, wild horses, Oxford commas…'
          required
          aria-required='true'
          aria-invalid={topicInvalid ? 'true' : 'false'}
          disabled={disabled}
          autoFocus={autoFocusTopic}
          className='input-field'
        />
      </div>

      <div className='space-y-2'>
        <label
          htmlFor={styleId}
          className='block text-sm font-semibold text-[var(--text-primary)]'
        >
          Poetic Form
        </label>
        <select
          id={styleId}
          value={styleName}
          onChange={(e) => onStyleNameChange(e.target.value)}
          required
          aria-required='true'
          aria-invalid={styleInvalid ? 'true' : 'false'}
          disabled={disabled}
          className='input-field select-field'
        >
          <option value='' disabled>
            Select a form…
          </option>
          {styles.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
