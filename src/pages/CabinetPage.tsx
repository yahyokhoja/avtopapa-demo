import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePortalData } from '../context/PortalDataContext';
import './PortalPages.css';

const CabinetPage: React.FC = () => {
  const { user, isReady, updateUser, changeOwnPassword } = useAuth();
  const { bookings, createReview } = usePortalData();

  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [error, setError] = useState('');

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    nextPassword: ''
  });

  const [reviewForm, setReviewForm] = useState({
    car: '',
    rating: 5,
    text: ''
  });

  useEffect(() => {
    if (!user) {
      return;
    }
    setProfileForm({
      name: user.name,
      phone: user.phone,
      email: user.email
    });
  }, [user]);

  const myBookings = useMemo(() => {
    if (!user) {
      return [];
    }
    return bookings
      .filter((item) => item.userId === user.id)
      .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
  }, [bookings, user]);

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

  const saveProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setProfileMsg('');

    const result = updateUser(user.id, profileForm);
    if (!result.ok) {
      setError(result.error || 'Не удалось обновить профиль');
      return;
    }
    setProfileMsg('Профиль обновлен');
  };

  const savePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setPasswordMsg('');

    const result = changeOwnPassword(passwordForm.currentPassword, passwordForm.nextPassword);
    if (!result.ok) {
      setError(result.error || 'Не удалось сменить пароль');
      return;
    }

    setPasswordMsg('Пароль изменен');
    setPasswordForm({ currentPassword: '', nextPassword: '' });
  };

  const submitReview = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const result = createReview({
      userId: user.id,
      userName: user.name,
      car: reviewForm.car,
      rating: reviewForm.rating,
      text: reviewForm.text
    });

    if (!result.ok) {
      setError(result.error || 'Не удалось отправить отзыв');
      return;
    }

    setReviewForm({ car: '', rating: 5, text: '' });
    setProfileMsg('Отзыв добавлен');
  };

  return (
    <section className="portal-page">
      <div className="container portal-stack">
        <h2>Личный кабинет</h2>
        <p>Здравствуйте, {user.name}. Здесь ваши данные, заявки и отзывы.</p>

        <div className="portal-grid">
          <div className="portal-card">
            <h3>Профиль</h3>
            <form className="portal-form" onSubmit={saveProfile}>
              <label htmlFor="profile-name">Имя</label>
              <input
                id="profile-name"
                value={profileForm.name}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
              />

              <label htmlFor="profile-phone">Телефон</label>
              <input
                id="profile-phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
              />

              <label htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
              />

              <button className="btn btn-primary" type="submit">
                Сохранить профиль
              </button>
            </form>
          </div>

          <div className="portal-card">
            <h3>Сменить пароль</h3>
            <form className="portal-form" onSubmit={savePassword}>
              <label htmlFor="current-password">Текущий пароль</label>
              <input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
              />

              <label htmlFor="next-password">Новый пароль</label>
              <input
                id="next-password"
                type="password"
                value={passwordForm.nextPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, nextPassword: e.target.value }))}
              />

              <button className="btn btn-secondary" type="submit">
                Обновить пароль
              </button>
            </form>
          </div>
        </div>

        <div className="portal-card">
          <h3>Добавить отзыв</h3>
          <form className="portal-form" onSubmit={submitReview}>
            <div className="portal-form-row">
              <div>
                <label htmlFor="review-car">Автомобиль</label>
                <input
                  id="review-car"
                  value={reviewForm.car}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, car: e.target.value }))}
                  placeholder="Например: Toyota Camry"
                />
              </div>
              <div>
                <label htmlFor="review-rating">Оценка</label>
                <select
                  id="review-rating"
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label htmlFor="review-text">Текст отзыва</label>
            <textarea
              id="review-text"
              value={reviewForm.text}
              onChange={(e) => setReviewForm((prev) => ({ ...prev, text: e.target.value }))}
              rows={4}
              placeholder="Опишите качество сервиса"
            />

            <button className="btn btn-primary" type="submit">
              Отправить отзыв
            </button>
          </form>
        </div>

        <div className="portal-card">
          <h3>Мои заказы</h3>
          {myBookings.length === 0 ? (
            <p>Пока нет заказов. Создайте запись через форму на главной странице.</p>
          ) : (
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Время</th>
                  <th>Авто</th>
                  <th>Проблема</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {myBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.date}</td>
                    <td>{booking.time}</td>
                    <td>{`${booking.carBrand} ${booking.carModel}`.trim()}</td>
                    <td>{booking.problem}</td>
                    <td>
                      <span className="portal-badge">{booking.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {error && <p className="portal-error">{error}</p>}
        {profileMsg && <p className="portal-success">{profileMsg}</p>}
        {passwordMsg && <p className="portal-success">{passwordMsg}</p>}
      </div>
    </section>
  );
};

export default CabinetPage;
