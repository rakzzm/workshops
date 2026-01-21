"use server"

import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get("file") as File
    if (!file) {
      return { success: false, error: "No file provided" }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), "public/uploads")
    try {
        await mkdir(uploadDir, { recursive: true })
    } catch (e) {
        // Ignore if exists
    }

    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // Sanitize filename or just give it a new name
    const extension = file.name.split('.').pop() || 'png'
    const filename = `job-image-${uniqueSuffix}.${extension}`
    const filepath = join(uploadDir, filename)

    await writeFile(filepath, buffer)

    return { success: true, url: `/uploads/${filename}` }
  } catch (error) {
    console.error("Upload error:", error)
    return { success: false, error: "Failed to upload image" }
  }
}
