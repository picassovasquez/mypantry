export type ItemLocation = 'fridge' | 'pantry' | 'freezer'
export type ItemStatus = 'good' | 'low' | 'critical'
export type HouseholdRole = 'owner' | 'member'

export interface Household {
  id: string
  name: string
  created_at: string
}

export interface HouseholdMember {
  id: string
  household_id: string
  user_id: string
  role: HouseholdRole
  joined_at: string
}

export interface Item {
  id: string
  household_id: string
  name: string
  quantity: number
  unit: string
  location: ItemLocation
  category: string
  min_quantity: number
  expiry_date: string | null
  created_at: string
  updated_at: string
}

export interface ShoppingListItem {
  id: string
  household_id: string
  item_name: string
  quantity: number
  unit: string
  checked: boolean
  added_by: string | null
  created_at: string
}

/** Derived status based on quantity vs min_quantity */
export function getItemStatus(item: Pick<Item, 'quantity' | 'min_quantity'>): ItemStatus {
  const { quantity, min_quantity } = item
  if (min_quantity === 0) return 'good'
  if (quantity < min_quantity * 0.25) return 'critical'
  if (quantity < min_quantity) return 'low'
  return 'good'
}
