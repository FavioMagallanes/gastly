import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import {
  Add01Icon,
  ArchiveIcon,
  ArrowDownRight01Icon,
  ArrowUpRight01Icon,
  Bone01Icon,
  BookOpen01Icon,
  Briefcase01Icon,
  Building02Icon,
  Bus01Icon,
  CalculatorIcon,
  Calendar03Icon,
  CalendarCheckIn01Icon,
  Call02Icon,
  Cancel01Icon,
  CreditCardIcon,
  Delete02Icon,
  DollarCircleIcon,
  Download01Icon,
  DropletIcon,
  Edit02Icon,
  FireIcon,
  FlashIcon,
  GameController01Icon,
  HeartAddIcon,
  Home01Icon,
  InformationCircleIcon,
  Invoice01Icon,
  Logout01Icon,
  MoneyAdd02Icon,
  Moon02Icon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
  PiggyBankIcon,
  ReceiptDollarIcon,
  ReloadIcon,
  Restaurant01Icon,
  Settings02Icon,
  Share01Icon,
  Shield01Icon,
  ShoppingBasket02Icon,
  Sun03Icon,
  Tick02Icon,
  TShirtIcon,
  UnfoldMoreIcon,
  Wifi01Icon,
} from '@hugeicons/core-free-icons'

/** Claves usadas por la app y por `CATEGORIES` en `types`. */
const iconMap = {
  'receipt-dollar': ReceiptDollarIcon,
  cancel: Cancel01Icon,
  close: Cancel01Icon,
  calendar: Calendar03Icon,
  edit: Edit02Icon,
  'pencil-edit': PencilEdit02Icon,
  delete: Delete02Icon,
  add: Add01Icon,
  check: Tick02Icon,
  'calendar-check': CalendarCheckIn01Icon,
  calculator: CalculatorIcon,
  'money-add-02': MoneyAdd02Icon,
  clean: ReloadIcon,
  sun: Sun03Icon,
  moon: Moon02Icon,
  logout: Logout01Icon,
  archive: ArchiveIcon,
  download: Download01Icon,
  share: Share01Icon,
  shopping: ShoppingBasket02Icon,
  home: Home01Icon,
  cloth: TShirtIcon,
  tshirt: TShirtIcon,
  work: Briefcase01Icon,
  education: BookOpen01Icon,
  car: Bus01Icon,
  food: Restaurant01Icon,
  other: Settings02Icon,
  info: InformationCircleIcon,
  'trending-down': ArrowDownRight01Icon,
  'trending-up': ArrowUpRight01Icon,
  'unfold-more': UnfoldMoreIcon,
  building: Building02Icon,
  bolt: FlashIcon,
  fire: FireIcon,
  droplet: DropletIcon,
  wifi: Wifi01Icon,
  phone: Call02Icon,
  shield: Shield01Icon,
  'shopping-cart': ShoppingBasket02Icon,
  utensils: Restaurant01Icon,
  bus: Bus01Icon,
  heart: HeartAddIcon,
  book: BookOpen01Icon,
  paw: Bone01Icon,
  gamepad: GameController01Icon,
  'credit-card': CreditCardIcon,
  'dollar-sign': DollarCircleIcon,
  'piggy-bank': PiggyBankIcon,
  'file-invoice-dollar': Invoice01Icon,
  'dots-horizontal': MoreHorizontalIcon,
} as const satisfies Record<string, IconSvgElement>

export type IconName = keyof typeof iconMap

interface IconProps {
  name: string
  size?: 'sm' | 'base' | 'xl'
  className?: string
}

export const Icon = ({ name, size = 'base', className = '' }: IconProps) => {
  const icon = iconMap[name as IconName] ?? iconMap.other
  const sizeMap = { sm: 14, base: 16, xl: 20 } as const
  const sizeInPixels = sizeMap[size] ?? 16

  return (
    <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
      <HugeiconsIcon
        icon={icon}
        size={sizeInPixels}
        color="currentColor"
        strokeWidth={1.75}
        className="shrink-0"
      />
    </span>
  )
}
