(async () => {
  const fetchJSON = async (url) => {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error('failed:' + r.status);
    return r.json();
  };
  const data = await fetchJSON('news/latest.json').catch(() => null);
  if (!data) {
    const c = document.querySelector('.container');
    if (c) c.innerHTML = '<p class="error-message">ニュースを取得できませんでした</p>';
    return;
  }

  const starStr = n => '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);
  const esc = (s) => (s || '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\\':'\\'}[c]));

  const h = data.highlight || null;
  if (h) {
    const sources = (h.sources || [])
      .map(s => `<a class="source-link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">出典: ${esc(s.name||'link')}</a>`)
      .join('');
    const el = document.querySelector('.highlight-section');
    if (el) el.innerHTML = `
      <div class="highlight-card">
        <span class="category">${esc(h.category||'')}</span>
        <span class="stars">${starStr(h.stars||0)}</span>
        <h2>${esc(h.title||'')}</h2>
        <p>${esc(h.summary||'')}</p>
        <div class="meta">${sources}</div>
      </div>`;
  }

  const renderCard = it => {
    const src = it.source || {};
    const date = it.date ? `<span>${esc(it.date)}</span>` : '';
    const link = src.url
      ? `<a class="source-link" href="${esc(src.url)}" target="_blank" rel="noopener noreferrer">出典: ${esc(src.name||'link')}</a>`
      : '';
    return `
      <article class="card">
        <span class="category">${esc(it.category||'')}</span>
        <span class="stars">${starStr(it.stars||0)}</span>
        <h3>${esc(it.title||'')}</h3>
        <p>${esc(it.blurb||'')}</p>
        <div class="meta">${date}${link}</div>
      </article>`;
  };

  ['business','tools','company','sns'].forEach(id => {
    const list = document.querySelector(`#${id} .card-list`);
    if (!list) return;
    const items = (data.sections&&data.sections[id])? data.sections[id] : [];
    list.innerHTML = items.map(renderCard).join('');
  });

  const f = document.querySelector('footer .updated-footer');
  const u = document.querySelector('.updated');
  if (data.generated_at) {
    const ts = new Date(data.generated_at);
    const text = `最終更新：${ts.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })} JST`;
    if (f) f.textContent = text;
    if (u) u.textContent = text;
  }
})();
