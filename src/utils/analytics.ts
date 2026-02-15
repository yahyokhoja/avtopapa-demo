declare global {
  interface Window {
    ym?: (counterId: number, action: 'reachGoal', goal: string, params?: Record<string, unknown>) => void;
  }
}

const metrikaCounterId = Number(process.env.REACT_APP_YANDEX_METRIKA_ID || 0);

export const trackEvent = (goal: string, params?: Record<string, unknown>) => {
  if (!metrikaCounterId || typeof window === 'undefined' || typeof window.ym !== 'function') {
    return;
  }
  window.ym(metrikaCounterId, 'reachGoal', goal, params);
};
