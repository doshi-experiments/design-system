// A host-specific adapter. Storage failures must not block the initial render.
try {
  const value = localStorage.getItem('doshi-preview-appearance');
  if (!document.documentElement.dataset.theme && ['light', 'dark'].includes(value)) document.documentElement.dataset.theme = value;
} catch {}
