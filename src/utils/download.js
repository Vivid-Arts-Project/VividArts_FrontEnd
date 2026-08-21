export function saveBlob(blob, filename) {
  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error('The server returned an empty invoice.');
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Revoking synchronously can cancel the download in some browsers.
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
