import { useMemo } from 'react'
import { Package, AlertTriangle, ShoppingCart, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InventoryTable } from '@/components/inventory/InventoryTable'
import { AddItemDialog } from '@/components/inventory/AddItemDialog'
import { VoiceAddDialog } from '@/components/inventory/VoiceAddDialog'
import { getItemStatus } from '@/types'
import { useInventoryStore } from '@/lib/store'

function MetricCard({
  title, value, icon: Icon, description,
}: {
  title: string
  value: number
  icon: React.ElementType
  description: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

export function Dashboard() {
  const items = useInventoryStore((s) => s.items)

  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const soon = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    return {
      total:    items.length,
      low:      items.filter(i => getItemStatus(i) === 'low').length,
      critical: items.filter(i => getItemStatus(i) === 'critical').length,
      expiring: items.filter(i => i.expiry_date && i.expiry_date >= today && i.expiry_date <= soon).length,
    }
  }, [items])

  const alerts = items.filter(i => getItemStatus(i) !== 'good')

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard title="Total items"    value={metrics.total}    icon={Package}       description="across all locations" />
        <MetricCard title="Low stock"      value={metrics.low}      icon={AlertTriangle} description="below threshold" />
        <MetricCard title="Critical"       value={metrics.critical} icon={AlertTriangle} description="almost out" />
        <MetricCard title="Expiring soon"  value={metrics.expiring} icon={Clock}         description="within 3 days" />
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Stock alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {alerts.map(item => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.name}</span>
                  <span className="text-muted-foreground">{item.quantity} {item.unit} remaining</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Inventory table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory
          </CardTitle>
          <div className="flex gap-2">
            <VoiceAddDialog />
            <AddItemDialog />
          </div>
        </CardHeader>
        <CardContent>
          <InventoryTable items={items} />
        </CardContent>
      </Card>

      {/* Shopping list preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Shopping list
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {metrics.low + metrics.critical} item(s) need restocking. Visit the shopping page to manage your list.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
