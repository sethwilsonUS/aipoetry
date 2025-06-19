'use client';

import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [selectedStyle, setSelectedStyle] = useState('');

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
            <div className='space-y-2'>
              <Label htmlFor='topic-input'>Topic</Label>
              <Input
                id='topic-input'
                type='text'
                name='topic'
                placeholder='Enter a topic'
                required
                aria-describedby='topic-help'
              />
              <p id='topic-help' className='sr-only'>
                Enter the topic you'd like your poem to be about
              </p>
            </div>
            
            <div className='space-y-2'>
              <Label htmlFor='style-select'>Poetic Style</Label>
              <Select 
                name='style' 
                required 
                onValueChange={(value) => setSelectedStyle(value)}
              >
                <SelectTrigger 
                  id='style-select' 
                  tabIndex={0} 
                  aria-describedby='style-help'
                  aria-label={selectedStyle || 'Select a poetic style'}
                >
                  <SelectValue placeholder='Select a style' />
                </SelectTrigger>
                <SelectContent
                  ref={(ref) =>
                    // temporary workaround from https://github.com/shadcn-ui/ui/issues/1220
                    ref?.addEventListener('touchend', (e) =>
                      e.preventDefault(),
                    )
                  }
                >
                  {styles.map((style: any) => (
                    <SelectItem 
                      key={style.id} 
                      value={style.name}
                      aria-label={`Select ${style.name} style`}
                    >
                      {style.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p id='style-help' className='sr-only'>
                Choose the poetic style for your generated poem
              </p>
            </div>
            
            <SubmitButton />
            
            {formError && (
              <div className='bg-red-800 text-white p-4 rounded-md' role='alert' aria-live='polite'>
                {formError}
              </div>
            )}
            
            <div className='text-center'>
              <h2 className='text-lg font-medium mb-2'>OR</h2>
            </div>
            
            <Button 
              variant='secondary' 
              type='button' 
              className='btn w-full' 
              onClick={showRandomPoem}
              tabIndex={0}
              aria-describedby='random-help'
            >
              I&apos;M FEELING PLUCKY!
            </Button>
            <p id='random-help' className='sr-only'>
              Click to view a randomly selected poem from our collection
            </p>
          </form>
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
        <Button disabled className='btn w-full' tabIndex={0}>
          <Loader2 className='mr-2 animate-spin' />
          HANG TIGHT
        </Button> :
        <Button variant='default' type='submit' className='btn w-full z-40' tabIndex={0}>
          GENERATE A NEW POEM
        </Button>
      }
    </>
  );
};