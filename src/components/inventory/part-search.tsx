"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { searchParts } from "@/app/actions/part-search-actions"

// Simple debounce hook implementation if not available
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface PartSearchProps {
  onSelect: (part: any) => void
  onBlur?: () => void
  placeholder?: string
}

export function PartSearch({ onSelect, onBlur, placeholder }: PartSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  
  const debouncedQuery = useDebounceValue(query, 300)

  useEffect(() => {
    async function search() {
      if (debouncedQuery.length < 2) {
        setResults([])
        return
      }
      setLoading(true)
      try {
        const data = await searchParts(debouncedQuery)
        setResults(data)
        setIsOpen(true)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    search()
  }, [debouncedQuery])

  // Click outside to close
  useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
          if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
              setIsOpen(false)
              if (onBlur) onBlur()
          }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onBlur]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
        <Input 
          className="h-7 pl-8 text-xs bg-white focus:bg-white"
          placeholder={placeholder || "Search Part by Name or SKU..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true) }}
        />
        {loading && <Loader2 className="absolute right-2 top-2 h-3 w-3 animate-spin text-muted-foreground" />}
      </div>
      
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
           {results.map((part) => (
             <div 
                key={part.id}
                className="p-2 hover:bg-slate-100 cursor-pointer text-xs border-b border-slate-50 last:border-0"
                onClick={() => {
                    onSelect(part)
                    setQuery(part.name) // Or clear? Let's keep name
                    setIsOpen(false)
                }}
             >
                <div className="font-semibold">{part.name}</div>
                <div className="flex justify-between text-[10px] text-slate-500">
                    <span>SKU: {part.sku}</span>
                    <span>Stock: <span className={part.stock > 0 ? "text-green-600 font-bold" : "text-red-500 font-bold"}>{part.stock}</span></span>
                    <span>₹{part.price}</span>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  )
}
