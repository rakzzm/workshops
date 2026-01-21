"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { X, Plus, Printer, Save, Trash2, MapPin, Phone, Camera, Upload } from "lucide-react"
import { createService, updateService } from "@/app/actions/service-actions"
import { uploadImage } from "@/app/actions/upload-action"
import { SignaturePad } from "@/components/ui/signature-pad"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface ServiceFormProps {
  vehicles: any[]
  parts: any[]
  mechanics?: any[]
  vendors?: any[]
  initialData?: any
  onClose?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ServiceForm({ vehicles, parts, mechanics = [], vendors = [], initialData, open, onOpenChange, onClose }: ServiceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    vehicleId: initialData?.vehicleId || "",
    // Initialize Manual Fields from selected vehicle or initial data
    regNumber: initialData?.vehicle?.regNumber || "",
    model: initialData?.vehicle?.model || "",
    ownerName: initialData?.vehicle?.ownerName || "",
    ownerPhone: initialData?.vehicle?.ownerPhone || "",
    ownerAddress: initialData?.vehicle?.ownerAddress || "",
    ownerGstin: initialData?.vehicle?.ownerGstin || "",
    chassisNumber: initialData?.vehicle?.chassisNumber || "",
    engineNumber: initialData?.vehicle?.engineNumber || "",
    
    complaint: initialData?.complaint || "",
    mechanicNotes: initialData?.mechanicNotes || "",
    status: initialData?.status || "PENDING",
    odometer: initialData?.odometer || "",
    serviceType: initialData?.serviceType || "General Repair",
    fuelLevel: initialData?.fuelLevel || "50%",
    serviceAdvisor: initialData?.serviceAdvisor || "",
    estimatedDate: initialData?.estimatedDate ? new Date(initialData.estimatedDate).toISOString().split('T')[0] : "",
    mechanicId: initialData?.mechanicId ? initialData.mechanicId.toString() : "",
    images: initialData?.images ? JSON.parse(initialData.images) : [],
    assignedApprover: initialData?.assignedApprover || "",
    submitToJobBoard: false,
    customerSignature: initialData?.customerSignature || "",
    advisorSignature: initialData?.advisorSignature || ""
  })
  
  const [items, setItems] = useState<any[]>(initialData?.parts || [])
  const [showCamera, setShowCamera] = useState(false)
  
  // Signature Modal States
  const [signModalOpen, setSignModalOpen] = useState(false)
  const [signType, setSignType] = useState<'customer' | 'advisor' | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Camera stream handling
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    if (showCamera) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch(err => {
          console.error("Camera access denied:", err)
          alert("Could not access camera. Please allow permissions.")
          setShowCamera(false)
        })
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [showCamera])

  const capturePhoto = async () => {
     if (videoRef.current && canvasRef.current) {
         const video = videoRef.current
         const canvas = canvasRef.current
         const context = canvas.getContext('2d')
         
         if (context) {
             // Set canvas size to match video
             canvas.width = video.videoWidth
             canvas.height = video.videoHeight
             
             // Draw
             context.drawImage(video, 0, 0, canvas.width, canvas.height)
             
             // Convert to Blob/File
             canvas.toBlob(async (blob: Blob | null) => {
                 if (blob) {
                     const file = new File([blob], "camera-capture.png", { type: "image/png" })
                     const fd = new FormData()
                     fd.append('file', file)
                     
                     // Stop stream before upload to be clean
                     const stream = video.srcObject as MediaStream
                     if (stream) stream.getTracks().forEach(t => t.stop())
                     
                     setLoading(true)
                     try {
                         const res = await uploadImage(fd)
                         if (res.success && res.url) {
                              setFormData(prev => ({...prev, images: [...prev.images, res.url]}))
                              setShowCamera(false)
                         } else {
                             alert("Failed to upload capture")
                         }
                     } catch (err) {
                         console.error(err)
                     } finally {
                         setLoading(false)
                     }
                 }
             }, 'image/png')
         }
     }
  }

  // When vehicleId changes, update fields (Auto-fill)
  const handleVehicleSelect = (id: string) => {
      if (id === "_MANUAL_") {
          setFormData({
              ...formData,
              vehicleId: "",
              regNumber: "",
              model: "",
              ownerName: "",
              ownerPhone: "",
              ownerAddress: "",
              ownerGstin: "",
              chassisNumber: "",
              engineNumber: ""
          })
          return
      }

      const v = vehicles.find(v => v.id.toString() === id)
      if (v) {
          setFormData({
              ...formData,
              vehicleId: v.id.toString(),
              regNumber: v.regNumber,
              model: v.model,
              ownerName: v.ownerName || "",
              ownerPhone: v.ownerPhone || "",
              ownerAddress: v.ownerAddress || "",
              ownerGstin: v.ownerGstin || "",
              chassisNumber: v.chassisNumber || "",
              engineNumber: v.engineNumber || ""
          })
      } else {
         setFormData({...formData, vehicleId: id})
      }
  }

  // Unused handlers removed to fix linting. 
  // Logic is currently inline in the render loop.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation: Reg Number is key
    if (!formData.regNumber) {
        alert("Registration Number is required")
        return
    }

    setLoading(true)
    
    try {
        const payload = { ...formData, items }
        let result
        if (initialData) {
            result = await updateService(initialData.id, payload)
        } else {
            result = await createService(payload)
        }
        
        if (result.success) {
            if (onClose) onClose()
            if (onOpenChange) onOpenChange(false)
            router.refresh()
        } else {
            alert(result.error || "Operation failed")
        }
    } catch (e) {
        console.error(e)
        alert("An unexpected error occurred")
    } finally {
        setLoading(false)
    }
  }

  const calculateTotals = () => {
      let subtotal = 0
      let totalTax = 0
      
      const p = (v: any) => parseFloat(v) || 0

      items.forEach(item => {
          const qty = p(item.quantity)
          const rate = p(item.unitPrice)
          const disc = p(item.discountAmount)
          
          const taxable = (qty * rate) - disc
          // Ensure taxable isn't negative
          const safeTaxable = Math.max(0, taxable)
          
          subtotal += safeTaxable
          
          const cA = p(item.cgstAmount)
          const sA = p(item.sgstAmount)
          const kfcA = p(item.cessAmount)
          
          totalTax += (cA + sA + kfcA)
      })
      
      return { subtotal, totalTax, grandTotal: subtotal + totalTax }
  }

  const { subtotal, totalTax, grandTotal } = calculateTotals()

  const currentDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!initialData && (
          <DialogTrigger asChild>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> New Job Card
            </Button>
          </DialogTrigger>
      )}
      <DialogContent className="w-screen h-screen max-w-none sm:max-w-none rounded-none border-none p-0 flex flex-col bg-slate-50 overflow-hidden print:bg-white print:absolute print:top-0 print:left-0 print:w-full print:h-auto print:translate-x-0 print:translate-y-0 print:overflow-visible">
        
        {/* Top Navigation Bar - Hidden in Print */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm flex-none print:hidden">
            <div className="flex items-center gap-4">
                 <Button type="button" variant="ghost" size="sm" onClick={() => {
                     // Robust close logic
                     if (onClose) onClose();
                     if (onOpenChange) onOpenChange(false);
                     // Fallback: If used in a route-based dialog, we might want to go back
                     if (!onClose && !onOpenChange) router.back();
                 }}>
                     <X className="h-5 w-5 mr-2" />
                     Close
                 </Button>
                 <div className="h-6 w-px bg-slate-200"></div>
                 <h2 className="text-lg font-semibold text-slate-800">
                    {initialData ? `Edit Job Card #${initialData.id}` : "New Service Job Card"}
                 </h2>
            </div>
            <div className="flex items-center gap-3">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="hidden sm:flex"
                    onClick={() => window.print()}
                >
                    <Printer className="h-4 w-4 mr-2" /> Print Estimate
                </Button>
                <Button onClick={handleSubmit} disabled={loading} className="bg-primary text-white">
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Job Card"}
                </Button>
            </div>
        </div>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 print:overflow-visible print:h-auto print:p-0 print:static">
            <div className="print-service-card max-w-[96vw] mx-auto bg-white shadow-lg rounded-sm border border-slate-200 min-h-[1000px] flex flex-col print:shadow-none print:border-none print:min-h-0 print:block print:max-w-none">
                
                {/* 1. Header Section */}
                <div className="flex justify-between p-8 border-b-2 border-slate-100 print:p-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">Estimate / Job Card</h1>
                        <div className="mt-4 space-y-1 text-sm text-slate-600">
                            <p className="font-semibold text-lg text-primary">AutoFix Workshop</p>
                            <p className="flex items-center"><MapPin className="h-3 w-3 mr-2" /> 123, Garage Road, Auto City, Kerala</p>
                            <p className="flex items-center"><Phone className="h-3 w-3 mr-2" /> +91 98765 43210</p>
                            <p>GSTIN: 32ABCDE1234F1Z5</p>
                        </div>
                    </div>
                    <div className="text-right space-y-2">
                         <div className="inline-block bg-slate-100 px-4 py-2 rounded text-center min-w-[150px] print:bg-transparent print:border print:border-slate-200">
                            <p className="text-xs text-slate-500 uppercase font-bold">Date</p>
                            <div className="text-lg font-mono font-medium">{currentDate}</div>
                         </div>
                         <div className="inline-block bg-slate-100 px-4 py-2 rounded text-center min-w-[150px] ml-2 print:bg-transparent print:border print:border-slate-200">
                             <p className="text-xs text-slate-500 uppercase font-bold">Service Type</p>
                             <select 
                                className="bg-transparent font-medium text-center outline-none w-full appearance-none"
                                value={formData.serviceType}
                                onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                             >
                                <option>General Repair</option>
                                <option>PMS 1st Free</option>
                                <option>PMS Paid</option>
                                <option>Running Repair</option>
                                <option>Accidental</option>
                             </select>
                         </div>
                         
                         {/* Approver Selection - Only new forms or if not approved yet */}
                         <div className="inline-block bg-blue-50 px-4 py-2 rounded text-center min-w-[150px] ml-2 print:hidden border border-blue-100">
                             <p className="text-xs text-blue-500 uppercase font-bold">Assign Approver</p>
                             <select 
                                className="bg-transparent font-medium text-center outline-none w-full appearance-none text-blue-700"
                                value={formData.assignedApprover || ""}
                                onChange={(e) => setFormData({...formData, assignedApprover: e.target.value, submitToJobBoard: true})}
                             >
                                <option value="">-- Select --</option>
                                <option value="Manager">Workshop Manager</option>
                                <option value="ServiceHead">Service Head</option>
                                <option value="Supervisor">Floor Supervisor</option>
                             </select>
                         </div>
                    </div>
                </div>

                {/* 2. Detailed Info Grid - Replicating Professional Job Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 border-b-2 border-slate-100 divide-y md:divide-y-0 md:divide-x print:divide-y-0 print:divide-x divide-slate-100">
                    
                    {/* Column 1: BILL TO / CUSTOMER */}
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                             <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider">Bill To / Customer</h3>
                        </div>
                        
                        {!initialData ? (
                            <div className="space-y-3 print:hidden">
                                <Label className="text-xs text-slate-400">Select Vehicle</Label>
                                <select 
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                                    value={formData.vehicleId}
                                    onChange={(e) => handleVehicleSelect(e.target.value)}
                                >
                                    <option value="">-- Select Vehicle --</option>
                                    <option value="_MANUAL_">+ Enter Details Manually</option>
                                    {vehicles.map((v: any) => (
                                        <option key={v.id} value={v.id}>{v.regNumber} - {v.model}</option>
                                    ))}
                                </select>
                            </div>
                        ) : null}

                        <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-3 gap-2 items-center">
                                <span className="text-slate-500 text-xs font-semibold">Name</span>
                                <Input 
                                    className="col-span-2 h-7 font-bold px-2 py-1 print:border-none print:shadow-none print:px-0"
                                    value={formData.ownerName}
                                    onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                                    placeholder="Customer Name"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2 items-center">
                                <span className="text-slate-500 text-xs font-semibold">Phone</span>
                                <Input 
                                    className="col-span-2 h-7 px-2 py-1 print:border-none print:shadow-none print:px-0"
                                    value={formData.ownerPhone}
                                    onChange={(e) => setFormData({...formData, ownerPhone: e.target.value})}
                                    placeholder="Phone"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2 items-start">
                                <span className="text-slate-500 text-xs font-semibold pt-1">Address</span>
                                <textarea 
                                    className="col-span-2 w-full min-h-[50px] text-xs border rounded-sm p-1 resize-none bg-slate-50 print:bg-white print:border-none print:p-0"
                                    value={formData.ownerAddress}
                                    onChange={(e) => setFormData({...formData, ownerAddress: e.target.value})}
                                    placeholder="Billing Address"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2 items-center">
                                <span className="text-slate-500 text-xs font-semibold">GSTIN</span>
                                <Input 
                                    className="col-span-2 h-7 px-2 py-1 print:border-none print:shadow-none print:px-0"
                                    value={formData.ownerGstin}
                                    onChange={(e) => setFormData({...formData, ownerGstin: e.target.value})}
                                    placeholder="GSTIN (Optional)"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Column 2: VEHICLE INFO */}
                    <div className="p-6 space-y-4">
                        <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-2">Vehicle Info</h3>
                        <div className="space-y-2">
                             <div className="grid grid-cols-3 gap-2 items-center">
                                <Label className="text-slate-500 text-xs font-semibold">Reg. No.</Label>
                                <Input 
                                    className="col-span-2 h-7 font-mono font-bold text-lg uppercase bg-yellow-50/50 print:bg-transparent print:border-none print:shadow-none print:px-0"
                                    value={formData.regNumber}
                                    onChange={(e) => setFormData({...formData, regNumber: e.target.value})}
                                    placeholder="XX-00-XX-0000"
                                />
                             </div>
                             <div className="grid grid-cols-3 gap-2 items-center">
                                <Label className="text-slate-500 text-xs font-semibold">Model</Label>
                                <Input 
                                    className="col-span-2 h-7 font-medium print:border-none print:shadow-none print:px-0"
                                    value={formData.model}
                                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                                    placeholder="Vehicle Model"
                                />
                             </div>
                             <div className="grid grid-cols-3 gap-2 items-center">
                                <Label className="text-slate-500 text-xs font-semibold">Chassis No.</Label>
                                <Input 
                                    className="col-span-2 h-7 font-mono text-xs uppercase print:border-none print:shadow-none print:px-0"
                                    value={formData.chassisNumber}
                                    onChange={(e) => setFormData({...formData, chassisNumber: e.target.value})}
                                    placeholder="Chassis Number"
                                />
                             </div>
                             <div className="grid grid-cols-3 gap-2 items-center">
                                <Label className="text-slate-500 text-xs font-semibold">Engine No.</Label>
                                <Input 
                                    className="col-span-2 h-7 font-mono text-xs uppercase print:border-none print:shadow-none print:px-0"
                                    value={formData.engineNumber}
                                    onChange={(e) => setFormData({...formData, engineNumber: e.target.value})}
                                    placeholder="Engine Number"
                                />
                             </div>
                             <div className="grid grid-cols-3 gap-2 items-center">
                                <Label className="text-slate-500 text-xs font-semibold">Fuel</Label>
                                <select 
                                    className="col-span-2 h-7 w-full rounded-md border border-input bg-background px-2 text-xs appearance-none print:border-none"
                                    value={formData.fuelLevel}
                                    onChange={(e) => setFormData({...formData, fuelLevel: e.target.value})}
                                >
                                    <option value="Empty">Empty</option>
                                    <option value="25%">25%</option>
                                    <option value="50%">50%</option>
                                    <option value="75%">75%</option>
                                    <option value="Full">Full</option>
                                </select>
                             </div>
                        </div>
                    </div>

                    {/* Column 3: REPAIR ORDER INFO */}
                    <div className="p-6 space-y-4">
                        <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-2">Order Info</h3>
                         <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs text-slate-400">Odometer (km)</Label>
                                    <Input 
                                        type="number"
                                        className="h-8 mt-1 font-mono font-bold print:border-none print:shadow-none print:px-0" 
                                        value={formData.odometer}
                                        onChange={(e) => setFormData({...formData, odometer: e.target.value})}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-slate-400">Exp. Del. Date</Label>
                                    <Input 
                                        type="date"
                                        className="h-8 mt-1 text-xs print:border-none print:shadow-none print:px-0"
                                        value={formData.estimatedDate}
                                        onChange={(e) => setFormData({...formData, estimatedDate: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Label className="text-xs text-slate-400">Service Advisor</Label>
                                <Input 
                                    className="h-8 mt-1 print:border-none print:shadow-none print:px-0" 
                                    value={formData.serviceAdvisor}
                                    onChange={(e) => setFormData({...formData, serviceAdvisor: e.target.value})}
                                    placeholder="Advisor Name"
                                />
                             </div>
                            <div className="pt-2">
                                <Label className="text-xs text-slate-400">Assigned Mechanic</Label>
                                <select 
                                    className="w-full h-8 mt-1 text-xs border rounded-md bg-white px-2 outline-none print:border-none print:shadow-none print:px-0"
                                    value={formData.mechanicId}
                                    onChange={(e) => setFormData({...formData, mechanicId: e.target.value})}
                                >
                                    <option value="">-- Select Mechanic --</option>
                                    {mechanics.map((m: any) => (
                                        <option key={m.id} value={m.id}>
                                            {m.name} {m.availability === 'BUSY' ? '(Busy)' : '(Available)'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                             <div className="pt-2">
                                <Label className="text-xs text-slate-400">Customer Request / Initial Complaint</Label>
                                <textarea 
                                    className="w-full min-h-[60px] p-2 text-xs border rounded-md bg-yellow-50/50 resize-none focus:outline-primary mt-1 print:bg-transparent print:border-none print:p-0"
                                    placeholder="Enter issues..."
                                    value={formData.complaint}
                                    onChange={(e) => setFormData({...formData, complaint: e.target.value})}
                                 />
                             </div>
                         </div>
                    </div>
                </div>

                {/* 3. Detailed Line Items Table */}
                <div className="flex-1 p-8 overflow-x-auto">
                    <div className="flex justify-between items-center mb-4 min-w-[1200px]">
                        <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider">Service Line Items</h3>
                    </div>

                    <div className="min-w-[1200px] border border-slate-200 rounded-sm">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-100 font-semibold text-slate-600 border-b border-slate-200">
                                <tr>
                                    <th className="p-2 w-10 text-center">#</th>
                                    <th className="p-2 w-20">Type</th>
                                    <th className="p-2 min-w-[200px]">Description</th>
                                    <th className="p-2 w-20">HSN/SAC</th>
                                    <th className="p-2 w-24">Issue Type</th>
                                    <th className="p-2 w-14 text-center">Qty</th>
                                    <th className="p-2 w-14">UoM</th>
                                    <th className="p-2 w-24 text-right">Rate</th>
                                    <th className="p-2 w-32 text-center">Discount<br/><span className="text-[9px] text-slate-400 font-normal">(Amt / %)</span></th>
                                    <th className="p-2 w-24 text-right">Taxable</th>
                                    <th className="p-2 w-32 text-center">CGST<br/><span className="text-[9px] text-slate-400 font-normal">(% / Amt)</span></th>
                                    <th className="p-2 w-32 text-center">SGST<br/><span className="text-[9px] text-slate-400 font-normal">(% / Amt)</span></th>
                                    <th className="p-2 w-24 text-center">KFC/Cess<br/><span className="text-[9px] text-slate-400 font-normal">(Amt)</span></th>
                                    <th className="p-2 w-28 text-right">Amount</th>
                                    <th className="p-2 w-10 text-center print:hidden"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((item, index) => {
                                    // Helper for safe calculation
                                    const p = (v: any) => parseFloat(v) || 0
                                    
                                    // Calculate display values on the fly if needed, but state is source of truth
                                    // We rely on the update function to keep 'costAtTime' and others updated
                                    // But let's verify visual consistency
                                    const qty = p(item.quantity)
                                    const rate = p(item.unitPrice)
                                    const disc = p(item.discountAmount)
                                    const taxable = (qty * rate) - disc
                                    
                                    const updateItem = (field: string, val: any) => {
                                        const newItems = [...items]
                                        // Update the field
                                        newItems[index] = { ...newItems[index], [field]: val }
                                        const cur = newItems[index]

                                        // Auto-calculate logic if relevant fields change
                                        if (['quantity', 'unitPrice', 'discountAmount', 'discountPercent', 'cgstPercent', 'sgstPercent', 'cessPercent'].includes(field)) {
                                            const q = p(cur.quantity)
                                            const r = p(cur.unitPrice)
                                            let dA = p(cur.discountAmount)
                                            const dP = p(cur.discountPercent)
                                            
                                            // Handle Discount Percent -> Amount
                                            if (field === 'discountPercent') {
                                                dA = (q * r) * (dP / 100)
                                                cur.discountAmount = dA.toFixed(2)
                                            }
                                            // Handle Discount Amount -> Percent (Optional, maybe skip to avoid circular math for now)

                                            const base = q * r
                                            const taxBase = base - dA
                                            
                                            // Taxes
                                            const cP = p(cur.cgstPercent)
                                            const sP = p(cur.sgstPercent)
                                            // Cess is usually % but requested as potentially KFC Amt. Let's support Percent input but treat as check
                                            // Actually prompt asked for KFC (Amt). Let's start with just Amt or % -> Amt.
                                            // Image shows KFC %. Let's assume % for calc.
                                            // Wait, Image shows KFC column with % and Amt subcols? or just Amt?
                                            // Previous image analysis: "KFC (%, Amt)". Okay, so treated same as CGST.
                                            const kfcP = p(cur.cessPercent) 
                                            
                                            const cA = taxBase * (cP / 100)
                                            const sA = taxBase * (sP / 100)
                                            const kfcA = taxBase * (kfcP / 100)

                                            cur.cgstAmount = cA.toFixed(2)
                                            cur.sgstAmount = sA.toFixed(2)
                                            cur.cessAmount = kfcA.toFixed(2)
                                            
                                            cur.costAtTime = (taxBase + cA + sA + kfcA).toFixed(2)
                                            
                                            // Legacy TaxTotal for backend compatibility (creates Aggregate Tax)
                                            cur.taxRate = (cP + sP + kfcP).toFixed(2)
                                        }
                                        setItems(newItems)
                                    }

                                    return (
                                        <tr key={index} className="hover:bg-slate-50 group">
                                            <td className="p-2 text-center text-slate-400">{index + 1}</td>
                                            <td className="p-2">
                                                <select 
                                                    className="w-full bg-transparent border-none text-[10px] font-bold outline-none cursor-pointer"
                                                    value={item.itemType}
                                                    onChange={(e) => updateItem('itemType', e.target.value)}
                                                >
                                                    <option value="PART">PART</option>
                                                    <option value="LABOR">LABOR</option>
                                                </select>
                                            </td>
                                            <td className="p-2">
                                                {item.itemType === 'PART' ? (
                                                     <div className="flex gap-1 relative">
                                                         {/* Simple Part Search Placeholder or text input */}
                                                         {!initialData ? (
                                                             <select 
                                                                className="w-full bg-transparent text-xs appearance-none border-b border-transparent focus:border-primary outline-none" 
                                                                value={item.partId || ""} 
                                                                onChange={(e) => {
                                                                    const part = parts.find(p => p.id.toString() === e.target.value)
                                                                    if (part) {
                                                                        const newItems = [...items]
                                                                        const newItem = { 
                                                                            ...newItems[index], 
                                                                            partId: part.id, 
                                                                            description: part.name, 
                                                                            unitPrice: part.price,
                                                                            hsnSac: '8708', // Default for auto parts
                                                                            uom: 'Nos',
                                                                            cgstPercent: 9, // Defaults
                                                                            sgstPercent: 9
                                                                        }
                                                                        // Trigger calc
                                                                        // Simplest is to just set it and let user tweak or rely on Save calc
                                                                        // We'll mimic updateItem logic manually here or just set defaults
                                                                        newItem.costAtTime = (part.price * 1.18).toFixed(2) // Rough est
                                                                        newItem.cgstAmount = (part.price * 0.09).toFixed(2)
                                                                        newItem.sgstAmount = (part.price * 0.09).toFixed(2)
                                                                        newItems[index] = newItem
                                                                        setItems(newItems)
                                                                    }
                                                                }}
                                                             >
                                                                 <option value="">Select Part...</option>
                                                                 {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                             </select>
                                                         ) : (
                                                             <span className="text-xs font-semibold truncate max-w-[150px]" title={item.description}>{item.description}</span>
                                                         )}
                                                     </div>
                                                ) : (
                                                    <Input 
                                                        className="h-6 text-xs px-1 border-transparent hover:border-slate-200 focus:border-primary shadow-none bg-transparent"
                                                        value={item.description}
                                                        onChange={(e) => updateItem('description', e.target.value)}
                                                    />
                                                )}
                                            </td>
                                            <td className="p-2"><Input className="h-6 text-[10px] px-1 text-center bg-transparent border-transparent hover:border-slate-200" value={item.hsnSac || ''} onChange={(e) => updateItem('hsnSac', e.target.value)} placeholder="0000" /></td>
                                            <td className="p-2">
                                                <select className="h-6 w-full text-[10px] bg-transparent border-none outline-none" value={item.issueType || 'Paid'} onChange={(e) => updateItem('issueType', e.target.value)}>
                                                    <option value="Paid">Paid</option>
                                                    <option value="Warranty">Warranty</option>
                                                    <option value="FOC">FOC</option>
                                                </select>
                                            </td>
                                            <td className="p-2"><Input type="number" className="h-6 text-xs px-1 text-center font-bold bg-transparent border-transparent hover:border-slate-200" value={item.quantity} onChange={(e) => updateItem('quantity', e.target.value)} /></td>
                                            <td className="p-2"><Input className="h-6 text-[10px] px-1 text-center uppercase bg-transparent border-transparent hover:border-slate-200" value={item.uom || 'Nos'} onChange={(e) => updateItem('uom', e.target.value)} /></td>
                                            <td className="p-2"><Input type="number" className="h-6 text-xs px-1 text-right bg-transparent border-transparent hover:border-slate-200" value={item.unitPrice} onChange={(e) => updateItem('unitPrice', e.target.value)} /></td>
                                            
                                            {/* Discount Group */}
                                            <td className="p-2">
                                                <div className="flex gap-1">
                                                    <Input type="number" placeholder="Amt" className="h-6 text-[10px] px-1 text-right w-1/2" value={item.discountAmount} onChange={(e) => updateItem('discountAmount', e.target.value)} />
                                                    <Input type="number" placeholder="%" className="h-6 text-[10px] px-1 text-right w-1/2 bg-slate-50" value={item.discountPercent} onChange={(e) => updateItem('discountPercent', e.target.value)} />
                                                </div>
                                            </td>
                                            
                                            <td className="p-2 text-right text-xs font-medium text-slate-600">
                                                {(taxable).toFixed(2)}
                                            </td>

                                            {/* CGST Group */}
                                            <td className="p-2">
                                                <div className="grid grid-cols-2 gap-0.5">
                                                    <Input type="number" className="h-6 text-[10px] px-0.5 text-center bg-slate-50" value={item.cgstPercent} onChange={(e) => updateItem('cgstPercent', e.target.value)} />
                                                    <div className="h-6 flex items-center justify-end text-[10px] pr-1 bg-slate-50/50">{p(item.cgstAmount).toFixed(0)}</div>
                                                </div>
                                            </td>
                                            {/* SGST Group */}
                                            <td className="p-2">
                                                <div className="grid grid-cols-2 gap-0.5">
                                                    <Input type="number" className="h-6 text-[10px] px-0.5 text-center bg-slate-50" value={item.sgstPercent} onChange={(e) => updateItem('sgstPercent', e.target.value)} />
                                                    <div className="h-6 flex items-center justify-end text-[10px] pr-1 bg-slate-50/50">{p(item.sgstAmount).toFixed(0)}</div>
                                                </div>
                                            </td>
                                            {/* KFC Group */}
                                            <td className="p-2">
                                                 <Input type="number" placeholder="%" className="h-6 text-[10px] px-1 text-center bg-slate-50" value={item.cessPercent} onChange={(e) => updateItem('cessPercent', e.target.value)} />
                                                  {/* Showing amount below or tooltip? For space let's rely on just % input or a small amount display if needed, but width is tight. Let's just input %. */}
                                            </td>
                                            
                                            <td className="p-2 text-right font-bold font-mono text-sm text-slate-800">
                                                {p(item.costAtTime).toFixed(2)}
                                            </td>
                                            <td className="p-2 text-center print:hidden">
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 opacity-0 group-hover:opacity-100" onClick={() => {
                                                    const n = items.filter((_, i) => i !== index); setItems(n)
                                                }}>
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        
                        {/* Add Buttons Footer */}
                        <div className="p-2 bg-slate-50 border-t flex justify-center gap-4 print:hidden">
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setItems([...items, { itemType: 'PART', quantity: 1, unitPrice: 0, cgstPercent: 9, sgstPercent: 9, cessPercent: 1 }])}>
                                <Plus className="w-3 h-3 mr-1" /> Add Manual Part
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setItems([...items, { itemType: 'LABOR', description: '', quantity: 1, unitPrice: 0, hsnSac: '998729', uom: 'Hrs', cgstPercent: 9, sgstPercent: 9 }])}>
                                <Plus className="w-3 h-3 mr-1" /> Add Labor
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 5. Job Photos Section */}
                <div className="bg-slate-50 p-8 border-t border-slate-200 print:break-inside-avoid">
                    <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-4">Job Photos & Documentation</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {formData.images.map((img: string, idx: number) => (
                            <div key={idx} className="relative aspect-video bg-gray-100 rounded-md overflow-hidden border border-slate-200 group">
                                <img src={img} alt={`Job Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newImages = [...formData.images]
                                        newImages.splice(idx, 1)
                                        setFormData({...formData, images: newImages})
                                    }}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        
                        {/* Upload / Camera Controls */}
                        <div className="flex flex-col gap-2 justify-center items-center aspect-video border-2 border-dashed border-slate-300 rounded-md bg-slate-50 p-4 print:hidden">
                            <div className="flex gap-2 w-full">
                                <label className="flex-1">
                                    <div className="flex flex-col items-center justify-center h-20 bg-white border border-slate-200 rounded cursor-pointer hover:bg-slate-50 transition-colors">
                                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                                        <span className="text-[10px] uppercase font-bold text-slate-500">Upload</span>
                                    </div>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={async (e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                const file = e.target.files[0]
                                                const fd = new FormData()
                                                fd.append('file', file)
                                                
                                                setLoading(true)
                                                try {
                                                    const res = await uploadImage(fd)
                                                    if (res.success && res.url) {
                                                        setFormData(prev => ({...prev, images: [...prev.images, res.url]}))
                                                    } else {
                                                        alert("Failed to upload")
                                                    }
                                                } catch (err) {
                                                    console.error(err)
                                                    alert("Upload error")
                                                } finally {
                                                    setLoading(false)
                                                }
                                            }
                                        }}
                                    />
                                </label>
                                <button 
                                    type="button"
                                    onClick={() => setShowCamera(true)}
                                    className="flex-1 flex flex-col items-center justify-center h-20 bg-white border border-slate-200 rounded cursor-pointer hover:bg-slate-50 transition-colors"
                                >
                                    <Camera className="w-5 h-5 text-slate-400 mb-1" />
                                    <span className="text-[10px] uppercase font-bold text-slate-500">Camera</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Notes Footer (Existing) */}
                <div className="bg-slate-50 p-8 border-t border-slate-200 print:break-inside-avoid">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                             <Label className="text-slate-500 text-xs uppercase font-bold">Mechanic Observations / Internal Notes</Label>
                             <textarea 
                                className="w-full min-h-[100px] p-3 text-sm border rounded-md bg-white resize-none print:border-slate-300"
                                placeholder="Technician notes on vehicle condition..."
                                value={formData.mechanicNotes}
                                onChange={(e) => setFormData({...formData, mechanicNotes: e.target.value})}
                             />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Total Tax</span>
                                <span>₹{totalTax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xl font-bold text-slate-900 pt-3 border-t border-slate-200">
                                <span>Grand Total</span>
                                <span>₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-12 grid grid-cols-2 gap-12 pt-8 border-t border-slate-200">
                        {/* Advisor Signature */}
                        <div className="text-center group relative">
                            {formData.advisorSignature ? (
                                <div className="flex flex-col items-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={formData.advisorSignature} alt="Advisor Sig" className="h-16 mb-2 object-contain" />
                                    <button 
                                        type="button" 
                                        onClick={() => { setSignType('advisor'); setSignModalOpen(true) }}
                                        className="text-[10px] text-blue-600 hover:underline print:hidden"
                                    >
                                        Re-sign
                                    </button>
                                </div>
                            ) : (
                                <div className="h-20 flex items-end justify-center">
                                    <button 
                                        type="button" 
                                        onClick={() => { setSignType('advisor'); setSignModalOpen(true) }}
                                        className="mb-2 text-sm text-blue-600 font-bold border border-dashed border-blue-300 px-4 py-2 rounded hover:bg-blue-50 print:hidden"
                                    >
                                        + Sign (Advisor)
                                    </button>
                                </div>
                            )}
                            <div className="h-px bg-slate-300 w-full mb-2"></div>
                            <p className="text-xs text-slate-500 uppercase">Service Advisor Signature</p>
                        </div>

                        {/* Customer Signature */}
                        <div className="text-center group relative">
                             {formData.customerSignature ? (
                                <div className="flex flex-col items-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={formData.customerSignature} alt="Customer Sig" className="h-16 mb-2 object-contain" />
                                    <button 
                                        type="button" 
                                        onClick={() => { setSignType('customer'); setSignModalOpen(true) }}
                                        className="text-[10px] text-blue-600 hover:underline print:hidden"
                                    >
                                        Re-sign
                                    </button>
                                </div>
                            ) : (
                                <div className="h-20 flex items-end justify-center">
                                    <button 
                                        type="button" 
                                        onClick={() => { setSignType('customer'); setSignModalOpen(true) }}
                                        className="mb-2 text-sm text-blue-600 font-bold border border-dashed border-blue-300 px-4 py-2 rounded hover:bg-blue-50 print:hidden"
                                    >
                                        + Sign (Customer)
                                    </button>
                                </div>
                            )}
                            <div className="h-px bg-slate-300 w-full mb-2"></div>
                            <p className="text-xs text-slate-500 uppercase">Customer Signature</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        
        {/* Signature Dialog */}
        <Dialog open={signModalOpen} onOpenChange={setSignModalOpen}>
            <DialogContent className="sm:max-w-md">
                <div className="flex flex-col">
                    <h3 className="text-lg font-bold mb-4">
                        {signType === 'customer' ? 'Customer Signature' : 'Advisor Signature'}
                    </h3>
                    <SignaturePad 
                        onSave={(dataUrl) => {
                            if (signType === 'customer') setFormData({...formData, customerSignature: dataUrl})
                            if (signType === 'advisor') setFormData({...formData, advisorSignature: dataUrl})
                            setSignModalOpen(false)
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
        
        {/* Camera Modal */}
        <Dialog open={showCamera} onOpenChange={setShowCamera}>
            <DialogContent className="sm:max-w-md">
                <div className="flex flex-col items-center">
                   <h3 className="text-lg font-bold mb-4">Take Picture</h3>
                   <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
                       <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                       <canvas ref={canvasRef} className="hidden"></canvas>
                   </div>
                   <div className="flex gap-4">
                       <Button variant="outline" onClick={() => setShowCamera(false)}>Cancel</Button>
                       <Button onClick={capturePhoto} className="bg-primary text-white">
                           <Camera className="w-4 h-4 mr-2" /> Capture
                       </Button>
                   </div>
                </div>
            </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}
