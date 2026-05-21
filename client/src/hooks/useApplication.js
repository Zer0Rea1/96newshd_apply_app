import { useState } from 'react'
import api from '../api/axios'

export function useApplication() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const uploadScreenshot = async (file) => {
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('screenshot', file)
      const { data } = await api.post('/applications/screenshot', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
      throw err
    } finally {
      setUploading(false)
    }
  }

  return { uploadScreenshot, uploading, error }
}
