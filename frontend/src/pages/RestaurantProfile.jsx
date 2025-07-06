import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { MapPin, Phone, Mail, Globe } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const RestaurantProfile = () => {
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm()

  const cuisineOptions = [
    'Italian', 'Chinese', 'Indian', 'Mexican', 'American', 
    'Thai', 'French', 'Japanese', 'Mediterranean', 'Other'
  ]

  useEffect(() => {
    fetchRestaurantProfile()
  }, [])

  const fetchRestaurantProfile = async () => {
    try {
      const response = await api.get('/restaurant/profile')
      setRestaurant(response.data)
      reset({
        name: response.data.name,
        description: response.data.description,
        cuisine: response.data.cuisine,
        addressStreet: response.data.address?.street || '',
        addressCity: response.data.address?.city || '',
        addressState: response.data.address?.state || '',
        addressZipCode: response.data.address?.zipCode || '',
        addressCountry: response.data.address?.country || '',
        contactPhone: response.data.contact?.phone || '',
        contactEmail: response.data.contact?.email || '',
        contactWebsite: response.data.contact?.website || '',
        settingsCurrency: response.data.settings?.currency || 'USD',
        settingsTimezone: response.data.settings?.timezone || 'UTC'
      })
    } catch (error) {
      console.error('Error fetching restaurant profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (data) => {
    try {
      const formData = {
        name: data.name,
        description: data.description,
        cuisine: data.cuisine,
        address: {
          street: data.addressStreet,
          city: data.addressCity,
          state: data.addressState,
          zipCode: data.addressZipCode,
          country: data.addressCountry
        },
        contact: {
          phone: data.contactPhone,
          email: data.contactEmail,
          website: data.contactWebsite
        },
        settings: {
          currency: data.settingsCurrency,
          timezone: data.settingsTimezone
        }
      }

      await api.put('/restaurant/profile', formData)
      toast.success('Restaurant profile updated successfully')
      fetchRestaurantProfile()
    } catch (error) {
      console.error('Error updating restaurant profile:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Restaurant Profile</h1>
        <p className="text-gray-600">Manage your restaurant information and settings</p>
      </div>

      {/* Profile Form */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Restaurant Information</h3>
        
        <form onSubmit={handleSubmit(handleProfileUpdate)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name *
              </label>
              <input
                {...register('name', { required: 'Restaurant name is required' })}
                className="input"
                placeholder="Enter restaurant name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisine Type
              </label>
              <select
                {...register('cuisine')}
                className="input"
              >
                <option value="">Select cuisine type</option>
                {cuisineOptions.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input"
              placeholder="Describe your restaurant"
            />
          </div>

          {/* Address */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Address
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <input
                  {...register('addressStreet')}
                  className="input"
                  placeholder="Street address"
                />
              </div>
              <div>
                <input
                  {...register('addressCity')}
                  className="input"
                  placeholder="City"
                />
              </div>
              <div>
                <input
                  {...register('addressState')}
                  className="input"
                  placeholder="State/Province"
                />
              </div>
              <div>
                <input
                  {...register('addressZipCode')}
                  className="input"
                  placeholder="ZIP/Postal Code"
                />
              </div>
              <div>
                <input
                  {...register('addressCountry')}
                  className="input"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone
                </label>
                <input
                  {...register('contactPhone')}
                  type="tel"
                  className="input"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email
                </label>
                <input
                  {...register('contactEmail', {
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="input"
                  placeholder="Email address"
                />
                {errors.contactEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="h-4 w-4 inline mr-1" />
                  Website
                </label>
                <input
                  {...register('contactWebsite')}
                  type="url"
                  className="input"
                  placeholder="https://yourrestaurant.com"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  {...register('settingsCurrency')}
                  className="input"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="INR">INR (₹)</option>

                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  {...register('settingsTimezone')}
                  className="input"
                >
                  <option value="UTC">UTC</option>
                  <option value="Indian Standard Time">IST</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="btn btn-primary"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RestaurantProfile