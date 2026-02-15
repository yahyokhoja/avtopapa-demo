import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePortalData } from '../context/PortalDataContext';
import { useSiteContent } from '../context/SiteContentContext';
import { Booking, Review, User } from '../types';
import './PortalPages.css';

type Tab = 'orders' | 'calendar' | 'users' | 'reviews' | 'superuser' | 'content';

const statusOptions: Booking['status'][] = ['new', 'in_progress', 'done', 'cancelled'];

const AdminPage: React.FC = () => {
  const { user, isReady, isAdmin, users, updateUser, resetUserPassword, createSuperUser } = useAuth();
  const { bookings, reviews, updateBookingStatus, updateReview, deleteReview, createReview } = usePortalData();
  const { siteContent, updateSiteContentFromJson, resetSiteContentToDefault } = useSiteContent();

  const [tab, setTab] = useState<Tab>('orders');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editedUsers, setEditedUsers] = useState<Record<string, Pick<User, 'name' | 'phone' | 'email' | 'role'>>>({});
  const [newPassword, setNewPassword] = useState<Record<string, string>>({});

  const [editedReviews, setEditedReviews] = useState<Record<string, Pick<Review, 'car' | 'rating' | 'text'>>>({});
  const [newReview, setNewReview] = useState({ userName: '', car: '', rating: 5, text: '' });

  const [superUserForm, setSuperUserForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });
  const [contentJson, setContentJson] = useState(JSON.stringify(siteContent, null, 2));

  useEffect(() => {
    setContentJson(JSON.stringify(siteContent, null, 2));
  }, [siteContent]);

  const busyCalendar = useMemo(() => {
    const map: Record<string, string[]> = {};
    bookings
      .filter((item) => item.status !== 'cancelled')
      .forEach((item) => {
        if (!map[item.date]) {
          map[item.date] = [];
        }
        map[item.date].push(item.time);
      });

    return Object.entries(map)
      .map(([date, times]) => ({ date, times: times.sort((a, b) => a.localeCompare(b)) }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [bookings]);

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
  const isSuperUserAccount = user.email === 'superadmin@avtopapa.local';

  const showResult = (ok: boolean, okMessage: string, failedMessage: string) => {
    if (ok) {
      setSuccess(okMessage);
      setError('');
    } else {
      setError(failedMessage);
      setSuccess('');
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
          {isSuperUserAccount && (
            <button className={tab === 'content' ? 'active' : ''} onClick={() => setTab('content')}>
              Контент сайта
            </button>
          )}
        </div>

        {tab === 'orders' && (
          <div className="portal-card">
            <h3>Все заказы</h3>
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Время</th>
                  <th>Пользователь</th>
                  <th>Контакты</th>
                  <th>Авто</th>
                  <th>Проблема</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.date}</td>
                    <td>{booking.time}</td>
                    <td>{booking.userName}</td>
                    <td>
                      {booking.userPhone}
                      <br />
                      {booking.userEmail}
                    </td>
                    <td>{`${booking.carBrand} ${booking.carModel}`.trim()}</td>
                    <td>{booking.problem}</td>
                    <td>
                      <select
                        value={booking.status}
                        onChange={(e) => updateBookingStatus(booking.id, e.target.value as Booking['status'])}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'calendar' && (
          <div className="portal-card">
            <h3>Календарь занятости</h3>
            {busyCalendar.length === 0 ? (
              <p>Пока занятых слотов нет.</p>
            ) : (
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Занятые слоты</th>
                  </tr>
                </thead>
                <tbody>
                  {busyCalendar.map((item) => (
                    <tr key={item.date}>
                      <td>{item.date}</td>
                      <td>{item.times.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'users' && (
          <div className="portal-card">
            <h3>Редактирование пользователей</h3>
            <table className="portal-table">
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
                      <td>
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
                      <td>
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
                      <td>
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
                      <td>
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
                      <td>
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
                      <td>
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
              <table className="portal-table">
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
                        <td>{item.userName}</td>
                        <td>
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
                        <td>
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
                        <td>
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
                        <td>
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

        {tab === 'content' && isSuperUserAccount && (
          <div className="portal-card">
            <h3>Редактирование содержимого сайта</h3>
            <p>Измените JSON и сохраните. Этот раздел доступен суперпользователю для правки всего контента сайта.</p>
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
