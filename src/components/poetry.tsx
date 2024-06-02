import { Button } from "@/components/ui/button"
import { PopoverTrigger, PopoverContent, Popover } from "@/components/ui/popover"
import { IPoetryComponentProps } from "@/types/poetry"

const Poetry: React.FC<IPoetryComponentProps> = (props) => {
  const { title, lines, styleName, styleExplanation, ttl } = props;
  console.log(`ttl in poetry: ${ttl}`)
  return (
    <div className="w-full p-12 bg-white dark:bg-gray-950">
      <article className="prose prose-gray max-w-3xl mx-auto dark:prose-invert">
        <div className="flex items-center">
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl pr-2">{props.title}</h1>
          <Popover>
            <PopoverTrigger asChild>
              <Button className="rounded-full" size="icon" variant="ghost">
                <InfoIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 ml-2">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">{props.styleName}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {props.styleExplanation}
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <br />
        <div className="space-y-4">
          {lines.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </article>
    </div>
  )
}

function InfoIcon(props: any) {
  return (
    <svg
      {...props}
      className="w-4 h-4"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}

export default Poetry;