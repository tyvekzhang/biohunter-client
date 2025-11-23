import { AxiosResponse } from 'axios';

export function extractFilename(
  disposition: string | undefined,
): string | null {
  if (!disposition) return null;

  const filenameMatch = disposition.split(/;(.+)/)[1]?.split(/=(.+)/)[1];
  if (!filenameMatch) return null;

  let filename = filenameMatch;
  if (filename.toLowerCase().startsWith("utf-8''")) {
    filename = decodeURIComponent(filename.replace("utf-8''", ''));
  } else {
    filename = filename.replace(/['"]/g, '');
  }
  return filename;
}

export function downloadBlob(
  response: AxiosResponse,
  default_filename: string,
): void {
  const data: Blob = response.data;
  const disposition =
    response.headers['content-disposition'] ||
    response.headers['contentDisposition'];
  const filename = extractFilename(disposition) || default_filename;
  const url = window.URL.createObjectURL(data);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
