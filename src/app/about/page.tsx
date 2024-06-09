import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const About: React.FC = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12">
      <div className="flex flex-col z-10 w-full max-w-4xl justify-between lg:flex">
        <div className="w-full p-4 lg:p-12 bg-white dark:bg-gray-900">
          <article className="prose prose-gray max-w-3xl mx-auto dark:prose-invert">
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl pr-2">About Infinite Poetry</h1>
            <br />
            <p>Everything you wanted to know about Infinite Poetry--but were afraid to ask!</p>
            <br />
            <hr />
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>What is Infinite Poetry?</AccordionTrigger>
                <AccordionContent>
                  Infinite Poetry uses AI (currently ChatGPT 4o) togenerate a new AI poem, on a random topic, in a random style, every hour.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Why AI poetry?</AccordionTrigger>
                <AccordionContent>
                  Let me be crystal clear from the outset. I do not want this tool to replace flesh-and-blood poets, nor do I think it ever could. Have you seen some of the poems this thing dreams up? Instead, I want to use this as a learning lab to discover more about poetry and about AI itself. First, can AI teach us anything about existing verse forms? The very AI quirks that aggravate the mainstream may very well show us something new and interesting about poetry. Or they may not. On the flip side, poetry requires an immense level of creativity, lateral thinking, and diction. AI can only achieve simulacra of those things, but can we learn anything about how AI attempts to do this by analyzing its poetry?
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Why only one poem per hour?</AccordionTrigger>
                <AccordionContent>
                  Those of you using the free version of ChatGPT or other LLMs may be surprised to learn that using LLMs cost money. Someone, even if it&apos;s not you, is paying for these intensive computations. In this case, that someone is me, and since this is only a hobby project for now, I don’t want to invest too heavily.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>My poem&apos;s got gibberish in it!</AccordionTrigger>
                <AccordionContent>
                  I am constantly tweaking various settings related to the model. In particular, I&apos;m experimenting with the temperature, which dictates how &quot;creative&quot; or &quot;experimental&quot; the model is allowed to be. For now, I err on the side of giving the model more leeway, which means these lapses will happen from time to time. Just have a good laugh and wait for the next poem.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>I want to get involved!</AccordionTrigger>
                <AccordionContent>
                  Cool! I would love for others to get involved in this project. For general ideas, criticism, kudos, and so forth, please see my LinkedIn profile and get in touch. I&apos;d especially love hearing from other literary types with cool ideas. For the developers among you, feel free to clone the GitHub repository and contribute some code.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6">
                <AccordionTrigger>About the Author</AccordionTrigger>
                <AccordionContent>
                  Hi, I’m Seth Wilson! I&apos;m a legally blind software developer living in Tyler Texas. I’ve been working in the tech industry for around 7 years now, if you start the clock when I enrolled in an MS in Computer Science at the University of Texas, Tyler. Before that I lived in the world of academia, earning an Ms.C. in Medieval History from Oxford University in 2006 and an MA in English from UT Tyler in 2016. So I live at the intersection of the arts and sciences: jack of all trades, master of none.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </article>
        </div>
      </div>
    </main>
  );
}

export default About;