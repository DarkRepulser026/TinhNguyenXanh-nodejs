import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import OrganizerLayout from './OrganizerLayout';
import {
  getApiErrorMessage,
  organizerService,
  type OrganizerRegistrationDetail,
  type VolunteerEvaluationItem,
} from '../../services/api';

const emptyDetail: OrganizerRegistrationDetail = {
  id: '',
  status: '',
  fullName: '',
  phone: null,
  reason: null,
  registeredAt: '',
  event: {
    id: '',
    title: '',
    startTime: '',
    endTime: '',
    location: null,
    status: '',
  },
  volunteer: {
    id: null,
    userId: null,
    fullName: '',
    phone: null,
  },
};

const OrganizerVolunteerDetails = () => {
  const { id } = useParams();

  const [detail, setDetail] = useState<OrganizerRegistrationDetail>(emptyDetail);
  const [evaluation, setEvaluation] = useState<VolunteerEvaluationItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [evaluationLoading, setEvaluationLoading] = useState(true);
  const [savingEvaluation, setSavingEvaluation] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');

  const loadEvaluation = async (registrationId: string) => {
    try {
      setEvaluationLoading(true);
      setEvaluationError(null);

      const response = await organizerService.getRegistrationEvaluation(registrationId);
      const item = response.data.item || null;

      setEvaluation(item);
      setRating(String(item?.rating ?? 5));
      setComment(item?.comment ?? '');
    } catch (err) {
      setEvaluationError(getApiErrorMessage(err, 'Không thể tải đánh giá tình nguyện viên.'));
    } finally {
      setEvaluationLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError('Thiếu registration id.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await organizerService.getRegistrationById(id);
        setDetail(response.data);

        await loadEvaluation(id);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Không thể tải chi tiết đăng ký.'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const saveEvaluation = async () => {
    if (!id) return;

    if (detail.status !== 'Confirmed') {
      setEvaluationError('Chỉ đăng ký đã được duyệt mới có thể đánh giá.');
      setSuccess(null);
      return;
    }

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      setEvaluationError('Điểm đánh giá phải từ 1 đến 5.');
      setSuccess(null);
      return;
    }

    try {
      setSavingEvaluation(true);
      setEvaluationError(null);
      setSuccess(null);

      const response = await organizerService.saveRegistrationEvaluation(id, {
        rating: numericRating,
        comment: comment.trim() || undefined,
      });

      setEvaluation(response.data);
      setRating(String(response.data.rating));
      setComment(response.data.comment || '');
      setSuccess('Lưu đánh giá tình nguyện viên thành công.');
    } catch (err) {
      setEvaluationError(getApiErrorMessage(err, 'Không thể lưu đánh giá tình nguyện viên.'));
      setSuccess(null);
    } finally {
      setSavingEvaluation(false);
    }
  };

  return (
    <OrganizerLayout>
      <section>
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="mb-2 text-2xl font-semibold tracking-tight">Chi tiết tình nguyện viên</h1>
            <p className="text-muted-foreground text-sm">
              Xem thông tin volunteer, đơn đăng ký và đánh giá của họ.
            </p>
          </div>

          <div className="flex gap-2">
            <Link className="rounded border px-3 py-2 text-sm" to="/organizer/volunteers">
              Quay lại
            </Link>

            {detail.volunteer.id ? (
              <Link
                className="rounded bg-slate-900 px-3 py-2 text-sm text-white"
                to={`/organizer/volunteers/${detail.volunteer.id}/history`}
              >
                Xem lịch sử
              </Link>
            ) : null}
          </div>
        </div>

        {loading ? <div className="rounded border bg-card p-4 text-sm">Đang tải chi tiết đăng ký...</div> : null}

        {error ? (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        {!loading && !error ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Thông tin tình nguyện viên</h2>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Họ tên:</span> {detail.volunteer.fullName || detail.fullName}
                </div>
                <div>
                  <span className="font-medium">Số điện thoại:</span> {detail.volunteer.phone || detail.phone || '-'}
                </div>
                <div>
                  <span className="font-medium">Volunteer ID:</span> {detail.volunteer.id || '-'}
                </div>
                <div>
                  <span className="font-medium">User ID:</span> {detail.volunteer.userId || '-'}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Thông tin đăng ký</h2>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Registration ID:</span> {detail.id}
                </div>
                <div>
                  <span className="font-medium">Trạng thái:</span> {detail.status}
                </div>
                <div>
                  <span className="font-medium">Thời gian đăng ký:</span>{' '}
                  {detail.registeredAt ? new Date(detail.registeredAt).toLocaleString('vi-VN') : '-'}
                </div>
                <div>
                  <span className="font-medium">Lý do đăng ký:</span>{' '}
                  {detail.reason || 'Không có lý do đăng ký'}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-sm md:col-span-2">
              <h2 className="mb-4 text-lg font-semibold">Thông tin sự kiện</h2>

              <div className="grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <span className="font-medium">Tên sự kiện:</span> {detail.event.title}
                </div>
                <div>
                  <span className="font-medium">Trạng thái sự kiện:</span> {detail.event.status}
                </div>
                <div>
                  <span className="font-medium">Địa điểm:</span> {detail.event.location || '-'}
                </div>
                <div>
                  <span className="font-medium">Bắt đầu:</span>{' '}
                  {detail.event.startTime ? new Date(detail.event.startTime).toLocaleString('vi-VN') : '-'}
                </div>
                <div>
                  <span className="font-medium">Kết thúc:</span>{' '}
                  {detail.event.endTime ? new Date(detail.event.endTime).toLocaleString('vi-VN') : '-'}
                </div>
                <div>
                  <span className="font-medium">Event ID:</span> {detail.event.id}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-sm md:col-span-2">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Đánh giá tình nguyện viên</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Chỉ đăng ký đã được duyệt mới có thể đánh giá.
                  </p>
                </div>

                {evaluation ? (
                  <span className="rounded-full border px-3 py-1 text-xs">
                    Đã có đánh giá
                  </span>
                ) : (
                  <span className="rounded-full border px-3 py-1 text-xs">
                    Chưa có đánh giá
                  </span>
                )}
              </div>

              {evaluationLoading ? (
                <div className="mb-4 rounded border bg-muted/30 p-3 text-sm">
                  Đang tải đánh giá hiện tại...
                </div>
              ) : null}

              {evaluationError ? (
                <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {evaluationError}
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Điểm đánh giá</label>
                  <select
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    disabled={detail.status !== 'Confirmed' || savingEvaluation}
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  >
                    <option value="1">1 sao</option>
                    <option value="2">2 sao</option>
                    <option value="3">3 sao</option>
                    <option value="4">4 sao</option>
                    <option value="5">5 sao</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Trạng thái đủ điều kiện</label>
                  <input
                    className="w-full rounded-lg border px-3 py-2 text-sm bg-muted/20"
                    disabled
                    value={detail.status === 'Confirmed' ? 'Có thể đánh giá' : 'Chưa thể đánh giá'}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Nhận xét</label>
                  <textarea
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    disabled={detail.status !== 'Confirmed' || savingEvaluation}
                    placeholder="Nhập nhận xét về thái độ, mức độ hợp tác, tinh thần trách nhiệm..."
                    rows={5}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-between gap-3">
                  <div className="text-muted-foreground text-xs">
                    {evaluation
                      ? `Lần cập nhật gần nhất: ${new Date(evaluation.updatedAt).toLocaleString('vi-VN')}`
                      : 'Chưa có đánh giá nào được lưu.'}
                  </div>

                  <button
                    className="rounded-lg bg-green-700 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
                    disabled={detail.status !== 'Confirmed' || savingEvaluation}
                    onClick={() => void saveEvaluation()}
                    type="button"
                  >
                    {savingEvaluation ? 'Đang lưu...' : evaluation ? 'Cập nhật đánh giá' : 'Lưu đánh giá'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </OrganizerLayout>
  );
};

export default OrganizerVolunteerDetails;