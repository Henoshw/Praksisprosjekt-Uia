(function(){
  // Mobilmeny
  var menuToggle = document.getElementById('menuToggle');
  var primaryNav = document.getElementById('primaryNav');
  menuToggle.addEventListener('click', function(){
    var open = primaryNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Prosjektdagbok: "Vis mer" / "Vis mindre"
  document.addEventListener('click', function(e){
    var openBtn = e.target.closest('.journal-open-btn');
    var closeBtn = e.target.closest('.journal-close-btn');
    if(openBtn){
      openBtn.closest('.journal-toggle').classList.add('is-open');
    } else if(closeBtn){
      var toggle = closeBtn.closest('.journal-toggle');
      toggle.classList.remove('is-open');
      toggle.closest('.journal-card').scrollIntoView({block:'start', behavior:'smooth'});
    }
  });

  // Prosjektdagbok: ukenavigasjon (klikk inn på en uke om gangen)
  var weekNavItems = document.querySelectorAll('.week-nav-item');
  var weekPanels = document.querySelectorAll('.week-panel');
  weekNavItems.forEach(function(item){
    item.addEventListener('click', function(e){
      e.preventDefault();
      var week = item.getAttribute('data-week');
      weekPanels.forEach(function(panel){
        panel.classList.toggle('active', panel.id === week);
      });
      weekNavItems.forEach(function(navItem){
        navItem.classList.toggle('active', navItem === item);
      });
    });
  });
})();
