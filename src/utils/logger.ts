// Logger utility for development and production
class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  log(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(`[LOG] ${message}`, data);
    }
  }

  error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`, error);
  }

  warn(message: string, data?: any): void {
    console.warn(`[WARN] ${message}`, data);
  }

  info(message: string, data?: any): void {
    console.info(`[INFO] ${message}`, data);
  }
}

export default new Logger();
