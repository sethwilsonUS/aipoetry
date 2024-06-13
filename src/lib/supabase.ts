import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export const getPoems = async () => {
  const { data, error } = await supabase.from('poems').select(`
    title,
    text,
    style (
      name,
      description,
      user_explanation,
      number_of_lines
    )
  `);

  if (error) {
    throw error;
  }

  return data;
}

const insertTopic = async (topic: string) => {
  const { error } = await supabase.from('topics').upsert([{
    topic,
  }], { ignoreDuplicates: true, onConflict: 'id, topic'});

  const { data } = await supabase.from('topics').select('id').eq('topic', topic);
  return data![0].id;
}

const insertStyle = async (style: any) => {
  const { error } = await supabase.from('styles').upsert([{
    name: style.name,
    description: style.description,
    user_explanation: style.explanation,
    number_of_lines: style.lines, 
  }], { ignoreDuplicates: true, onConflict: 'id, name'});

  const { data } = await supabase.from('styles').select('id').eq('name', style.name);
  return data![0].id;
}

export const insertPoem = async (poem: any) => {
  const topicId = await insertTopic(poem.topic);
  const styleId = await insertStyle(poem.style);

  const { error } = await supabase.from('poems').insert([{
    title: poem.title,
    text: poem.lines,
    style: styleId,
    topic: topicId,
    temperature: poem.temperature,
    created_by: 1,
    prompt: poem.prompt,
    model: poem.model,
  }]);

  if (error) {
    console.log(error);
  }
}