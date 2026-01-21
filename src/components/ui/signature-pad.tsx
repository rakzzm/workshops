"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Eraser, Check } from "lucide-react"

interface SignaturePadProps {
    onSave: (dataUrl: string) => void
    initialData?: string
    width?: number
    height?: number
}

export function SignaturePad({ onSave, initialData, width = 400, height = 200 }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [isEmpty, setIsEmpty] = useState(!initialData)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
            ctx.lineWidth = 2
            ctx.lineCap = 'round'
            ctx.strokeStyle = 'black'
            
            // If initial data exists, load it
            if (initialData) {
                const img = new Image()
                img.onload = () => ctx.drawImage(img, 0, 0)
                img.src = initialData
            }
        }
    }, [initialData])

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true)
        setIsEmpty(false)
        const canvas = canvasRef.current
        if (!canvas) return
        
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        
        const { x, y } = getCoordinates(e, canvas)
        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return
        const canvas = canvasRef.current
        if (!canvas) return
        
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        
        const { x, y } = getCoordinates(e, canvas)
        ctx.lineTo(x, y)
        ctx.stroke()
    }

    const stopDrawing = () => {
        setIsDrawing(false)
        const canvas = canvasRef.current
        if (canvas) {
            // Auto save on stop? Or manual save button?
            // Manual is safer for intent
        }
    }

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect()
        let clientX, clientY
        
        if ('touches' in e) {
            clientX = e.touches[0].clientX
            clientY = e.touches[0].clientY
        } else {
            clientX = (e as React.MouseEvent).clientX
            clientY = (e as React.MouseEvent).clientY
        }
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        }
    }

    const clear = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setIsEmpty(true)
    }

    const handleSave = () => {
        if (isEmpty) return
        const canvas = canvasRef.current
        if (!canvas) return
        const dataUrl = canvas.toDataURL('image/png')
        onSave(dataUrl)
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="border border-slate-300 rounded-md overflow-hidden bg-white touch-none">
                <canvas 
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="cursor-crosshair w-full"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>
            <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={clear} type="button">
                    <Eraser className="w-4 h-4 mr-2" /> Clear
                </Button>
                <Button onClick={handleSave} size="sm" type="button" disabled={isEmpty}>
                    <Check className="w-4 h-4 mr-2" /> Save Signature
                </Button>
            </div>
        </div>
    )
}
