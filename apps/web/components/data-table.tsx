import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

interface DataTableProps {
  title: string
  data: any[]
  columns: {
    header: string
    accessorKey: string
    cell?: (value: any) => React.ReactNode
  }[]
}

export function DataTable({ title, data, columns }: DataTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b transition-colors hover:bg-muted/50">
                {columns.map((column) => (
                  <th key={column.accessorKey} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                  {columns.map((column) => (
                    <td key={column.accessorKey} className="p-4 align-middle">
                      {column.cell ? column.cell(row[column.accessorKey]) : row[column.accessorKey]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
} 