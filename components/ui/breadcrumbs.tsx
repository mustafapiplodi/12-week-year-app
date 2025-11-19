'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Fragment } from 'react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <Fragment key={index}>
            {index > 0 && <ChevronRight className="h-4 w-4 shrink-0" />}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors truncate max-w-[200px]"
              >
                {item.label}
              </Link>
            ) : (
              <span className={`truncate max-w-[200px] ${isLast ? 'text-foreground font-medium' : ''}`}>
                {item.label}
              </span>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
