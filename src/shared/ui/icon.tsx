import {
  ReceiptText,
  X,
  Calendar,
  Pencil,
  Trash2,
  Plus,
  Check,
  Sun,
  Moon,
  LogOut,
  Archive,
  Download,
  Share2,
  ShoppingBag,
  Home,
  Shirt,
  Briefcase,
  BookOpen,
  Car,
  Utensils,
  Settings,
  RefreshCcw,
  Calculator,
  CalendarCheck,
} from 'lucide-react'

// Mapeo estricto de iconos
const iconMap = {
  'receipt-dollar': ReceiptText,
  cancel: X,
  close: X,
  calendar: Calendar,
  edit: Pencil,
  delete: Trash2,
  add: Plus,
  check: Check,
  'calendar-check': CalendarCheck,
  calculator: Calculator,
  clean: RefreshCcw,
  sun: Sun,
  moon: Moon,
  logout: LogOut,
  archive: Archive,
  download: Download,
  share: Share2,
  shopping: ShoppingBag,
  home: Home,
  cloth: Shirt,
  work: Briefcase,
  education: BookOpen,
  car: Car,
  food: Utensils,
  other: Settings,
}

interface IconProps {
  name: string
  size?: 'sm' | 'base' | 'xl'
  className?: string
}

export const Icon = ({ name, size = 'base', className = '' }: IconProps) => {
  // Aceptamos string y verificamos existencia contra el map
  const LucideIcon = iconMap[name as keyof typeof iconMap] || iconMap.other
  const sizeMap = { sm: 14, base: 16, xl: 20 }

  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      <LucideIcon size={sizeMap[size as keyof typeof sizeMap] || 16} strokeWidth={2} />
    </span>
  )
}
