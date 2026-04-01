import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import OrganizerLayout from './OrganizerLayout';
import {
  getApiErrorMessage,
  organizerService,
  type OrganizerVolunteerHistoryItem,
} from '../../services/api';

const OrganizerVolunteerHistory = () => {
  const { id } = useParams();
  const [items, setItems] = useState<OrganizerVolunteerHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError('Thiếu volunteer id.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await organizerService.getVolunteerHistory(id);
        setItems(response.data.items || []);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Không thể tải lịch sử tình nguyện viên.'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  return (
    <OrganizerLayout>
      <section>
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="mb-2 text-2xl font-semibold tracking-tight">Lịch sử tình nguyện viên</h1>
            <p className="text-muted-foreground text-sm">
              Xem các sự kiện thuộc tổ chức bạn mà tình nguyện viên này đã đăng ký.
            </p>
          </div>

          <Link className="rounded border px-3 py-2 text-sm" to="/organizer/volunteers">
            Quay lại
          </Link>
        </div>

        {loading ? <div className="rounded border bg-card p-4 text-sm">Đang tải lịch sử volunteer...</div> : null}

        {error ? (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {!loading && !error ? (
          <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3">Sự kiện</th>
                  <th className="px-4 py-3">Địa điểm</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Lý do</th>
                  <th className="px-4 py-3">Trạng thái đăng ký</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr className="border-b" key={item.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{item.event.title}</div>
                      <div className="text-xs text-muted-foreground">Event ID: {item.event.id || '-'}</div>
                    </td>

                    <td className="px-4 py-3">{item.event.location || '-'}</td>

                    <td className="px-4 py-3">
                      <div>
                        {item.event.startTime ? new Date(item.event.startTime).toLocaleString('vi-VN') : '-'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        đến {item.event.endTime ? new Date(item.event.endTime).toLocaleString('vi-VN') : '-'}
                      </div>
                    </td>

                    <td className="px-4 py-3">{item.reason || 'Không có lý do đăng ký'}</td>

                    <td className="px-4 py-3">
                      <div className="mb-1">
                        <span className="rounded-full border px-2 py-1 text-xs">{item.status}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.registeredAt ? new Date(item.registeredAt).toLocaleString('vi-VN') : '-'}
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && items.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={5}>
                      Chưa có lịch sử đăng ký nào.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </OrganizerLayout>
  );
};

export default OrganizerVolunteerHistory;