import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

interface Organization {
  id: string
  name: string
  description: string
  city: string
  contactEmail: string
  phoneNumber: string
}

export default function Organizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/v1/organizations')
      setOrganizations(response.data.items || [])
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="organizations-page">
      <h1>Danh Sách Tổ Chức</h1>

      {loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : organizations.length === 0 ? (
        <div className="no-data">Không có tổ chức nào</div>
      ) : (
        <div className="organizations-grid grid grid-2">
          {organizations.map((org) => (
            <div key={org.id} className="org-card card">
              <h2>{org.name}</h2>
              <p>{org.description}</p>
              <p><strong>Thành phố:</strong> {org.city}</p>
              <p><strong>Email:</strong> {org.contactEmail}</p>
              <p><strong>Số điện thoại:</strong> {org.phoneNumber}</p>
              <Link to={`/organizations/${org.id}`} className="btn-primary">Xem Chi Tiết</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
