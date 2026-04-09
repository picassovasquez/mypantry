import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { type Item, getItemStatus } from '@/types'
import { StockBar } from './StockBar'

interface InventoryTableProps {
  items: Item[]
}

const statusLabel = { good: 'Good', low: 'Low', critical: 'Critical' } as const
const statusVariant = {
  good:     'default',
  low:      'outline',
  critical: 'destructive',
} as const

export function InventoryTable({ items }: InventoryTableProps) {
  if (items.length === 0) {
    return <p className="text-muted-foreground text-sm py-6 text-center">No items found.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead className="w-36">Stock level</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const status = getItemStatus(item)
          return (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="capitalize">{item.category}</TableCell>
              <TableCell>{item.quantity} {item.unit}</TableCell>
              <TableCell><StockBar item={item} /></TableCell>
              <TableCell>
                <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
