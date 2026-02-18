import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePortalData } from '../context/PortalDataContext';
import { useSiteContent } from '../context/SiteContentContext';
import { Booking, Review, User } from '../types';
import { getYouTubeEmbedUrl } from '../utils/media';
import './PortalPages.css';

type Tab = 'orders' | 'calendar' | 'users' | 'reviews' | 'superuser' | 'content';

const statusOptions: Booking['status'][] = ['new', 'in_progress', 'done', 'cancelled'];
const defaultTimeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];

const toIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const startOfWeekMonday = (date: Date) => {
  const value = new Date(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  value.setHours(0, 0, 0, 0);
  return value;
};
const addDays = (date: Date, days: number) => {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
};
const formatRuDate = (isoDate: string) => {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('ru-RU', { weekday: 'short', day: '2-digit', month: '2-digit' });
};
const isPastSlot = (date: string, time: string) => {
  const slot = new Date(`${date}T${time}:00`);
  return slot.getTime() <= Date.now();
};

const AdminPage: React.FC = () => {
  const { user, isReady, isAdmin, users, updateUser, resetUserPassword, createSuperUser } = useAuth();
  const { bookings, reviews, createBooking, updateBooking, deleteBooking, updateReview, deleteReview, createReview } = usePortalData();
  const { siteContent, updateSiteContent, updateSiteContentFromJson, resetSiteContentToDefault } = useSiteContent();

  const [tab, setTab] = useState<Tab>('orders');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editedUsers, setEditedUsers] = useState<Record<string, Pick<User, 'name' | 'phone' | 'email' | 'role'>>>({});
  const [newPassword, setNewPassword] = useState<Record<string, string>>({});
  const [editedBookings, setEditedBookings] = useState<
    Record<
      string,
      Pick<Booking, 'date' | 'time' | 'userName' | 'userPhone' | 'userEmail' | 'carBrand' | 'carModel' | 'problem' | 'status'>
    >
  >({});

  const [editedReviews, setEditedReviews] = useState<Record<string, Pick<Review, 'car' | 'rating' | 'text'>>>({});
  const [newReview, setNewReview] = useState({ userName: '', car: '', rating: 5, text: '' });

  const [superUserForm, setSuperUserForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });
  const [contentJson, setContentJson] = useState(JSON.stringify(siteContent, null, 2));
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [weekStartIso, setWeekStartIso] = useState(toIsoDate(startOfWeekMonday(new Date())));
  const [calendarMode, setCalendarMode] = useState<'create' | 'view' | 'edit'>('create');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [calendarForm, setCalendarForm] = useState({
    userId: '',
    userName: '',
    userPhone: '',
    userEmail: '',
    carBrand: '',
    carModel: '',
    year: '',
    problem: '',
    date: toIsoDate(new Date()),
    time: defaultTimeSlots[0] || '09:00',
    status: 'new' as Booking['status']
  });
  const calendarDetailsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setContentJson(JSON.stringify(siteContent, null, 2));
    setVideoUrlInput(siteContent.media.videoUrl || '');
  }, [siteContent]);

  const bookingTimeSlots = siteContent.booking.timeSlots.length > 0 ? siteContent.booking.timeSlots : defaultTimeSlots;
  const adminYouTubeEmbedUrl = useMemo(() => getYouTubeEmbedUrl(siteContent.media.videoUrl), [siteContent.media.videoUrl]);
  const todayIso = toIsoDate(new Date());
  const weekDates = useMemo(() => {
    const start = new Date(`${weekStartIso}T00:00:00`);
    return Array.from({ length: 7 }, (_, index) => toIsoDate(addDays(start, index)));
  }, [weekStartIso]);

  const bookingBySlot = useMemo(() => {
    const map: Record<string, Booking> = {};
    bookings.forEach((item) => {
      if (item.status === 'cancelled') {
        return;
      }
      map[`${item.date}_${item.time}`] = item;
    });
    return map;
  }, [bookings]);

  const allBusySlots = useMemo(() => {
    return bookings
      .filter((item) => item.status !== 'cancelled')
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  }, [bookings]);

  const selectedBooking =
    selectedBookingId ? bookings.find((item) => item.id === selectedBookingId) || null : null;

  if (!isReady) {
    return (
      <section className="portal-page">
        <div className="container">
          <p>Загрузка...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/cabinet" replace />;
  }
  const showResult = (ok: boolean, okMessage: string, failedMessage: string) => {
    if (ok) {
      setSuccess(okMessage);
      setError('');
    } else {
      setError(failedMessage);
      setSuccess('');
    }
  };

  const toDataUrl = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }
        reject(new Error('Не удалось прочитать файл'));
      };
      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.readAsDataURL(file);
    });
  };

  const addPhotoFromFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      showResult(false, '', 'Выберите файл изображения (jpg/png/webp)');
      return;
    }

    try {
      const dataUrl = await toDataUrl(file);
      updateSiteContent({
        ...siteContent,
        media: {
          ...siteContent.media,
          photos: [...siteContent.media.photos, dataUrl]
        }
      });
      setSuccess('Фото добавлено');
      setError('');
    } catch {
      showResult(false, '', 'Не удалось загрузить фото');
    }
  };

  const setVideoFromFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    if (!file.type.startsWith('video/')) {
      showResult(false, '', 'Выберите видеофайл (mp4/webm/ogg)');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      showResult(false, '', 'Видео больше 4 МБ. Используйте ссылку на видео, а не загрузку файла.');
      return;
    }

    try {
      const dataUrl = await toDataUrl(file);
      updateSiteContent({
        ...siteContent,
        media: {
          ...siteContent.media,
          videoUrl: dataUrl
        }
      });
      setSuccess('Видео обновлено');
      setError('');
    } catch {
      showResult(false, '', 'Не удалось загрузить видео');
    }
  };

  const addPhotoByUrl = (url: string) => {
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      return;
    }
    updateSiteContent({
      ...siteContent,
      media: {
        ...siteContent.media,
        photos: [...siteContent.media.photos, cleanUrl]
      }
    });
    setSuccess('Фото по ссылке добавлено');
    setError('');
  };

  const setVideoByUrl = (url: string) => {
    updateSiteContent({
      ...siteContent,
      media: {
        ...siteContent.media,
        videoUrl: url.trim()
      }
    });
    setSuccess('Ссылка на видео обновлена');
    setError('');
  };

  const removePhoto = (index: number) => {
    updateSiteContent({
      ...siteContent,
      media: {
        ...siteContent.media,
        photos: siteContent.media.photos.filter((_, photoIndex) => photoIndex !== index)
      }
    });
    setSuccess('Фото удалено');
    setError('');
  };

  const removeVideo = () => {
    updateSiteContent({
      ...siteContent,
      media: {
        ...siteContent.media,
        videoUrl: ''
      }
    });
    setVideoUrlInput('');
    setSuccess('Видео удалено');
    setError('');
  };

  const resetCalendarForm = (date?: string, time?: string) => {
    setCalendarForm({
      userId: '',
      userName: '',
      userPhone: '',
      userEmail: '',
      carBrand: '',
      carModel: '',
      year: '',
      problem: '',
      date: date || toIsoDate(new Date()),
      time: time || bookingTimeSlots[0] || '09:00',
      status: 'new'
    });
  };

  const openCreateInSlot = (date: string, time: string) => {
    if (isPastSlot(date, time)) {
      showResult(false, '', 'Нельзя создать заказ в прошедшее время');
      return;
    }
    setCalendarMode('create');
    setSelectedBookingId(null);
    resetCalendarForm(date, time);
    setSuccess(`Выбран пустой слот ${date} ${time}. Заполните данные для создания заказа.`);
    setError('');
    setTimeout(() => calendarDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const openViewBooking = (booking: Booking) => {
    setCalendarMode('view');
    setSelectedBookingId(booking.id);
    setCalendarForm({
      userId: booking.userId,
      userName: booking.userName,
      userPhone: booking.userPhone,
      userEmail: booking.userEmail,
      carBrand: booking.carBrand,
      carModel: booking.carModel,
      year: booking.year,
      problem: booking.problem,
      date: booking.date,
      time: booking.time,
      status: booking.status
    });
    setSuccess(`Открыт заказ: ${booking.date} ${booking.time}`);
    setError('');
    setTimeout(() => calendarDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const startEditingSelectedBooking = () => {
    if (!selectedBookingId) {
      showResult(false, '', 'Сначала выберите занятый слот');
      return;
    }
    setCalendarMode('edit');
  };

  const saveCalendarBooking = () => {
    if (!calendarForm.userName.trim() || !calendarForm.userPhone.trim() || !calendarForm.problem.trim()) {
      showResult(false, '', 'Заполните минимум: имя, телефон и проблему');
      return;
    }

    if (calendarMode === 'create') {
      const result = createBooking({
        userId: calendarForm.userId || 'admin-created',
        userName: calendarForm.userName.trim(),
        userPhone: calendarForm.userPhone.trim(),
        userEmail: calendarForm.userEmail.trim(),
        carBrand: calendarForm.carBrand.trim() || '-',
        carModel: calendarForm.carModel.trim() || '-',
        year: calendarForm.year.trim() || '-',
        problem: calendarForm.problem.trim(),
        date: calendarForm.date,
        time: calendarForm.time,
        status: calendarForm.status
      });
      showResult(Boolean(result.ok), 'Заказ создан', result.error || 'Не удалось создать заказ');
      if (result.ok) {
        resetCalendarForm(calendarForm.date, calendarForm.time);
      }
      return;
    }

    if (!selectedBookingId) {
      showResult(false, '', 'Выберите заказ для редактирования');
      return;
    }

    const result = updateBooking(selectedBookingId, {
      userId: calendarForm.userId || 'admin-created',
      userName: calendarForm.userName.trim(),
      userPhone: calendarForm.userPhone.trim(),
      userEmail: calendarForm.userEmail.trim(),
      carBrand: calendarForm.carBrand.trim() || '-',
      carModel: calendarForm.carModel.trim() || '-',
      year: calendarForm.year.trim() || '-',
      problem: calendarForm.problem.trim(),
      date: calendarForm.date,
      time: calendarForm.time,
      status: calendarForm.status
    });
    showResult(Boolean(result.ok), 'Заказ обновлен', result.error || 'Не удалось обновить заказ');
  };

  const removeCalendarBooking = () => {
    if (!selectedBookingId) {
      showResult(false, '', 'Выберите заказ для удаления');
      return;
    }
    const confirmed = window.confirm('Удалить этот заказ? Действие нельзя отменить.');
    if (!confirmed) {
      return;
    }
    deleteBooking(selectedBookingId);
    setCalendarMode('create');
    setSelectedBookingId(null);
    resetCalendarForm();
    setSuccess('Заказ удален');
    setError('');
  };

  const applyUserToCalendarForm = (userId: string) => {
    const selectedUser = users.find((item) => item.id === userId);
    if (!selectedUser) {
      setCalendarForm((prev) => ({ ...prev, userId }));
      return;
    }
    setCalendarForm((prev) => ({
      ...prev,
      userId,
      userName: selectedUser.name,
      userPhone: selectedUser.phone,
      userEmail: selectedUser.email
    }));
  };

  const saveEditedBookingFromTable = (bookingId: string) => {
    const edited = editedBookings[bookingId];
    if (!edited) {
      return;
    }
    const result = updateBooking(bookingId, edited);
    showResult(Boolean(result.ok), 'Заказ обновлен', result.error || 'Ошибка обновления заказа');
    if (result.ok) {
      setEditedBookings((prev) => {
        const copy = { ...prev };
        delete copy[bookingId];
        return copy;
      });
    }
  };

  return (
    <section className="portal-page">
      <div className="container portal-stack">
        <h2>Админ-панель</h2>
        <p>Управление заказами, календарем, пользователями, отзывами и суперпользователями.</p>

        <div className="portal-tabs">
          <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>
            Заказы
          </button>
          <button className={tab === 'calendar' ? 'active' : ''} onClick={() => setTab('calendar')}>
            Занятость
          </button>
          <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>
            Пользователи
          </button>
          <button className={tab === 'reviews' ? 'active' : ''} onClick={() => setTab('reviews')}>
            Отзывы
          </button>
          <button className={tab === 'superuser' ? 'active' : ''} onClick={() => setTab('superuser')}>
            Суперпользователь
          </button>
          <button className={tab === 'content' ? 'active' : ''} onClick={() => setTab('content')}>
            Контент сайта
          </button>
        </div>

        {tab === 'orders' && (
          <div className="portal-card">
            <h3>Все заказы</h3>
            <table className="portal-table portal-table-cards">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Время</th>
                  <th>Пользователь</th>
                  <th>Контакты</th>
                  <th>Марка</th>
                  <th>Модель</th>
                  <th>Причина обращения</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const edited = editedBookings[booking.id] || {
                    date: booking.date,
                    time: booking.time,
                    userName: booking.userName,
                    userPhone: booking.userPhone,
                    userEmail: booking.userEmail,
                    carBrand: booking.carBrand,
                    carModel: booking.carModel,
                    problem: booking.problem,
                    status: booking.status
                  };

                  return (
                    <tr key={booking.id}>
                      <td data-label="Дата">
                        <input
                          type="date"
                          value={edited.date}
                          onChange={(e) =>
                            setEditedBookings((prev) => ({
                              ...prev,
                              [booking.id]: { ...edited, date: e.target.value }
                            }))
                          }
                        />
                      </td>
                      <td data-label="Время">
                        <select
                          value={edited.time}
                          onChange={(e) =>
                            setEditedBookings((prev) => ({
                              ...prev,
                              [booking.id]: { ...edited, time: e.target.value }
                            }))
                          }
                        >
                          {bookingTimeSlots.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td data-label="Пользователь">
                        <input
                          value={edited.userName}
                          onChange={(e) =>
                            setEditedBookings((prev) => ({
                              ...prev,
                              [booking.id]: { ...edited, userName: e.target.value }
                            }))
                          }
                        />
                      </td>
                      <td data-label="Контакты">
                        <input
                          value={edited.userPhone}
                          onChange={(e) =>
                            setEditedBookings((prev) => ({
                              ...prev,
                              [booking.id]: { ...edited, userPhone: e.target.value }
                            }))
                          }
                        />
                        <input
                          value={edited.userEmail}
                          onChange={(e) =>
                            setEditedBookings((prev) => ({
                              ...prev,
                              [booking.id]: { ...edited, userEmail: e.target.value }
                            }))
                          }
                        />
                      </td>
                      <td data-label="Марка">
                        <input
                          value={edited.carBrand}
                          onChange={(e) =>
                            setEditedBookings((prev) => ({
                              ...prev,
                              [booking.id]: { ...edited, carBrand: e.target.value }
                            }))
                          }
                        />
                      </td>
                      <td data-label="Модель">
                        <input
                          value={edited.carModel}
                          onChange={(e) =>
                            setEditedBookings((prev) => ({
                              ...prev,
                              [booking.id]: { ...edited, carModel: e.target.value }
                            }))
                          }
                        />
                      </td>
                      <td data-label="Причина обращения">
                        <textarea
                          rows={2}
                          value={edited.problem}
                          onChange={(e) =>
                            setEditedBookings((prev) => ({
                              ...prev,
                              [booking.id]: { ...edited, problem: e.target.value }
                            }))
                          }
                        />
                      </td>
                      <td data-label="Статус">
                        <select
                          value={edited.status}
                          onChange={(e) =>
                            setEditedBookings((prev) => ({
                              ...prev,
                              [booking.id]: { ...edited, status: e.target.value as Booking['status'] }
                            }))
                          }
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td data-label="Действия">
                        <div className="portal-actions">
                          <button type="button" className="btn btn-outline" onClick={() => saveEditedBookingFromTable(booking.id)}>
                            Редактировать
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                              const confirmed = window.confirm('Удалить этот заказ? Действие нельзя отменить.');
                              if (!confirmed) {
                                return;
                              }
                              deleteBooking(booking.id);
                              setEditedBookings((prev) => {
                                const copy = { ...prev };
                                delete copy[booking.id];
                                return copy;
                              });
                              showResult(true, 'Заказ удален', '');
                            }}
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'calendar' && (
          <div className="portal-stack">
            <div className="portal-card">
              <h3>Календарь занятости (создание, редактирование, перенос)</h3>
              <div className="portal-actions" style={{ marginBottom: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    const current = new Date(`${weekStartIso}T00:00:00`);
                    setWeekStartIso(toIsoDate(addDays(current, -7)));
                  }}
                >
                  ← Предыдущая неделя
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setWeekStartIso(toIsoDate(startOfWeekMonday(new Date())))}
                >
                  Текущая неделя
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    const current = new Date(`${weekStartIso}T00:00:00`);
                    setWeekStartIso(toIsoDate(addDays(current, 7)));
                  }}
                >
                  Следующая неделя →
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Время</th>
                      {weekDates.map((date) => (
                        <th key={date} className={date === todayIso ? 'calendar-today-col' : ''}>
                          {formatRuDate(date)} {date === todayIso ? '• Сегодня' : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookingTimeSlots.map((time) => (
                      <tr key={time}>
                        <td>{time}</td>
                        {weekDates.map((date) => {
                          const booking = bookingBySlot[`${date}_${time}`];
                          const past = isPastSlot(date, time);
                          return (
                            <td key={`${date}_${time}`} className={date === todayIso ? 'calendar-today-col' : ''}>
                              {booking ? (
                                <button
                                  type="button"
                                  className="btn btn-outline calendar-slot-btn booked"
                                  onClick={() => openViewBooking(booking)}
                                >
                                  <strong>{booking.userName}</strong>
                                  <br />
                                  {booking.carBrand} {booking.carModel}
                                  <br />
                                  <span className="portal-badge">{booking.status}</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="btn btn-outline calendar-slot-btn empty"
                                  onClick={() => openCreateInSlot(date, time)}
                                  disabled={past}
                                >
                                  {past ? '—' : '+'}
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="portal-card">
              <h3>Все занятые слоты</h3>
              {allBusySlots.length === 0 ? (
                <p>Занятых слотов пока нет.</p>
              ) : (
                <table className="portal-table portal-table-cards">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Время</th>
                      <th>Клиент</th>
                      <th>Телефон</th>
                      <th>Авто</th>
                      <th>Причина</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBusySlots.map((booking) => (
                      <tr key={`busy-${booking.id}`}>
                        <td data-label="Дата">{booking.date}</td>
                        <td data-label="Время">{booking.time}</td>
                        <td data-label="Клиент">{booking.userName}</td>
                        <td data-label="Телефон">{booking.userPhone}</td>
                        <td data-label="Авто">{`${booking.carBrand} ${booking.carModel}`.trim()}</td>
                        <td data-label="Причина">{booking.problem}</td>
                        <td data-label="Статус">
                          <span className="portal-badge">{booking.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="portal-card" ref={calendarDetailsRef}>
              <h3>
                {calendarMode === 'create' && 'Добавить заказ в пустой слот'}
                {calendarMode === 'view' && 'Информация о заказе'}
                {calendarMode === 'edit' && 'Редактирование и перенос заказа'}
              </h3>
              {calendarMode === 'view' && selectedBooking ? (
                <div className="portal-stack">
                  <p>
                    Дата и время: <strong>{selectedBooking.date} {selectedBooking.time}</strong>
                  </p>
                  <p>
                    Клиент: <strong>{selectedBooking.userName}</strong>
                  </p>
                  <p>
                    Телефон: <strong>{selectedBooking.userPhone}</strong>
                  </p>
                  <p>
                    Email: <strong>{selectedBooking.userEmail || '-'}</strong>
                  </p>
                  <p>
                    Авто: <strong>{selectedBooking.carBrand} {selectedBooking.carModel}</strong>
                  </p>
                  <p>
                    Причина: <strong>{selectedBooking.problem}</strong>
                  </p>
                  <p>
                    Статус: <span className="portal-badge">{selectedBooking.status}</span>
                  </p>
                  <div className="portal-actions">
                    <button type="button" className="btn btn-outline" onClick={startEditingSelectedBooking}>
                      Редактировать заказ
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        setCalendarMode('create');
                        setSelectedBookingId(null);
                        resetCalendarForm();
                      }}
                    >
                      Новый заказ
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={removeCalendarBooking}>
                      Удалить заказ
                    </button>
                  </div>
                </div>
              ) : (
                <div className="portal-form">
                  <label htmlFor="calendar-user-select">Подставить пользователя</label>
                  <select
                    id="calendar-user-select"
                    value={calendarForm.userId}
                    onChange={(e) => applyUserToCalendarForm(e.target.value)}
                  >
                    <option value="">-- Ввести вручную --</option>
                    {users.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.email})
                      </option>
                    ))}
                  </select>

                  <div className="portal-form-row">
                    <div>
                      <label htmlFor="calendar-user-name">Имя</label>
                      <input
                        id="calendar-user-name"
                        value={calendarForm.userName}
                        onChange={(e) => setCalendarForm((prev) => ({ ...prev, userName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label htmlFor="calendar-user-phone">Телефон</label>
                      <input
                        id="calendar-user-phone"
                        value={calendarForm.userPhone}
                        onChange={(e) => setCalendarForm((prev) => ({ ...prev, userPhone: e.target.value }))}
                      />
                    </div>
                  </div>

                  <label htmlFor="calendar-user-email">Email</label>
                  <input
                    id="calendar-user-email"
                    value={calendarForm.userEmail}
                    onChange={(e) => setCalendarForm((prev) => ({ ...prev, userEmail: e.target.value }))}
                  />

                  <div className="portal-form-row">
                    <div>
                      <label htmlFor="calendar-date">Дата</label>
                      <input
                        id="calendar-date"
                        type="date"
                        value={calendarForm.date}
                        onChange={(e) => setCalendarForm((prev) => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label htmlFor="calendar-time">Время</label>
                      <select
                        id="calendar-time"
                        value={calendarForm.time}
                        onChange={(e) => setCalendarForm((prev) => ({ ...prev, time: e.target.value }))}
                      >
                        {bookingTimeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="portal-form-row">
                    <div>
                      <label htmlFor="calendar-car-brand">Марка авто</label>
                      <input
                        id="calendar-car-brand"
                        value={calendarForm.carBrand}
                        onChange={(e) => setCalendarForm((prev) => ({ ...prev, carBrand: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label htmlFor="calendar-car-model">Модель</label>
                      <input
                        id="calendar-car-model"
                        value={calendarForm.carModel}
                        onChange={(e) => setCalendarForm((prev) => ({ ...prev, carModel: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="portal-form-row">
                    <div>
                      <label htmlFor="calendar-year">Год</label>
                      <input
                        id="calendar-year"
                        value={calendarForm.year}
                        onChange={(e) => setCalendarForm((prev) => ({ ...prev, year: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label htmlFor="calendar-status">Статус</label>
                      <select
                        id="calendar-status"
                        value={calendarForm.status}
                        onChange={(e) => setCalendarForm((prev) => ({ ...prev, status: e.target.value as Booking['status'] }))}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <label htmlFor="calendar-problem">Проблема</label>
                  <textarea
                    id="calendar-problem"
                    rows={3}
                    value={calendarForm.problem}
                    onChange={(e) => setCalendarForm((prev) => ({ ...prev, problem: e.target.value }))}
                  />

                  <div className="portal-actions">
                    <button type="button" className="btn btn-primary" onClick={saveCalendarBooking}>
                      {calendarMode === 'create' ? 'Создать заказ' : 'Сохранить изменения'}
                    </button>
                    {calendarMode === 'edit' && (
                      <>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => {
                            setCalendarMode('create');
                            setSelectedBookingId(null);
                            resetCalendarForm();
                          }}
                        >
                          Новый заказ
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={removeCalendarBooking}>
                          Удалить заказ
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="portal-card">
            <h3>Редактирование пользователей</h3>
            <table className="portal-table portal-table-cards">
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Телефон</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Сброс пароля</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => {
                  const edited = editedUsers[item.id] || {
                    name: item.name,
                    phone: item.phone,
                    email: item.email,
                    role: item.role
                  };

                  return (
                    <tr key={item.id}>
                      <td data-label="Имя">
                        <input
                          value={edited.name}
                          onChange={(e) =>
                            setEditedUsers((prev) => ({
                              ...prev,
                              [item.id]: { ...edited, name: e.target.value }
                            }))
                          }
                        />
                      </td>
                      <td data-label="Телефон">
                        <input
                          value={edited.phone}
                          onChange={(e) =>
                            setEditedUsers((prev) => ({
                              ...prev,
                              [item.id]: { ...edited, phone: e.target.value }
                            }))
                          }
                        />
                      </td>
                      <td data-label="Email">
                        <input
                          type="email"
                          value={edited.email}
                          onChange={(e) =>
                            setEditedUsers((prev) => ({
                              ...prev,
                              [item.id]: { ...edited, email: e.target.value }
                            }))
                          }
                        />
                      </td>
                      <td data-label="Роль">
                        <select
                          value={edited.role}
                          onChange={(e) =>
                            setEditedUsers((prev) => ({
                              ...prev,
                              [item.id]: {
                                ...edited,
                                role: e.target.value as User['role']
                              }
                            }))
                          }
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td data-label="Сброс пароля">
                        <input
                          type="password"
                          placeholder="Новый пароль"
                          value={newPassword[item.id] || ''}
                          onChange={(e) =>
                            setNewPassword((prev) => ({
                              ...prev,
                              [item.id]: e.target.value
                            }))
                          }
                        />
                      </td>
                      <td data-label="Действия">
                        <div className="portal-actions">
                          <button
                            className="btn btn-outline"
                            type="button"
                            onClick={() => {
                              const result = updateUser(item.id, edited);
                              showResult(Boolean(result.ok), 'Пользователь обновлен', result.error || 'Ошибка обновления');
                            }}
                          >
                            Сохранить
                          </button>
                          <button
                            className="btn btn-secondary"
                            type="button"
                            onClick={() => {
                              const result = resetUserPassword(item.id, newPassword[item.id] || '');
                              showResult(Boolean(result.ok), 'Пароль сброшен', result.error || 'Ошибка сброса');
                              if (result.ok) {
                                setNewPassword((prev) => ({ ...prev, [item.id]: '' }));
                              }
                            }}
                          >
                            Сбросить
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'reviews' && (
          <div className="portal-stack">
            <div className="portal-card">
              <h3>Добавить отзыв от имени клиента</h3>
              <form
                className="portal-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const result = createReview({
                    userId: 'admin-created',
                    userName: newReview.userName,
                    car: newReview.car,
                    rating: newReview.rating,
                    text: newReview.text
                  });
                  showResult(Boolean(result.ok), 'Отзыв добавлен', result.error || 'Ошибка добавления');
                  if (result.ok) {
                    setNewReview({ userName: '', car: '', rating: 5, text: '' });
                  }
                }}
              >
                <div className="portal-form-row">
                  <div>
                    <label htmlFor="new-review-user">Имя</label>
                    <input
                      id="new-review-user"
                      value={newReview.userName}
                      onChange={(e) => setNewReview((prev) => ({ ...prev, userName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="new-review-car">Автомобиль</label>
                    <input
                      id="new-review-car"
                      value={newReview.car}
                      onChange={(e) => setNewReview((prev) => ({ ...prev, car: e.target.value }))}
                    />
                  </div>
                </div>
                <label htmlFor="new-review-rating">Оценка</label>
                <select
                  id="new-review-rating"
                  value={newReview.rating}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>

                <label htmlFor="new-review-text">Текст</label>
                <textarea
                  id="new-review-text"
                  value={newReview.text}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, text: e.target.value }))}
                  rows={4}
                />

                <button className="btn btn-primary" type="submit">
                  Добавить
                </button>
              </form>
            </div>

            <div className="portal-card">
              <h3>Редактирование отзывов</h3>
              <table className="portal-table portal-table-cards">
                <thead>
                  <tr>
                    <th>Автор</th>
                    <th>Авто</th>
                    <th>Оценка</th>
                    <th>Текст</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((item) => {
                    const edited = editedReviews[item.id] || {
                      car: item.car,
                      rating: item.rating,
                      text: item.text
                    };

                    return (
                      <tr key={item.id}>
                        <td data-label="Автор">{item.userName}</td>
                        <td data-label="Авто">
                          <input
                            value={edited.car}
                            onChange={(e) =>
                              setEditedReviews((prev) => ({
                                ...prev,
                                [item.id]: { ...edited, car: e.target.value }
                              }))
                            }
                          />
                        </td>
                        <td data-label="Оценка">
                          <select
                            value={edited.rating}
                            onChange={(e) =>
                              setEditedReviews((prev) => ({
                                ...prev,
                                [item.id]: { ...edited, rating: Number(e.target.value) }
                              }))
                            }
                          >
                            {[5, 4, 3, 2, 1].map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td data-label="Текст">
                          <textarea
                            value={edited.text}
                            rows={2}
                            onChange={(e) =>
                              setEditedReviews((prev) => ({
                                ...prev,
                                [item.id]: { ...edited, text: e.target.value }
                              }))
                            }
                          />
                        </td>
                        <td data-label="Действия">
                          <div className="portal-actions">
                            <button
                              className="btn btn-outline"
                              onClick={() => {
                                const result = updateReview(item.id, edited);
                                showResult(Boolean(result.ok), 'Отзыв обновлен', result.error || 'Ошибка обновления');
                              }}
                              type="button"
                            >
                              Сохранить
                            </button>
                            <button className="btn btn-secondary" onClick={() => deleteReview(item.id)} type="button">
                              Удалить
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'superuser' && (
          <div className="portal-card">
            <h3>Создать суперпользователя</h3>
            <p>Новый пользователь будет создан с ролью admin.</p>
            <form
              className="portal-form"
              onSubmit={(e) => {
                e.preventDefault();
                const result = createSuperUser(superUserForm);
                showResult(Boolean(result.ok), 'Суперпользователь создан', result.error || 'Ошибка создания');
                if (result.ok) {
                  setSuperUserForm({ name: '', phone: '', email: '', password: '' });
                }
              }}
            >
              <label htmlFor="su-name">Имя</label>
              <input
                id="su-name"
                value={superUserForm.name}
                onChange={(e) => setSuperUserForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
              <label htmlFor="su-phone">Телефон</label>
              <input
                id="su-phone"
                value={superUserForm.phone}
                onChange={(e) => setSuperUserForm((prev) => ({ ...prev, phone: e.target.value }))}
                required
              />
              <label htmlFor="su-email">Email</label>
              <input
                id="su-email"
                type="email"
                value={superUserForm.email}
                onChange={(e) => setSuperUserForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
              <label htmlFor="su-password">Пароль</label>
              <input
                id="su-password"
                type="password"
                value={superUserForm.password}
                onChange={(e) => setSuperUserForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />

              <button className="btn btn-primary" type="submit">
                Создать admin
              </button>
            </form>
          </div>
        )}

        {tab === 'content' && (
          <div className="portal-card">
            <h3>Фото и видео на сайте</h3>
            <p>Добавляйте изображения и видео. Фото появятся в блоке галереи, видео в блоке видеоплеера.</p>

            <div className="portal-stack">
              <div className="portal-form">
                <label htmlFor="content-photo-upload">Добавить фото файлом</label>
                <input id="content-photo-upload" type="file" accept="image/*" onChange={addPhotoFromFile} />
              </div>

              <div className="portal-form-row">
                <div>
                  <label htmlFor="content-photo-url">Добавить фото по ссылке</label>
                  <input
                    id="content-photo-url"
                    placeholder="https://example.com/photo.jpg"
                    value={photoUrlInput}
                    onChange={(e) => setPhotoUrlInput(e.target.value)}
                  />
                </div>
                <div style={{ alignSelf: 'end' }}>
                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={() => {
                      addPhotoByUrl(photoUrlInput);
                      setPhotoUrlInput('');
                    }}
                  >
                    Добавить фото
                  </button>
                </div>
              </div>

              {siteContent.media.photos.length > 0 && (
                <div className="portal-media-grid">
                  {siteContent.media.photos.map((photo, index) => (
                    <article key={`${photo.slice(0, 24)}-${index}`} className="portal-media-card">
                      <img src={photo} alt={`Фото ${index + 1}`} className="portal-media-preview" />
                      <button className="btn btn-secondary" type="button" onClick={() => removePhoto(index)}>
                        Удалить
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <hr style={{ margin: '1rem 0' }} />

            <div className="portal-stack">
              <div className="portal-form">
                <label htmlFor="content-video-upload">Загрузить видео файлом (до 4 МБ)</label>
                <input id="content-video-upload" type="file" accept="video/*" onChange={setVideoFromFile} />
              </div>

              <div className="portal-form-row">
                <div>
                  <label htmlFor="content-video-url">Ссылка на видео</label>
                  <input
                    id="content-video-url"
                    placeholder="https://example.com/video.mp4 или https://youtube.com/watch?v=..."
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                  />
                </div>
                <div style={{ alignSelf: 'end' }}>
                  <button className="btn btn-outline" type="button" onClick={() => setVideoByUrl(videoUrlInput)}>
                    Сохранить видео
                  </button>
                </div>
              </div>

              {siteContent.media.videoUrl && (
                <>
                  {adminYouTubeEmbedUrl ? (
                    <iframe
                      className="portal-media-video"
                      src={adminYouTubeEmbedUrl}
                      title="Превью видео"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      controls
                      preload="metadata"
                      className="portal-media-video"
                      src={siteContent.media.videoUrl}
                    />
                  )}
                  <button className="btn btn-secondary" type="button" onClick={removeVideo}>
                    Удалить видео
                  </button>
                </>
              )}
            </div>

            <hr style={{ margin: '1rem 0' }} />

            <h3>Редактирование JSON контента</h3>
            <p>Расширенный режим для правки всех текстов сайта.</p>
            <textarea
              value={contentJson}
              onChange={(e) => setContentJson(e.target.value)}
              rows={24}
              style={{ width: '100%', fontFamily: 'monospace' }}
            />
            <div className="portal-actions" style={{ marginTop: '0.75rem' }}>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  const result = updateSiteContentFromJson(contentJson);
                  showResult(Boolean(result.ok), 'Контент сайта обновлен', result.error || 'Ошибка сохранения контента');
                }}
              >
                Сохранить контент
              </button>
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => {
                  resetSiteContentToDefault();
                  setSuccess('Контент сброшен к значениям по умолчанию');
                  setError('');
                }}
              >
                Сбросить к умолчанию
              </button>
            </div>
          </div>
        )}

        {error && <p className="portal-error">{error}</p>}
        {success && <p className="portal-success">{success}</p>}
      </div>
    </section>
  );
};

export default AdminPage;
