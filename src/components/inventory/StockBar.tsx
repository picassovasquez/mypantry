import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress'
import { type Item, getItemStatus } from '@/types'

interface StockBarProps {
  item: Pick<Item, 'quantity' | 'min_quantity'>
}

export function StockBar({ item }: StockBarProps) {
  const status = getItemStatus(item)
  const pct = item.min_quantity === 0
    ? 100
    : Math.min(100, (item.quantity / item.min_quantity) * 100)

  const color =
    status === 'critical' ? 'bg-red-500' :
    status === 'low'      ? 'bg-yellow-400' :
                            'bg-green-500'

  return (
    <Progress value={pct}>
      <ProgressTrack className="h-2">
        <ProgressIndicator className={color} />
      </ProgressTrack>
    </Progress>
  )
}
