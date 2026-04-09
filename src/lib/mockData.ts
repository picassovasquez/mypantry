import type { Item, ShoppingListItem } from '@/types'

export const mockItems: Item[] = [
  { id: '1', household_id: 'h1', name: 'Whole milk',     quantity: 0.5, unit: 'L',     location: 'fridge',  category: 'dairy',   min_quantity: 2,  expiry_date: '2026-04-12', created_at: '', updated_at: '' },
  { id: '2', household_id: 'h1', name: 'Cheddar cheese', quantity: 250, unit: 'g',     location: 'fridge',  category: 'dairy',   min_quantity: 200, expiry_date: null,         created_at: '', updated_at: '' },
  { id: '3', household_id: 'h1', name: 'Eggs',           quantity: 4,   unit: 'count', location: 'fridge',  category: 'dairy',   min_quantity: 12, expiry_date: null,         created_at: '', updated_at: '' },
  { id: '4', household_id: 'h1', name: 'Bread',          quantity: 1,   unit: 'count', location: 'pantry',  category: 'grains',  min_quantity: 1,  expiry_date: '2026-04-10', created_at: '', updated_at: '' },
  { id: '5', household_id: 'h1', name: 'Olive oil',      quantity: 400, unit: 'ml',    location: 'pantry',  category: 'oils',    min_quantity: 250, expiry_date: null,        created_at: '', updated_at: '' },
  { id: '6', household_id: 'h1', name: 'Pasta',          quantity: 500, unit: 'g',     location: 'pantry',  category: 'grains',  min_quantity: 400, expiry_date: null,        created_at: '', updated_at: '' },
  { id: '7', household_id: 'h1', name: 'Chicken breast', quantity: 0,   unit: 'g',     location: 'freezer', category: 'protein', min_quantity: 500, expiry_date: null,        created_at: '', updated_at: '' },
  { id: '8', household_id: 'h1', name: 'Peas',           quantity: 800, unit: 'g',     location: 'freezer', category: 'produce', min_quantity: 500, expiry_date: null,        created_at: '', updated_at: '' },
]

export const mockShoppingList: ShoppingListItem[] = [
  { id: 's1', household_id: 'h1', item_name: 'Whole milk',     quantity: 4,  unit: 'L',     checked: false, added_by: null, created_at: '' },
  { id: 's2', household_id: 'h1', item_name: 'Eggs',           quantity: 12, unit: 'count', checked: false, added_by: null, created_at: '' },
  { id: 's3', household_id: 'h1', item_name: 'Chicken breast', quantity: 1,  unit: 'kg',    checked: true,  added_by: null, created_at: '' },
]
