import Link from 'next/link'
import { TableHead, TableRow, TableHeader, TableBody, TableCell, Table } from '@/components/ui/table'
import { getPoemTitles } from '@/lib/supabase';

const PoemsList = async () => {
  const poemTitles = await getPoemTitles() as any;

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[75%]">Poem Title</TableHead>
            <TableHead className="w-[25%]">Poem Style</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {poemTitles.map((poem: any) => (
            <TableRow key={poem.id}>
              <TableCell className="font-medium">
                <Link href={`/poems/${poem.id}`} prefetch={false}>
                  {poem.title}
                </Link>
              </TableCell>
              <TableCell>{poem.style.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default PoemsList;
