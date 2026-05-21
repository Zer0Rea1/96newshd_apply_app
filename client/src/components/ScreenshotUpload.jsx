import { useState } from 'react'

export default function ScreenshotUpload({ onUpload, uploading }) {
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)

  const handleChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
    }
  }

  const handleSubmit = () => {
    if (file) onUpload(file)
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-gray-700 font-medium">Upload Payment Screenshot</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-50 file:text-red-600 file:font-semibold hover:file:bg-red-100"
        />
      </label>
      {preview && (
        <img src={preview} alt="Preview" className="w-full max-w-sm rounded-lg border" />
      )}
      <button
        onClick={handleSubmit}
        disabled={!file || uploading}
        className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 hover:bg-red-700 transition"
      >
        {uploading ? 'Uploading...' : 'Submit Screenshot'}
      </button>
    </div>
  )
}
