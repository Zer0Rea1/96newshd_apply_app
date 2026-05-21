import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import RoleCard from '../components/RoleCard'
import api from '../api/axios'

export default function RecruitmentForm() {
  const navigate = useNavigate()
  const [locationsHierarchy, setLocationsHierarchy] = useState(null)

  const [roles, setRoles] = useState([])
  const [rolesLoading, setRolesLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)

  const [formData, setFormData] = useState({
    name: '', phone: '', cnic: '', address: '', province: '', district: '', tehsil: '', city: ''
  })

  const [profilePhoto, setProfilePhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [errors, setErrors] = useState({})

  // Fetch location hierarchy on mount
  useEffect(() => {
    api.get('/locations/hierarchy')
      .then(res => setLocationsHierarchy(res.data.provinces))
      .catch(() => console.error("Failed to load locations"))
  }, [])

  // Fetch available roles when location changes at minimum Province level
  useEffect(() => {
    if (formData.province) {
      setRolesLoading(true)
      const params = new URLSearchParams()
      params.append('province', formData.province)
      if (formData.district) params.append('district', formData.district)
      if (formData.tehsil) params.append('tehsil', formData.tehsil)
      if (formData.city) params.append('city', formData.city)

      api.get(`/roles/available?${params.toString()}`)
        .then(res => setRoles(res.data))
        .catch(() => setRoles([]))
        .finally(() => setRolesLoading(false))
    } else {
      setRoles([])
    }
  }, [formData.province, formData.district, formData.tehsil, formData.city])

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updates = { [name]: value };

    // Reset lower levels when a higher level changes
    if (name === 'province') {
      updates.district = ''; updates.tehsil = ''; updates.city = '';
    } else if (name === 'district') {
      updates.tehsil = ''; updates.city = '';
    }

    setFormData(prev => ({ ...prev, ...updates }));
    setSelectedRole(null); // Reset role on location change
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const validate = () => {
    const errs = {}
    if (!selectedRole) errs.role = 'Please select a role'
    if (!formData.name.trim()) errs.name = 'Name is required'
    if (!formData.phone.trim()) errs.phone = 'Phone is required'
    if (!formData.cnic.trim()) errs.cnic = 'CNIC is required'
    if (!formData.address.trim()) errs.address = 'Address is required'
    if (!formData.province) errs.province = 'Province is required'
    if (!formData.district && currentProvinceObj?.districts?.length > 0) errs.district = 'District is required'

    // At least one of city or tehsil must be provided for granular checking if available
    const hasTehsilOrCityOptions = currentDistrictObj && (currentDistrictObj.tehsils.length > 0 || currentDistrictObj.cities.length > 0)
    if (hasTehsilOrCityOptions && !formData.tehsil && !formData.city) {
      errs.city = 'Tehsil or City is required'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const processAndNavigate = (photoData) => {
      const data = {
        ...formData,
        role: selectedRole.name,
        channelFee: selectedRole.fee,
        profilePhoto: photoData,
      }
      sessionStorage.setItem('recruitmentData', JSON.stringify(data))
      navigate('/register')
    }

    if (profilePhoto) {
      const reader = new FileReader()
      reader.onloadend = () => processAndNavigate(reader.result)
      reader.readAsDataURL(profilePhoto)
    } else {
      processAndNavigate(null)
    }
  }

  const currentProvinceObj = locationsHierarchy?.find(p => p.name === formData.province)
  const currentDistrictObj = currentProvinceObj?.districts.find(d => d.name === formData.district)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-red-700 text-white text-center py-8">
        <h1 className="text-3xl font-bold">96 News HD</h1>
        <p className="mt-2 text-red-100">Recruitment Application</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">1. Personal & Location Details</h2>

          {[
            { name: 'name', label: 'Full Name', placeholder: 'Enter your full name' },
            { name: 'phone', label: 'Phone Number', placeholder: '03001234567' },
            { name: 'cnic', label: 'CNIC Number', placeholder: '35202-1234567-1' },
            { name: 'address', label: 'Address', placeholder: 'Street, Area' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input
                type="text"
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              {errors[field.name] && <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>}
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
              <select
                name="province"
                value={formData.province}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="">Select Province</option>
                {locationsHierarchy?.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
              {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                disabled={!formData.province}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white disabled:bg-gray-100"
              >
                <option value="">Select District</option>
                {currentProvinceObj?.districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
              {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tehsil</label>
              <select
                name="tehsil"
                value={formData.tehsil}
                onChange={handleChange}
                disabled={!formData.district || !currentDistrictObj?.tehsils?.length}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white disabled:bg-gray-100"
              >
                <option value="">Select Tehsil</option>
                {currentDistrictObj?.tehsils?.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City/Town</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!formData.district || !currentDistrictObj?.cities?.length}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white disabled:bg-gray-100"
              >
                <option value="">Select City</option>
                {currentDistrictObj?.cities?.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhoto}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-50 file:text-red-600 file:font-semibold"
            />
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="mt-2 w-24 h-24 rounded-full object-cover border-2 border-red-200" />
            )}
          </div>
        </form>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">2. Select Your Position</h2>
        {errors.role && <p className="text-red-500 text-center mb-4">{errors.role}</p>}

        {!formData.province ? (
          <p className="text-center text-gray-500 mb-8">Please select your location first to view available positions.</p>
        ) : rolesLoading ? (
          <p className="text-center text-gray-500 mb-8">Loading available positions...</p>
        ) : roles.length === 0 ? (
          <p className="text-center text-red-500 font-medium mb-8">No positions available for the selected location.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {roles.map((role) => (
              <RoleCard
                key={role._id}
                role={role}
                selected={selectedRole?._id === role._id}
                onSelect={setSelectedRole}
              />
            ))}
          </div>
        )}

        {selectedRole && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center max-w-lg mx-auto">
            <p className="text-lg">Selected: <strong>{selectedRole.name}</strong></p>
            <p className="text-red-600 font-bold text-xl">Rs {selectedRole.fee.toLocaleString()}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full max-w-lg mx-auto block bg-red-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition"
        >
          Continue to Registration
        </button>

      </div>
    </div>
  )
}

