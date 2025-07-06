import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Menu, 
  TrendingUp, 
  DollarSign, 
  Users,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react'
import api from '../services/api'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentItems, setRecentItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, menuResponse] = await Promise.all([
        api.get('/restaurant/stats'),
        api.get('/menu?limit=5&sortBy=createdAt&sortOrder=desc')
      ])
      
      setStats(statsResponse.data)
      setRecentItems(menuResponse.data.items)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleItemAvailability = async (itemId) => {
    try {
      await api.patch(`/menu/${itemId}/toggle-availability`)
      fetchDashboardData() // Refresh data
    } catch (error) {
      console.error('Error toggling availability:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Menu Items',
      value: stats?.overview?.totalItems || 0,
      icon: Menu,
      color: 'bg-blue-500'
    },
    {
      title: 'Available Items',
      value: stats?.overview?.availableItems || 0,
      icon: Eye,
      color: 'bg-green-500'
    },
   
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Items and Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Menu Items */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Menu Items</h3>
              <Link to="/menu" className="btn btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentItems.length > 0 ? (
              <div className="space-y-4">
                {recentItems.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.category} • ${item.price}</p>
                    </div>
                    <button
                      onClick={() => toggleItemAvailability(item._id)}
                      className={`p-2 rounded-lg ${
                        item.isAvailable 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      {item.isAvailable ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Menu className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No menu items yet</p>
                <Link to="/menu" className="btn btn-primary mt-4">
                  Add Your First Item
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Category Breakdown</h3>
          </div>
          <div className="p-6">
            {stats?.categoryBreakdown?.length > 0 ? (
              <div className="space-y-4">
                {stats.categoryBreakdown.map((category) => (
                  <div key={category._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{category._id}</p>
                      <p className="text-sm text-gray-600">
                        Avg: ${category.avgPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{category.count}</p>
                      <p className="text-sm text-gray-600">items</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No categories yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard