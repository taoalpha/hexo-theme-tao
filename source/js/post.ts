(() => {
  const initHeading = function () {
    const h2: Array<{ name: string, id: string }> = [];
    const h3: Array<Array<{ name: string, id: string }>> = [];
    let h2index = 0;
    [...document.querySelectorAll(".entry h2, .entry h3")].forEach((item, index) => {
      if (item.tagName.toLowerCase() === 'h2') {
        h2.push({ name: item.textContent, id: `menuIndex${index}` });
        h2index++;
      } else {
        if (!h3[h2index - 1]) {
          h3[h2index - 1] = [];
        }
        h3[h2index - 1].push({ name: item.textContent, id: `menuIndex${index}` });
      }
      item.id = 'menuIndex' + index;
    });
    return {
      h2: h2,
      h3: h3
    };
  };

  var genTmpl = function () {
    const heading = initHeading();
    // no catalog when no h2
    if (!heading.h2.length) return '';
    const h1txt = document.querySelector('h1').textContent;
    let tmpl = `<ul><li class='h1'><a href='#'>${h1txt}</a></li>`;
    const h2 = heading.h2;
    const h3 = heading.h3;
    for (var i = 0; i < h2.length; i++) {
      tmpl += `<li><a href='#${h2[i].id}'>${h2[i].name}</a></li>`;
      if (h3[i] != null) {
        for (var j = 0; j < h3[i].length; j++) {
          if (h3[i][j]) {
            tmpl += `<li class='h3'><a href='#${h3[i][j].id}'>${h3[i][j].name}</a></li>`;
          }
        }
      }
    }
    return tmpl += '</ul>';
  };

  var genIndex = function () {
    const tmpl = genTmpl();
    if (tmpl) {
      const menuContainer = document.querySelector('#menuIndex');
      menuContainer.innerHTML = tmpl;
      menuContainer.classList.remove("hidden");
    }
  };

  // show the progress for reading
  const contentArea = document.querySelector('#content');
  contentArea && contentArea.addEventListener('scroll', e => {
    const contentHeight = (document.querySelector('.entry-content') as HTMLDivElement).offsetHeight;
    const currentScroll = document.querySelector('#content').scrollTop;
    const progressBar = document.querySelector('#progress-bar span.bg') as HTMLSpanElement;
    document.querySelector('#progress-bar').classList.remove('hidden');
    const percentage = Math.floor(currentScroll / contentHeight * 100);
    progressBar.style.width = percentage + "%";
    if (percentage < 1) {
      document.querySelector('#progress-bar').classList.add('hidden');
    }
  });

  genIndex();
})();