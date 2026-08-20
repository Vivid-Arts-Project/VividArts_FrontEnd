export function startVisiblePolling(task, intervalMs) {
  let stopped = false;
  let running = false;
  let timer;

  const schedule = () => {
    if (!stopped) timer = window.setTimeout(run, intervalMs);
  };

  const run = async () => {
    window.clearTimeout(timer);
    if (stopped) return;
    if (document.visibilityState === 'hidden' || running) {
      schedule();
      return;
    }
    running = true;
    try { await task(); }
    finally {
      running = false;
      schedule();
    }
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') run();
  };
  document.addEventListener('visibilitychange', onVisibilityChange);
  run();

  return () => {
    stopped = true;
    window.clearTimeout(timer);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}
