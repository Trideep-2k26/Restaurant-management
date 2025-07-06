import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { ChefHat, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register: registerUser } = useAuth()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        restaurantName: data.restaurantName,
        cuisine: data.cuisine
      })
      toast.success('Account created successfully!')
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  const cuisineOptions = [
    'Italian', 'Chinese', 'Indian', 'Mexican', 'American', 
    'Thai', 'French', 'Japanese', 'Mediterranean', 'Other'
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-orange-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <ChefHat className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Start managing your restaurant menu today
          </p>
        </div>
        
        <div className="card p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                })}
                type="text"
                className="input"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="input"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name
              </label>
              <input
                {...register('restaurantName', {
                  required: 'Restaurant name is required',
                  minLength: {
                    value: 2,
                    message: 'Restaurant name must be at least 2 characters'
                  }
                })}
                type="text"
                className="input"
                placeholder="Enter your restaurant name"
              />
              {errors.restaurantName && (
                <p className="mt-1 text-sm text-red-600">{errors.restaurantName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-2">
                Cuisine Type
              </label>
              <select
                {...register('cuisine', {
                  required: 'Cuisine type is required'
                })}
                className="input"
              >
                <option value="">Select cuisine type</option>
                {cuisineOptions.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
              {errors.cuisine && (
                <p className="mt-1 text-sm text-red-600">{errors.cuisine.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
                type="password"
                className="input"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register