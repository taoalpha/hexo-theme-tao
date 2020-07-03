(() => {
  const socialIcon = document.querySelector(".follow");
  socialIcon && socialIcon.addEventListener('click', e => {
    e.preventDefault();
    const el = document.querySelector(".home-contact");
    el.classList.toggle('hidden');
    window.animateCSS(el, ['rotateInUpLeft']);
  });

  const searchTrigger = document.querySelector('.search-trigger');
  searchTrigger && searchTrigger.addEventListener('click', () => {
    const searchbox = document.querySelector('.searchbox') as HTMLInputElement;
    searchbox.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
    window.animateCSS(searchbox, ['wobble', 'fast']).then(() => {
      searchbox.focus();
    });
  });

  const locationIcon = document.querySelector('.location-icon');
  locationIcon && locationIcon.addEventListener('click', () => {
    document.querySelector('.location span').textContent = "";
    const input = document.querySelector('#cLocation') as HTMLInputElement;
    input.classList.remove('hidden');
    input.focus();
  });

  const locationForm = document.querySelector('form.location-form');
  locationForm && locationForm.addEventListener('submit', e => {
    e.preventDefault();
    var locationInput = document.querySelector('#cLocation') as HTMLInputElement;
    if (locationInput.value) {
      window.updateWeather(locationInput.value, "city")
    }
  });

  const themeIcon = document.querySelector("#dark-mode");
  themeIcon && themeIcon.addEventListener('click', e => {
    e.preventDefault();
    if (document.body.classList.contains('dark')) {
      localStorage.removeItem('dark-mode');
    } else {
      localStorage.setItem('dark-mode', "true");
    }
    document.body.classList.toggle("dark");
  });

  const el = document.querySelector('.series h2');
  el && el.addEventListener('click', e => {
    el.classList.toggle('expanded');
    el.nextElementSibling.classList.toggle('hidden');
    window.animateCSS(el.nextElementSibling, ['slideInDown']);
  });

  const reloadImage = document.querySelector('.reload-image');
  reloadImage && reloadImage.addEventListener('click', e => {
    return window.randomImage(/* force= */ true);
  });

  const filterEls = document.querySelectorAll('.filter');
  filterEls.forEach(el => el.addEventListener('click', e => {
    if (!el.classList.contains("active")) {
      // unselect all others
      filterEls.forEach(el => el.classList.remove("active"));
      el.classList.add("active");
      const filter = el.getAttribute('data-rel');
      if (filter.toLowerCase() === 'all') {
        // fake in all posts
        document.querySelectorAll('.post').forEach(el => {
          el.classList.remove('hidden');
          window.animateCSS(el, ['fadeIn']);
        });
      } else {
        document.querySelectorAll('.post').forEach(el => {
          const filters = el.getAttribute("data-filter");
          if (filters.split(" ").includes(filter)) {
            if (el.classList.contains('hidden')) {
              window.animateCSS(el, ['fadeIn']);
              el.classList.remove('hidden');
            }
          } else {
            el.classList.add('hidden');
          }
        });
      }
    }
  }));
})();