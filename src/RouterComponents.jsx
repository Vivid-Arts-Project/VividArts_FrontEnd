import { useEffect } from 'react';
import { navigate, resolveTarget } from './router';

export function Redirect({ to, replace = false }) {
  useEffect(() => navigate(to, { replace }), [to, replace]);
  return null;
}

export function Link({ to, onClick, target, children, ...props }) {
  const href = resolveTarget(to);

  const handleClick = (event) => {
    onClick?.(event);
    if (
      event.defaultPrevented || event.button !== 0 || target === '_blank' ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
    ) return;
    event.preventDefault();
    navigate(href);
  };

  return <a {...props} href={href} target={target} onClick={handleClick}>{children}</a>;
}
