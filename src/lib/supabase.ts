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
};

export const getPoemTitles = async () => {
  const { data, error } = await supabase.from('poems').select(`
    id,
    title,
    style (
      name
    )
  `);

  if (error) {
    throw error;
  }

  return data;
};

export const getPoem = async (id: number) => {
  const { data, error } = await supabase.from('poems').select(`
    title,
    text,
    style (
      name,
      user_explanation
    )
  `).eq('id', id);

  if (error) {
    throw error;
  }

  return data[0];
};

export const insertTopic = async (topic: string) => {
  const { error } = await supabase.from('topics').upsert([{
<<<<<<< HEAD
    name: topic,
=======
    topic,
>>>>>>> 8ad72f0 (initial sloppy user gen setup)
  }], { ignoreDuplicates: true, onConflict: 'name'});

  if (error) {
    console.log(error);
  }

  const { data } = await supabase.from('topics').select().eq('name', topic).single();
  console.log(`topid data: ${JSON.stringify(data, null, 2)}`);
  return data!;
};

export const insertStyle = async (style: any) => {
  const { error } = await supabase.from('styles').upsert([{
    name: style.name,
    description: style.description,
    user_explanation: style.explanation,
    number_of_lines: style.lines, 
  }], { ignoreDuplicates: true, onConflict: 'name'});

  if (error) {
    console.log(error);
  }
  
  const { data } = await supabase.from('styles').select().eq('name', style.name).single();
  return data;
};

export const insertPoem = async (poem: any) => {
  const topic = await insertTopic(poem.topic);
  const style = await insertStyle(poem.style);

  console.log(`Topic ID: ${topic.id}, Style ID: ${style.id}`);

  const { data, error } = await supabase.from('poems').insert([{
    title: poem.title,
    text: poem.lines,
    style: style.id,
    topic: topic.id,
    temperature: poem.temperature,
    created_by: 1,
    prompt: poem.prompt,
    model: poem.model,
  }]).select('id').single();

  if (error) {
    console.log(error);
  }

  console.log(`Poem ID: ${data!.id}`);
  return data!.id;
};