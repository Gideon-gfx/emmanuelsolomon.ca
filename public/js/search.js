async function loadIndex(){
  try{
    const r = await fetch('/search-index.json');
    if(!r.ok) return [];
    return await r.json();
  }catch(e){console.warn('search index load failed',e);return[]}
}

function qsParam(name){ const u=new URL(window.location.href); return u.searchParams.get(name); }

async function doSearch(q){
  const idx = await loadIndex();
  q = (q||'').toLowerCase().trim();
  if(!q) return idx.slice(0,10);
  return idx.filter(i=> (i.title||'').toLowerCase().includes(q) || (i.excerpt||'').toLowerCase().includes(q));
}

async function renderResults(q){
  const res = await doSearch(q);
  const out = document.getElementById('results');
  if(!out) return;
  if(res.length===0){ out.innerHTML = '<p>No results</p>'; return }
  out.innerHTML = '<ul>' + res.map(r=>`<li style="margin:8px 0"><a href="${r.path}">${r.title}</a><div style="color:#666">${r.excerpt||''}</div></li>`).join('') + '</ul>';
}

document.addEventListener('DOMContentLoaded', async ()=>{
  const q = qsParam('q') || '';
  const input = document.getElementById('q');
  if(input) input.value = q;
  await renderResults(q);
  document.getElementById('searchForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const val = (document.getElementById('q').value||'').trim();
    window.location = '/search.html?q=' + encodeURIComponent(val);
  });
});
