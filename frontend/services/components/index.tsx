// Shared Components untuk semua HRIS Frontend Apps
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

/* ===============================
   KPI CARD
================================ */
export interface KPICardProps {
  title: string
  value: number
  icon: LucideIcon
  color: string
  bgGradient: string
  description: string
}

export const KPICard = ({
  title,
  value,
  icon: Icon,
  color,
  bgGradient,
  description,
}: KPICardProps) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {value.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>
        <div className={`p-3 rounded-lg ${bgGradient}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  )
}

/* ===============================
   ACTIVITY ITEM
================================ */
export interface ActivityItemProps {
  activity: string
  time: string
  type: 'create' | 'update' | 'view' | 'delete'
  icon?: LucideIcon
}

export const ActivityItem = ({
  activity,
  time,
  type,
  icon: CustomIcon,
}: ActivityItemProps) => {
  const getTypeColor = () => {
    switch (type) {
      case 'create':
        return 'bg-emerald-100 text-emerald-600'
      case 'update':
        return 'bg-amber-100 text-amber-600'
      case 'delete':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-indigo-100 text-indigo-600'
    }
  }

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
      <div className={`p-2 rounded-full mt-1 ${getTypeColor()}`}>
        {CustomIcon ? <CustomIcon size={16} /> : null}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-900 font-medium">{activity}</p>
        <p className="text-xs text-slate-500 mt-1">{time}</p>
      </div>
    </div>
  )
}

/* ===============================
   LOADING SPINNER
================================ */
export const LoadingSpinner = ({
  message = 'Memuat data...',
}: {
  message?: string
}) => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-600">{message}</span>
      </div>
    </div>
  )
}

/* ===============================
   EMPTY STATE
================================ */
export interface EmptyStateProps {
  icon: LucideIcon
  message: string
  description?: string
}

export const EmptyState = ({
  icon: Icon,
  message,
  description,
}: EmptyStateProps) => {
  return (
    <div className="text-center py-8">
      <Icon size={48} className="mx-auto text-slate-300 mb-4" />
      <p className="text-slate-500 font-medium">{message}</p>
      {description && (
        <p className="text-sm text-slate-400 mt-1">{description}</p>
      )}
    </div>
  )
}

/* ===============================
   STATUS BADGE
================================ */
export interface StatusBadgeProps {
  status: string
  variant?: 'success' | 'warning' | 'danger' | 'info'
}

export const StatusBadge = ({
  status,
  variant = 'info',
}: StatusBadgeProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-100 text-emerald-800'
      case 'warning':
        return 'bg-amber-100 text-amber-800'
      case 'danger':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVariantClasses()}`}
    >
      {status}
    </span>
  )
}

/* ===============================
   SEARCH BOX
================================ */
export interface SearchBoxProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  icon?: LucideIcon
}

export const SearchBox = ({
  placeholder = 'Cari...',
  value,
  onChange,
  icon: SearchIcon,
}: SearchBoxProps) => {
  return (
    <div className="flex-1 relative">
      {SearchIcon ? (
        <SearchIcon
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      ) : null}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${
          SearchIcon ? 'pl-10' : 'pl-4'
        } pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
      />
    </div>
  )
}

/* ===============================
   MODAL
================================ */
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) => {
  if (!isOpen) return null

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm'
      case 'lg':
        return 'max-w-2xl'
      default:
        return 'max-w-md'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`bg-white rounded-lg w-full ${getSizeClass()} mx-4`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

/* ===============================
   BUTTON
================================ */
export interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  icon?: LucideIcon
}

export const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  icon: Icon,
}: ButtonProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-slate-200 hover:bg-slate-300 text-slate-700'
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white'
      default:
        return 'bg-emerald-600 hover:bg-emerald-700 text-white'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm'
      case 'lg':
        return 'px-6 py-3 text-base'
      default:
        return 'px-4 py-2 text-sm'
    }
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex items-center gap-2 font-medium rounded-lg transition-colors',
        getVariantClasses(),
        getSizeClasses(),
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
    >
      {Icon ? (
        <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      ) : null}
      {children}
    </button>
  )
}