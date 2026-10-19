type LogContext = Readonly<Record<string, string | number | boolean | undefined>>;

function write(level: 'info' | 'warn' | 'error', message: string, context?: LogContext) {
  const safeContext = context ? Object.fromEntries(Object.entries(context).filter(([, value]) => value !== undefined)) : undefined;
  console[level](message, safeContext);
}

export const safeLogger = Object.freeze({
  info: (message: string, context?: LogContext) => write('info', message, context),
  warn: (message: string, context?: LogContext) => write('warn', message, context),
  error: (message: string, context?: LogContext) => write('error', message, context),
});
