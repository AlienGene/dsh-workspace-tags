/** Stable plugin name (shown in the plugin inventory). */
declare const name = "workspace-tags";
interface HostLogger {
  warn?(message: string): void;
  error?(message: string): void;
}
/** The Cordis surface this plugin uses, declared structurally. */
interface HostContext {
  inject(names: readonly string[], callback: (ctx: HostContext) => void): void;
  effect(callback: () => (() => void) | void, label?: string): void;
  get<T = unknown>(key: string): T | undefined;
  logger?: HostLogger;
}
/**
 * Mount the plugin.
 * @param ctx - host context.
 */
declare function apply(ctx: HostContext): void;
export { HostContext, apply, name };