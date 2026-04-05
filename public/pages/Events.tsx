import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

interface Event {
  id: string
  title: string
  description: string
  location: string
  startTime: string
  organizationName: string
  categoryName: string
  registeredCount: number
  maxVolunteers: number
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [keyword])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/v1/events', {
        params: { keyword, pageSize: 12 }
      })
      setEvents(response.data.items || [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="events-page">
      <h1>Danh Sách Sự Kiện</h1>
      
      <div className="search-box">
        <input
          type="text"
          placeholder="Tìm kiếm sự kiện..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : events.length === 0 ? (
        <div className="no-data">Không có sự kiện nào</div>
      ) : (
        <div className="events-grid grid grid-3">
          {events.map((event) => (
            <div key={event.id} className="event-card card">
              <h3>{event.title}</h3>
              <p className="organization">{event.organizationName}</p>
              <p className="description">{event.description?.substring(0, 100)}...</p>
              <p className="location">📍 {event.location}</p>
              <p className="time">🕐 {new Date(event.startTime).toLocaleString('vi-VN')}</p>
              <p className="category">📂 {event.categoryName}</p>
              <p className="registered">
                👥 {event.registeredCount}/{event.maxVolunteers} tình nguyện viên
              </p>
              <Link to={`/events/${event.id}`} className="btn-primary">Xem Chi Tiết</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
