interface LocalGaProcessedData {
  [key: string]: {
    pv: number;
    uv: number;
  }
}

(() => {

  window.animateCSS = (element: string | Element, animations: string[], prefix = 'animate__') =>
    // We create a Promise and return it
    new Promise((resolve, reject) => {
      const node = typeof element === "string" ? document.querySelector(element) : element;

      const animationClasses = ["animated", ...animations].map(a => `${prefix}${a}`);

      node.classList.add(...animationClasses);

      // When the animation ends, we clean the classes and resolve the Promise
      function handleAnimationEnd() {
        node.classList.remove(...animationClasses);
        node.removeEventListener('animationend', handleAnimationEnd);

        resolve('Animation ended');
      }

      node.addEventListener('animationend', handleAnimationEnd);
    });

  function getSettings() {
    const settingsStr = localStorage.getItem('settings');
    let settings: Settings = { imgUrls: {}, lastUpdate: {} };
    try {
      settings = JSON.parse(settingsStr) || settings;
    } catch (e) { }
    return settings;
  }

  function saveSettings(settings: Settings) {
    const oldSettings = getSettings();
    settings.imgUrls = { ...oldSettings.imgUrls, ...settings.imgUrls };
    settings.lastUpdate = { ...oldSettings.lastUpdate, ...settings.lastUpdate };
    settings.pixabayHits = settings.pixabayHits || oldSettings.pixabayHits;
    settings.weatherData = { ...oldSettings.weatherData, ...settings.weatherData };
    if (settings.enableLocation === undefined) {
      settings.enableLocation = oldSettings.enableLocation;
    }
    localStorage.setItem('settings', JSON.stringify(settings));
  }

  function isExpired(settings: Settings, field: string, expiration = 1000 * 60 * 60 * 12) {
    return !settings?.lastUpdate[field] ||
      (Date.now() - new Date(settings?.lastUpdate[field]).getTime() > expiration)
  }

  function getCurrentPosition() {
    return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
  }

  // Get user's location

  window.getLocation = () => {
    const settings = getSettings();
    const patchUpdates: Settings = { lastUpdate: {} };

    // get location and update weather info base on the request
    let p = Promise.resolve(null);
    // if weather info is not expired, just use it
    if (settings.weatherData && !isExpired(settings, 'weather', 1000 * 60 * 60)) {
      p = p.then(() => updateWeatherWithData(settings.weatherData, 'storage'));
    } else if (settings.enableLocation || settings.enableLocation === undefined) {
      p = p.then(() => getCurrentPosition())
        .then((loc: Position) => updateWeatherWithData(loc))
        .catch(e => {
          if (!e || !e.code || e.code === e.PERMISSION_DENIED) {
            patchUpdates.enableLocation = false;
          }
          return updateWeatherWithData(settings.cLocation ?? "beijing", "city");
        });
    } else {
      p = p.then(() => updateWeatherWithData(settings.cLocation ?? 'beijing', 'city'));
    }

    return p.then(weatherData => {
      patchUpdates.weatherData = weatherData;
      patchUpdates.lastUpdate["weather"] = `${new Date()}`;
    }).finally(() => {
      saveSettings(patchUpdates);
    });
  }

  // Update the Weather information
  function updateWeatherWithData(position: string | WeatherData | Position, flag = "") {
    let weatherUrl = ''
    if (flag === "city") {
      weatherUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + position + "&lang=zh_cn&units=metric&APPID=dc89c84c07cb6ee8c613334dbac4959c";
    } else if (flag === "storage") {
      return Promise.resolve(updateWeatherPart(position as WeatherData));
    } else {
      position = position as Position;
      weatherUrl = "https://api.openweathermap.org/data/2.5/weather?lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&lang=zh_cn&units=metric&APPID=dc89c84c07cb6ee8c613334dbac4959c";
    }

    return fetch(weatherUrl).then(r => r.json()).then((data: WeatherData) => updateWeatherPart(data));
  }

  // update weather with city name
  window.updateWeather = (city: string) => {
    const patchUpdates: Settings = { lastUpdate: {} };
    return updateWeatherWithData(city, "city").then(data => {
      if (data) {
        patchUpdates.weatherData = data;
        patchUpdates.lastUpdate["weather"] = `${new Date()}`;
        saveSettings(patchUpdates);
      }
    });
  }

  // update weather in the page
  function updateWeatherPart(data: WeatherData) {
    if (!data.name) {
      window.showAlert('fail', 'Fail to get weather info for the given location!');
      return;
    }
    var dt = data["dt"] * 1000
    var day = new Date(dt).getDate()
    var month = new Date(dt).getMonth()
    var firstDigitChars = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"]
    var secondDigitChars = ["", "十", "二十", "三十"]
    var monthChar = secondDigitChars[Math.floor(month / 10)] + firstDigitChars[month % 10 + 1]
    var dayChar = secondDigitChars[Math.floor(day / 10)] + firstDigitChars[day % 10]
    var dateStr = new Date(dt).toDateString()

    document.querySelector('.location span').textContent = data.name;
    document.querySelector('#cLocation').classList.add('hidden');
    document.querySelector('h2.weather-cn').innerHTML = monthChar + "月" + dayChar + "日:<span>" + data.weather[0].description + "</span>";
    document.querySelector('h3.weather-en').innerHTML = dateStr + ": <span>" + data.weather[0].main + "</span>";
    return data;
  }

  // Add limitation for tags and pick 8-10 tags randomly everytime

  window.randomTags = () => {
    var allTags = [...document.querySelectorAll('ul.tags a.tag')];
    for (var i = 1; i < allTags.length; i++) {
      if (Math.random() < (10 / allTags.length)) {
        allTags[i].classList.remove("hidden");
      }
    }
    const tags = document.querySelector('ul.tags');
    tags.classList.remove('hidden');
    window.animateCSS(tags, ["lightSpeedInLeft"]);
  }

  // Create random image for image frame.
  const maxRetry = 3;

  function setImage(img: PixabayHitImage) {
    const picBar = document.querySelector(".aside") as HTMLDivElement;
    if (!picBar) return img.largeImageURL;
    picBar.style.backgroundImage = "url(" + img.largeImageURL + ")";
    const imgEl = document.createElement('img');
    imgEl.addEventListener("error", e => {
      window.randomImage({ forceFetch: true });
    });
    imgEl.src = img.largeImageURL;
    return img.largeImageURL;
  }

  window.randomImage = ({ forceFetch = false, refresh = false, maxRetries = 3, retry = 0 } = {}) => {
    let p = Promise.resolve(null);
    const settings = getSettings();
    const patchUpdates: Settings = { lastUpdate: {}, imgUrls: {} };
    const path = location.pathname.split("/").slice(2).join("_") || "home";
    // if image is not expired, use it
    if (!forceFetch && !refresh && settings.imgUrls[path] && !isExpired(settings, `image_${path}`, 1000 * 60 * 30)) {
      p = p.then(() => setImage({ largeImageURL: settings.imgUrls[path] }));
      // 3 days expiration of the pixabay fetch data
    } else if (!forceFetch && settings.pixabayHits && !isExpired(settings, 'pixabay', 1000 * 60 * 60 * 24 * 2)) {
      // if data is still valid
      const hits = settings.pixabayHits;
      p = p.then(() => setImage(hits[Math.floor(Math.random() * hits.length)]));
    } else if (retry > maxRetries) {
      if (settings.pixabayHits) {
        const hits = settings.pixabayHits;
        p = p.then(() => setImage(hits[Math.floor(Math.random() * hits.length)]));
      }
      return p;
    } else {
      const API_KEY = "17273184-9351a5fdb089acc3a105a946c";
      const searchKeyWords = ["nature", "mountain", "sea", "sky", "universe", "river"];
      p = p.then(() => fetch(`https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(searchKeyWords[Math.floor(Math.random() * searchKeyWords.length + 1)])}&per_page=${encodeURIComponent(50)}&page=${Math.floor(Math.random() * 5 + 1)}`))
        .then(r => r.json())
        .then(data => {
          patchUpdates.pixabayHits = data.hits;
          patchUpdates.lastUpdate["pixabay"] = `${new Date()}`;
          return setImage(data.hits[Math.floor(Math.random() * data.hits.length)]);
        });
    }

    return p.then(imgUrl => {
      if (imgUrl) {
        patchUpdates.imgUrls[path] = imgUrl;
        patchUpdates.lastUpdate[`image_${path}`] = `${new Date()}`;
      }
    }).catch(e => {
      window.randomImage({ forceFetch, refresh, maxRetries, retry: retry + 1 });
    }).finally(() => {
      saveSettings(patchUpdates);
    });
  }

  function noCorsFetch(url: string) {
    return new Promise((r, rj) => {
      $.ajax({
        url,
        dataType: "jsonp",
        timeout: 1000 * 3,
        success: data => r(data),
        error: e => rj(e)
      })
    });
  }

  // Load pageview counts from Google Analytics

  window.getPageViewCount = () => {
    const url = 'https://taoalpha-github-page.appspot.com/query?id=ahZzfnRhb2FscGhhLWdpdGh1Yi1wYWdlchULEghBcGlRdWVyeRiAgICAgICACgw';
    return noCorsFetch(url)
      .catch(error => {
        console.log('Failed to get pageview from GAE!');
        return fetch('/blog/api/pageview.json').then(r => r.json());
      })
      .then((data: GaPageViewData) => {
        parsePageViewData(data.rows);
      });
  }

  function parsePageViewData(rows: GaPageViewRow[]) {
    if (!rows) {
      return
    }
    [...document.querySelectorAll('.post')].forEach((el, i) => {
      const postLink = el.querySelector('h2 a') as HTMLAnchorElement;
      const myPath = postLink && postLink.href;
      if (myPath) {
        var len = rows.length, cnt = 0
        for (var i = 0; i < len; i++) {
          var gaPath = rows[i][0];
          var queryId = gaPath.indexOf('?');
          var mainPath = queryId >= 0 ? gaPath.slice(0, queryId) : gaPath;
          if (!gaPath || gaPath === "/") continue;
          if (gaPath === myPath || mainPath === myPath
            || myPath.endsWith(gaPath)
            || mainPath === myPath + 'index.html' || myPath === mainPath + 'index.html'
            || ["tech-", "archived-", "tech-archived-", "thoughts-", "readings-"].some(
              prefix => myPath.replace(prefix, "") === gaPath
                || myPath.replace(prefix, "") === gaPath.replace(".html", "/")
            )
          ) {
            cnt += parseInt(rows[i][1]);
          }
        }
        if (cnt) {
          el.querySelector('span.view-count').innerHTML = "<i class='fa fa-eye'></i>" + cnt;
        }
      }
    })
  }

  // galog
  window.getGALogFile = () => {
    const url = 'https://taoalpha-github-page.appspot.com/query?id=ahZzfnRhb2FscGhhLWdpdGh1Yi1wYWdlchULEghBcGlRdWVyeRiAgICAq_OHCgw&format=json'
    return noCorsFetch(url)
      .catch(e => {
        return fetch('/blog/api/accesslog.json').then(r => r.json());
      })
      .then((data: GaLogFile) => {
        parseGALog(data);
      });
  }

  function parseGALog(data: GaLogFile) {
    const overalldata: {
      tpv: number;
      tuv: number;
      data_size: string;
      referer: string[];
      404: number;
    } = {
      tpv: 0,
      tuv: 0,
      data_size: "",
      referer: [],
      404: 0
    }
    overalldata.tpv = parseInt(data.totalsForAllResults["ga:pageviews"]);
    overalldata.tuv = parseInt(data.totalsForAllResults["ga:uniquePageviews"]);
    overalldata.data_size = (JSON.stringify(data).length / 8 / 1024).toFixed(2);

    const requestdata: LocalGaProcessedData = {};
    const refererdata: LocalGaProcessedData = {};
    const osdata: LocalGaProcessedData = {};
    const browserdata: LocalGaProcessedData = {};
    const countrydata: LocalGaProcessedData = {};
    const temp_data = data.rows;
    Object.keys(temp_data).forEach(k => {
      const v = temp_data[k];
      if (!(v[0] in overalldata.referer)) {
        overalldata.referer.push(v[0])
      }
      if (v[5] == "/blog/404") {
        overalldata['404'] += parseInt(v[7])
      }
      if (!requestdata[v[5]]) {
        requestdata[v[5]] = { pv: 0, uv: 0 };
        requestdata[v[5]]["pv"] = parseInt(v[7]);
        requestdata[v[5]]["uv"] = parseInt(v[8]);
      } else {
        requestdata[v[5]]["pv"] += parseInt(v[7]);
        requestdata[v[5]]["uv"] += parseInt(v[8]);
      }

      if (!countrydata[v[3]]) {
        countrydata[v[3]] = { pv: 0, uv: 0 };
        countrydata[v[3]]["pv"] = parseInt(v[7]);
        countrydata[v[3]]["uv"] = parseInt(v[8]);
      } else {
        countrydata[v[3]]["pv"] += parseInt(v[7]);
        countrydata[v[3]]["uv"] += parseInt(v[8]);
      }

      if (!refererdata[v[0]]) {
        refererdata[v[0]] = { pv: 0, uv: 0 };
        refererdata[v[0]]["pv"] = parseInt(v[7]);
        refererdata[v[0]]["uv"] = parseInt(v[8]);
      } else {
        refererdata[v[0]]["pv"] += parseInt(v[7]);
        refererdata[v[0]]["uv"] += parseInt(v[8]);
      }

      if (!osdata[v[2]]) {
        osdata[v[2]] = { pv: 0, uv: 0 };
        osdata[v[2]]["pv"] = parseInt(v[7]);
        osdata[v[2]]["uv"] = parseInt(v[8]);
      } else {
        osdata[v[2]]["pv"] += parseInt(v[7]);
        osdata[v[2]]["uv"] += parseInt(v[8]);
      }

      if (!browserdata[v[1]]) {
        browserdata[v[1]] = { pv: 0, uv: 0 };
        browserdata[v[1]]["pv"] = parseInt(v[7]);
        browserdata[v[1]]["uv"] = parseInt(v[8]);
      } else {
        browserdata[v[1]]["pv"] += parseInt(v[7]);
        browserdata[v[1]]["uv"] += parseInt(v[8]);
      }
    })

    // render overall part
    document.querySelector('li.overall summary').innerHTML = `<ul><li><span class='itemname'><i class='fa fa-bar-chart'></i>total pageviews</span> <span class='count'>${overalldata.tpv}</span></li><li><span class='itemname'><i class='fa fa-bar-chart'></i>total unique visitors</span> <span class='count'>${overalldata.tuv}</span></li><li><span class='itemname'><i class='fa fa-bar-chart'></i>referrers</span> <span class='count'>${overalldata.referer.length}</span></li><li><span class='itemname'><i class='fa fa-bar-chart'></i>total 404</span> <span class='count'>${overalldata['404']}</span></li><li><span class='itemname'><i class='fa fa-bar-chart'></i>log size</span> <span class='count'>${overalldata.data_size}kb</span></li><li><span class='itemname'><i class='fa fa-bar-chart'></i>log source</span> <span class='count'>ga</span></li></ul>`;

    showLogData(requestdata, overalldata.tpv, overalldata.tuv, 'Path')
    showLogData(refererdata, overalldata.tpv, overalldata.tuv, 'Referer')
    showLogData(osdata, overalldata.tpv, overalldata.tuv, 'OS')
    showLogData(browserdata, overalldata.tpv, overalldata.tuv, 'Browser')
    showLogData(countrydata, overalldata.tpv, overalldata.tuv, 'Country')
  }

  function showLogData(rq: LocalGaProcessedData, ptotal: number, utotal: number, id: string) {
    var script = `if($(this).hasClass('expanded')){$(this).removeClass('expanded').closest('thead').next('tbody').find('tr:nth-of-type(n+10)').hide();}else{$(this).addClass('expanded').closest('thead').next('tbody').find('tr').show()}`
    var thead = `<tr><th>PageViews</th><th>%</th><th>Unique PageViews</th><th>%</th><th class=''>__title__<span onclick=${script}><i class='fa fa-expand'></i></span></th></tr>`
    var tbodyitem = `<tr class='root'><td class='num'>__value_1__</td><td>__value_2__</td><td class='num'>__value_3__</td><td>__value_4__</td><td>__value_5__</td></tr>`
    var tbody = ''
    Object.keys(rq).forEach(k => {
      const v = rq[k];
      tbody += tbodyitem.replace('__value_1__', `${v.pv}`)
        .replace('__value_2__', (v.pv / ptotal * 100).toFixed(2))
        .replace('__value_3__', `${v.uv}`)
        .replace('__value_4__', (v.uv / utotal * 100).toFixed(2))
        .replace('__value_5__', k);
    });

    document.querySelector('li.' + id + ' thead').innerHTML = thead.replace('__title__', id);
    document.querySelector('li.' + id + ' tbody').innerHTML = tbody;
  }

  window.showAlert = (status: string, msg: string) => {
    const notification = document.querySelector('div.notification');
    notification.classList.remove('fail', 'success', 'alert');
    notification.classList.add(status);
    notification.textContent = msg;
    notification.classList.remove('hidden')
    window.animateCSS(notification, ['fadeOut', 'delay-5s']).then(() => {
      notification.classList.add('hidden')
    });
  }
})();