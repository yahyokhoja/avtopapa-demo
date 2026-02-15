import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PortalPages.css';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isReady, login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });

  if (!isReady) {
    return (
      <section className="portal-page">
        <div className="container">
          <p>Загрузка...</p>
        </div>
      </section>
    );
  }

  if (user) {
    return <Navigate to="/cabinet" replace />;
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (mode === 'login') {
      const result = login(form.email, form.password);
      if (!result.ok) {
        setError(result.error || 'Ошибка входа');
        return;
      }
      navigate('/cabinet');
      return;
    }

    const result = register({
      name: form.name,
      phone: form.phone,
      email: form.email,
      password: form.password
    });

    if (!result.ok) {
      setError(result.error || 'Ошибка регистрации');
      return;
    }
    navigate('/cabinet');
  };

  return (
    <section className="portal-page">
      <div className="container">
        <div className="portal-card" style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2>{mode === 'login' ? 'Вход в кабинет' : 'Регистрация пользователя'}</h2>
          <p>
            {mode === 'login'
              ? 'Войдите, чтобы управлять своими заявками и оставлять отзывы.'
              : 'После регистрации вы получите личный кабинет.'}
          </p>

          <div className="portal-tabs" style={{ marginBottom: '1rem' }}>
            <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
              Вход
            </button>
            <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
              Регистрация
            </button>
          </div>

          <form className="portal-form" onSubmit={onSubmit}>
            {mode === 'register' && (
              <>
                <label htmlFor="name">Имя</label>
                <input id="name" name="name" value={form.name} onChange={onChange} required />

                <label htmlFor="phone">Телефон</label>
                <input id="phone" name="phone" value={form.phone} onChange={onChange} required />
              </>
            )}

            <label htmlFor="email">Email</label>
            <input id="email" type="email" name="email" value={form.email} onChange={onChange} required />

            <label htmlFor="password">Пароль</label>
            <input id="password" type="password" name="password" value={form.password} onChange={onChange} required />

            {error && <p className="portal-error">{error}</p>}

            <button type="submit" className="btn btn-primary">
              {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AuthPage;
