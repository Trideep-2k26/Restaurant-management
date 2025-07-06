import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  X,
  Upload,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../services/api'
import toast from 'react-hot-toast'

const MenuItems = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  })
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm()

  const categories = [
    'Appetizers', 'Mains', 'Desserts', 'Beverages', 
    'Salads', 'Soups', 'Specials', 'Other'
  ]

  const allergens = [
    'Nuts', 'Dairy', 'Gluten', 'Eggs', 'Shellfish', 'Soy', 'Fish', 'Sesame'
  ]

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Low-Carb', 'Halal', 'Kosher'
  ]

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
  ]

  useEffect(() => {
    fetchMenuItems()
  }, [filters, pagination.currentPage])

  const fetchMenuItems = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.category !== 'all') params.append('category', filters.category)
      params.append('sortBy', filters.sortBy)
      params.append('sortOrder', filters.sortOrder)
      params.append('page', pagination.currentPage)
      params.append('limit', '10')

      const response = await api.get(`/menu?${params}`)
      setItems(response.data.items)
      setPagination({
        currentPage: parseInt(response.data.currentPage),
        totalPages: response.data.totalPages,
        totalItems: response.data.totalItems
      })
    } catch (error) {
      console.error('Error fetching menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrUpdate = async (data) => {
    try {
      const formData = {
        ...data,
        price: parseFloat(data.price),
        currency: data.currency || 'USD',
        ingredients: data.ingredients ? data.ingredients.split(',').map(i => i.trim()) : [],
        allergens: data.allergens || [],
        dietary: data.dietary || [],
        spicyLevel: parseInt(data.spicyLevel) || 0,
        preparationTime: data.preparationTime ? parseInt(data.preparationTime) : undefined,
        calories: data.calories ? parseInt(data.calories) : undefined
      }

      if (editingItem) {
        await api.put(`/menu/${editingItem._id}`, formData)
        toast.success('Menu item updated successfully')
      } else {
        await api.post('/menu', formData)
        toast.success('Menu item created successfully')
      }

      setShowModal(false)
      setEditingItem(null)
      reset()
      fetchMenuItems()
    } catch (error) {
      console.error('Error saving menu item:', error)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    reset({
      ...item,
      ingredients: item.ingredients.join(', '),
      allergens: item.allergens,
      dietary: item.dietary,
      currency: item.currency || 'USD'
    })
    setShowModal(true)
  }

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await api.delete(`/menu/${itemId}`)
        toast.success('Menu item deleted successfully')
        fetchMenuItems()
      } catch (error) {
        console.error('Error deleting menu item:', error)
      }
    }
  }

  const toggleAvailability = async (itemId) => {
    try {
      await api.patch(`/menu/${itemId}/toggle-availability`)
      fetchMenuItems()
    } catch (error) {
      console.error('Error toggling availability:', error)
    }
  }

  const handleImageUpload = async (itemId, file) => {
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    setUploadingImage(true)
    try {
      await api.post(`/menu/${itemId}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success('Image uploaded successfully')
      fetchMenuItems()
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setUploadingImage(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingItem(null)
    reset()
  }

  const getCurrencySymbol = (currencyCode) => {
    const currency = currencies.find(c => c.code === currencyCode)
    return currency ? currency.symbol : '$'
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Items</h1>
          <p className="text-gray-600">Manage your restaurant's menu items</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Menu Item
        </button>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              className="input pl-10"
              value={filters.search}
              onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
            />
          </div>
          
          <select
            className="input"
            value={filters.category}
            onChange={(e) => handleFilterChange({ ...filters, category: e.target.value })}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            className="input"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange({ ...filters, sortBy: e.target.value })}
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="category">Sort by Category</option>
            <option value="createdAt">Sort by Date</option>
          </select>

          <select
            className="input"
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange({ ...filters, sortOrder: e.target.value })}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {/* Menu Items Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16">
                        {item.image ? (
                          <img
                            className="h-16 w-16 rounded-lg object-cover"
                            src={item.image}
                            alt={item.name}
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {item.description}
                          </div>
                        )}
                        <div className="mt-1">
                          <label className="cursor-pointer text-xs text-primary-600 hover:text-primary-700">
                            <Upload className="h-3 w-3 inline mr-1" />
                            {item.image ? 'Change Image' : 'Add Image'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(item._id, e.target.files[0])}
                              disabled={uploadingImage}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCurrencySymbol(item.currency)}{item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => toggleAvailability(item._id)}
                        className={`p-2 rounded-lg ${
                          item.isAvailable 
                            ? 'text-green-600 hover:bg-green-100' 
                            : 'text-red-600 hover:bg-red-100'
                        }`}
                      >
                        {item.isAvailable ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {(pagination.currentPage - 1) * 10 + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * 10, pagination.totalItems)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{pagination.totalItems}</span>{' '}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.currentPage
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {items.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.category !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'Get started by adding your first menu item'
              }
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    {...register('name', { required: 'Item name is required' })}
                    className="input"
                    placeholder="Enter item name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="flex">
                    <select
                      {...register('currency')}
                      className="input rounded-r-none border-r-0 w-24"
                    >
                      {currencies.map(currency => (
                        <option key={currency.code} value={currency.code}>
                          {currency.symbol}
                        </option>
                      ))}
                    </select>
                    <input
                      {...register('price', { 
                        required: 'Price is required',
                        min: { value: 0, message: 'Price must be positive' }
                      })}
                      type="number"
                      step="0.01"
                      className="input rounded-l-none flex-1"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="input"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="input"
                  placeholder="Describe your menu item"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingredients (comma-separated)
                </label>
                <input
                  {...register('ingredients')}
                  className="input"
                  placeholder="tomato, cheese, basil"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergens
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {allergens.map(allergen => (
                      <label key={allergen} className="flex items-center">
                        <input
                          {...register('allergens')}
                          type="checkbox"
                          value={allergen}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{allergen}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dietary Options
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {dietaryOptions.map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          {...register('dietary')}
                          type="checkbox"
                          value={option}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spicy Level (0-5)
                  </label>
                  <input
                    {...register('spicyLevel')}
                    type="number"
                    min="0"
                    max="5"
                    className="input"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prep Time (minutes)
                  </label>
                  <input
                    {...register('preparationTime')}
                    type="number"
                    min="0"
                    className="input"
                    placeholder="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calories
                  </label>
                  <input
                    {...register('calories')}
                    type="number"
                    min="0"
                    className="input"
                    placeholder="250"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingItem ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MenuItems