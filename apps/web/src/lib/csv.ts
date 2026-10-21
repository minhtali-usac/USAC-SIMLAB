/** Download rows as a CSV file (Advanced level, brief §3). `meta` lines are written first as "# key: value" comments. */
export function downloadCsv(filename: string, header: string[], rows: (number | string)[][], meta: string[] = []) {
  const esc = (v: number | string) => (typeof v === 'number' ? String(v) : `"${String(v).replaceAll('"', '""')}"`);
  const body = [...meta.map((m) => `# ${m}`), header.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n');
  const blob = new Blob([body], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
