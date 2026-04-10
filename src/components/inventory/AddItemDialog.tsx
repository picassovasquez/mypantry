import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Item, ItemLocation } from '@/types'
import { useInventoryStore } from '@/lib/store'

interface FormValues {
  name: string
  location: ItemLocation
  quantity: string
  unit: string
}

const LOCATIONS: ItemLocation[] = ['fridge', 'pantry', 'freezer']
const UNITS = ['g', 'kg', 'ml', 'L', 'oz', 'lbs', 'count', 'cups', 'tbsp', 'tsp']

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 placeholder:text-muted-foreground'

const labelClass = 'block text-sm font-medium mb-1'

export function AddItemDialog() {
  const [open, setOpen] = useState(false)
  const addItem = useInventoryStore((s) => s.addItem)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { location: 'pantry', unit: 'g' } })

  const onSubmit = (data: FormValues) => {
    const now = new Date().toISOString()
    const item: Item = {
      id: crypto.randomUUID(),
      household_id: 'h1',
      name: data.name.trim(),
      location: data.location,
      category: '',
      quantity: parseFloat(data.quantity),
      unit: data.unit.trim(),
      min_quantity: 0,
      expiry_date: null,
      created_at: now,
      updated_at: now,
    }
    addItem(item)
    toast.success(`${item.name} added to ${item.location}`)
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="h-4 w-4" />
        Add item
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Name */}
          <div>
            <label className={labelClass}>Name</label>
            <input
              className={inputClass}
              placeholder="e.g. Whole milk"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          {/* Location */}
          <div>
            <label className={labelClass}>Location</label>
            <select className={inputClass} {...register('location', { required: true })}>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc.charAt(0).toUpperCase() + loc.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Quantity + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Quantity</label>
              <input
                type="number"
                step="any"
                min="0"
                className={inputClass}
                placeholder="0"
                {...register('quantity', {
                  required: 'Required',
                  min: { value: 0, message: 'Must be ≥ 0' },
                })}
              />
              {errors.quantity && <p className="text-xs text-destructive mt-1">{errors.quantity.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Unit</label>
              <select className={inputClass} {...register('unit', { required: true })}>
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter showCloseButton>
            <Button onClick={handleSubmit(onSubmit)}>Add item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
