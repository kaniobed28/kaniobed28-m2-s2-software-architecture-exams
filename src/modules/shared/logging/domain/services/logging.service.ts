export abstract class LoggingService {
  public abstract log(...args: any);
  public abstract warn(...args: any);
  public abstract error(...args: any);
}
