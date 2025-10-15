(function(){
  const btn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  if (!btn || !sidebar) return;
  const open  = () => { sidebar.classList.add('is-open'); document.body.classList.add('menu-open'); };
  const close = () => { sidebar.classList.remove('is-open'); document.body.classList.remove('menu-open'); };
  btn.addEventListener('click', () => sidebar.classList.contains('is-open') ? close() : open());
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') close(); });
  sidebar.addEventListener('click', (e)=>{ if (e.target.closest('a')) close(); });
})();
