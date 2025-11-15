"use client"

import { Sparkles, TrendingUp, Clock, Star, Users } from 'lucide-react'

export type FilterType = "all" | "tribe" | "new" | "older" | "starred"

interface TokenFiltersProps {
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
  starredCount?: number
}

export default function TokenFilters({ activeFilter, onFilterChange, starredCount = 0 }: TokenFiltersProps) {
  const filters = [
    { 
      id: "all" as FilterType, 
      label: "All Tokens", 
      icon: Sparkles,
      bgClass: "bg-primary hover:bg-primary/90",
      textClass: "text-primary-foreground",
      activeBorder: "ring-2 ring-primary ring-offset-2"
    },
    { 
      id: "tribe" as FilterType, 
      label: "Tribe-Oriented", 
      icon: Users,
      bgClass: "bg-gray-300 hover:bg-gray-400",
      textClass: "text-gray-900",
      activeBorder: "ring-2 ring-gray-500 ring-offset-2"
    },
    { 
      id: "new" as FilterType, 
      label: "New Tokens", 
      icon: TrendingUp,
      bgClass: "bg-gradient-to-r from-orange-400 to-green-500 hover:from-orange-500 hover:to-green-600",
      textClass: "text-white",
      activeBorder: "ring-2 ring-orange-500 ring-offset-2"
    },
    { 
      id: "older" as FilterType, 
      label: "Older Tokens", 
      icon: Clock,
      bgClass: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
      textClass: "text-white",
      activeBorder: "ring-2 ring-purple-600 ring-offset-2"
    },
    { 
      id: "starred" as FilterType, 
      label: "Starred", 
      icon: Star, 
      count: starredCount,
      bgClass: "bg-yellow-200 hover:bg-yellow-300",
      textClass: "text-yellow-900",
      activeBorder: "ring-2 ring-yellow-500 ring-offset-2"
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
      {filters.map((filter) => {
        const Icon = filter.icon
        const isActive = activeFilter === filter.id

        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`
              flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all
              ${filter.bgClass} ${filter.textClass}
              ${isActive ? filter.activeBorder : ""}
            `}
          >
            <Icon className="w-4 h-4" />
            {filter.label}
            {filter.count !== undefined && filter.count > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-black/10">
                {filter.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
