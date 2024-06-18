'use client';

import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import generateUserPoem from '@/app/actions';

export default function UserGen({ styles, poemIds }: any) {
  const router = useRouter();
  const [formError, setFormError] = useState('');

  const action = async (formData: FormData) => {
    const topic = formData.get('topic');
    const style = formData.get('style');

    const { error } = await generateUserPoem({ topic, style });

    if (error) {
      setFormError(error);
    }
  };

  const showRandomPoem = () => {
    const randomPoem = poemIds[Math.floor(Math.random() * poemIds.length)];
    router.push(`/poems/${randomPoem.id}`);
  };

  return (
    <section>
      <Card className='border-0 shadow-none'>
        <CardHeader className='text-center'>
          <CardTitle>Generate a Poem</CardTitle>
          <CardDescription>Provide a topic and select a poetic style to generate a poem. Note that generated poems will be public.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <form className='space-y-4' action={action}>
            <Input
              type='text'
              name='topic'
              placeholder='Enter a topic'
              required
            />
            <Select name='style' required>
              <SelectTrigger>
                <SelectValue placeholder='Select a style' />
              </SelectTrigger>
              <SelectContent className='z-50'>
                {styles.map((style: any) => (
                  <SelectItem key={style.id} value={style.name}>{style.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <SubmitButton />
            {formError && (
              <div className='bg-red-800 text-white p-4 rounded-md'>{formError}</div>
            )}
          </form>
          <div className='text-center'>
              <h2>OR</h2>
            </div>
          <Button variant='secondary' type='button' className='btn w-full' onClick={showRandomPoem}>
                I&apos;M FEELING PLUCKY!
            </Button>
        </CardContent>
      </Card>
    </section>
  );
}

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ?
        <Button disabled className='btn w-full'>
          <Loader2 className='mr-2 animate-spin' />
          HANG TIGHT
        </Button> :
        <Button variant='default' type='submit' className='btn w-full z-40'>
          GENERATE A NEW POEM
        </Button>
      }
    </>
  );
};