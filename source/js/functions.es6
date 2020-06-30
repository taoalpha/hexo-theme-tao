Array.prototype.getObjectUnique = (id) => {
  var a=b=[];
  var add = (data) => {
    b.push(data[id])
    return data
  }
  for (i in this) {
    if(b.indexOf(i[id])==-1){
      add(i)
    }
  }
}

// inhibit the alert function
window._alert = window.alert
window.alert = (msg,showItNow) => {
  if(showItNow){
    window._alert(msg) 
  }
}


// show the debug message on the page if in debug mode
if(!$.cookie('debugMode')){
  $.cookie('debugMode',0)
}
location.search.replace("?",'').split('&').forEach((item)=>{
  var subs = item.split('=')
  if(subs[0]=='debug' && subs[1] == 'on'){
    $.cookie('debugMode',1)
    window.debugMode = 1
  }else if(subs[0]=='debug' && subs[1] == 'off'){
    $.cookie('debugMode',0)
    window.debugMode = 0
  }
})

// get the latest cookie
window.debugMode = $.cookie('debugMode')

// if in debug mode, print all log on the page

window._console = console
window._console._log = console.log
console.log = (msg) =>{
  if(window.debugMode=="1"){
    showAlert('alert',msg)
  }else{
    _console._log(msg)
  }
}

jQuery.fn.rotate = (degrees) =>{
  var rotatecss ={
    "-webkit-transform": "rotate(#{degrees}deg)",
    "-moz-transform": "rotate(#{degrees}deg)",
    "-ms-transform": "rotate(#{degrees}deg)",
    "transform": "rotate(#{degrees}deg)"
  }
  $(this).css(rotatecss)
  return $(this)
}


// Get user's location

window.getLocation = () => {
  var weatherData = $.cookie("weatherData")
  var cLocation = $.cookie("cLocation")
  var path_prefix = location.pathname.split("/")[2]
  var weatherImgUrl = $.cookie(path_prefix+"weatherImgUrl")
  var enableLocation= $.cookie("enableLocation") === 0 ? 0 : 1
  if(!weatherImgUrl){
    randomImage(path_prefix)
  }else{
    $(".aside").css('background-image',`url(${weatherImgUrl})`)
  }
  if(weatherData){
    updateWeather(JSON.parse(weatherData),"cookie")
    return
  }else if(cLocation){
    updateWeather(cLocation,"cityname")
    return
  }
  if (enableLocation && navigator.geolocation){
    $.cookie("enableLocation",1);
    navigator.geolocation.getCurrentPosition(updateWeather,showError)
  }else{
    //_alert("Geolocation is not supported by this browser.")
    updateWeather("beijing", "cityname")
  }
}

// Show Error
window.showError = (e) => {
  switch (e.code) {
    case e.PERMISSION_DENIED:
      console.log("You denied the request for Geolocation.")
      $.cookie("enableLocation",0);
      updateWeather("beijing", "cityname")
      break;
    case e.POSITION_UNAVAILABLE:
      console.log("Location information is unavailable.")
      updateWeather("beijing", "cityname")
      break;
    case e.TIMEOUT:
      console.log("The request to get user location timed out.")
      updateWeather("beijing", "cityname")
      break;
    case e.UNKNOWN_ERROR:
      console.log("Unknow error")
      updateWeather("beijing", "cityname")
  }
}

// Support customize location
window.customLocation = () => {
  $('.location').find("span").text("")
  $('input#cLocation').show().focus()
}

window.updateLocation = () =>{
  var cLocation = $('input#cLocation').val()
  updateWeather(cLocation,"cityname")
}

// Update the Weather information
window.updateWeather = (position, flag) =>{
  var weatherUrl = ''
  if (flag === "cityname") {
    weatherUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + position + "&lang=zh_cn&units=metric&APPID=dc89c84c07cb6ee8c613334dbac4959c";
  } else if (flag === "cookie") {
    updateWeatherPart(position);
    return;
  } else {
    weatherUrl = "https://api.openweathermap.org/data/2.5/weather?lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&lang=zh_cn&units=metric&APPID=dc89c84c07cb6ee8c613334dbac4959c";
  }
  
  $.ajax({
    url: weatherUrl,
    dataType: 'jsonp',
    timeout: 1000 * 3,
    success: (data) => {
      $.cookie("weatherData", JSON.stringify(data), {
        expires: 0.3,
        path: '/'
      });
      return updateWeatherPart(data);
    },
    error: () => {}
  });
}

// update weather in the page
window.updateWeatherPart = (data) => {
  var dt = data["dt"]*1000
  var day = new Date(dt).getDate()
  var month = new Date(dt).getMonth()
  var Dcharacters = ["","一","二","三","四","五","六","七","八","九","十"]
  var Mcharacters = ["","十","二十","三十"]
  var ZdataM = Mcharacters[Math.floor(month/10)]+Dcharacters[month % 10+1]
  var ZdataD = Mcharacters[Math.floor(day/10)]+Dcharacters[day % 10]
  var Edata = new Date(dt).toDateString()

  $('.location span').text(data.name);
  // update clocation
  $.cookie("cLocation", data.name, {
    expires: 7,
    path: "/"
  });
  $('input#cLocation').hide();
  $('h2.weather-cn').html(ZdataM + "月" + ZdataD + "日:<span>" + data['weather'][0]["description"] + "</span>");
  $('h3.weather-en').html(Edata + ": <span>" + data['weather'][0]["main"] + "</span>");
}

// Add limitation for tags and pick 8-10 tags randomly everytime

window.randomTags = () =>{
  var originArray = $('ul.tags').find('a.tag')
  originArray.eq(0).show();
  for (var i = 0; i <= 10; i++) {
    originArray.eq(Math.floor(Math.random() * originArray.length) + 1).show();
  }
}

// Create random image for image frame.
const maxRetry = 3;
let topHits;

function setImage(path, img) {
  $(".aside").css("background-image", "url(" + img.largeImageURL + ")");
  $.cookie(path + "weatherImgUrl", img.largeImageURL, {
    expires: 0.5,
    path: '/blog'
  });
}

window.randomImage = (path, retry = 0) => {
  if (retry > maxRetry) return;
  if (topHits && topHits.length) {
    return setImage(path, topHits[Math.floor(Math.random() * topHits.length)]);
  }
  const API_KEY = "17273184-9351a5fdb089acc3a105a946c";
  $.ajax({
    url: "https://pixabay.com/api/?key="+API_KEY+"&q="+encodeURIComponent('nature'),
    dataType: 'jsonp',
    timeout: 1000 * 3,
    success: (data) => {
      topHits = data.hits;
      setImage(path, data.hits[Math.floor(Math.random() * data.hits.length)]);
    },
    error: () => {
      return randomImage(path, retry+1);
    }
  })
}

// Load pageview counts from Google Analytics

window.getPageViewCount = (dataurl) => {
  if (!dataurl) {
    dataurl = 'https://taoalpha-github-page.appspot.com/query?id=ahZzfnRhb2FscGhhLWdpdGh1Yi1wYWdlchULEghBcGlRdWVyeRiAgICAgICACgw';
  }
  $.ajax({
    url: dataurl,
    dataType: 'jsonp',
    timeout: 1000 * 3,
    success: (data) => {
      parsePageViewData(data.rows);
    },
    error: () => {
      console.log('Failed to get pageview from GAE!');
      $.ajax({
        url: '/blog/api/pageview.json',
        dataType: 'json',
        success: (data) => {
          console.log('Local page view backup file.');
          parsePageViewData(data.rows);
        }
      })
    }
  })
}

window.parsePageViewData = (rows) => {
  if (!rows) {
    return
  }
  $('.post').each(function(i,v) {
    var myPath = $(v).find('h2 a').attr('href');
    if (myPath) {
      var len = rows.length, cnt = 0
      for (var i = 0; i < len; i++) {
        var gaPath = rows[i][0];
        var queryId = gaPath.indexOf('?');
        var mainPath = queryId >= 0 ? gaPath.slice(0, queryId) : gaPath;
        if (gaPath === myPath || mainPath === myPath
            || mainPath === myPath + 'index.html' || myPath === mainPath + 'index.html'
            || ["tech-", "archived-", "tech-archived-", "thoughts-", "readings-"].some(function(prefix) { return myPath.replace(prefix, "") === gaPath || myPath.replace(prefix, "") === gaPath.replace(".html", "/")})
          ) {
          cnt += parseInt(rows[i][1]);
        }
      }
      if (cnt) {
        $(v).find('span.viewcount').html("<i class='fa fa-eye'></i>" + cnt);
      }
    }
  })
}

window.search = (query) => {
  var inverted_index = JSON.parse($('p#indexdata').text()),result = [],dict = $('p#worddicts').text().split(",")
  ,stop = ["the","of","is","and","to","in","that","we","for","an","are","by","be","as","on","with","can","if","from","which","you","it","this","then","at","have","all","not","one","has","or","that","的","了","和","是","就","都","而","及","與","著","或","一個","沒有","我們","你們","妳們","他們","她們","是否"]
  ,query = query.toLowerCase().replace(/[(^\s+)(\s+$)]/g,"")
  ,splitwords = []
  $.each(dict,(k,v) => {
    if(query.indexOf(v)>-1){
      splitwords.push(v)
    }
  })
  if(splitwords.length){
    $.each(splitwords,(k,v) =>{
      result = result.concat(inverted_index[v])
    })
    showSearchResult(result.getObjectUnique('post_url'))
  }else{
    $('ul.article-list').empty().append('<li class="post"><h2>无结果, 请更换查询词</h2></li>')
  }
}

window.showSearchResult = (data) => {
  $('ul.article-list').empty();
  var template = '<li class="post"><h2><a href="__post_url__">__post_title__</a></h2><summary class="title-excerpt">__post_desc__</summary><div class="post-info"><span class="author"><i class="fa fa-user"></i><a href="__post_author_url__">__post_author__</a></span><span class="category"><i class="fa fa-briefcase"></i><a href="__post_category_url__">__post_category__</a></span><span class="postdate"><i class="fa fa-history"></i>__post_date__</span><span class="viewcount"></span></div></li>';
  $.each(data,(k,v)=>{
    var child = template.replace("__post_url__", "/blog" + v.post_url).replace("__post_title__", v.post_title).replace("__post_desc__", v.post_content + "...").replace("__post_author_url__", "/blog/author/" + v.post_author).replace("__post_author__", v.post_author).replace("__post_category_url__", v.post_category === "blog" ? "/blog" : "/blog/" + v.post_category).replace("__post_category__", v.post_category).replace("__post_date__", v.post_date.replace('00:00:00 +0800', ''));
    $('ul.article-list').prepend(child)
  })
}

// function for sending emails
window.sendMail = (msg)=>{
  $.ajax({
    type: 'POST',
    url: 'https://mandrillapp.com/api/1.0/messages/send.json',
    data: {
      'key': 'JMwEKDDW1NuLbxUrK4ELhQ',
      'message': {
        'from_email': msg.sender_mail,
        'from_name': msg.sender_name,
        'to': [
          {
            'email': 'iamzhoutao92@gmail.com',
            'name': 'TaoAlpha',
            'type': 'to'
          }
        ],
        'autotext': 'true',
        'subject': msg.subject,
        'html': msg.content
      }
    }
  }).done(function(response) {
    return showAlert("success", "Thanks for your message!", 8000);
  }).fail(function(data) {
    return showAlert("fail", "Sorry! Failed to send the email. Please retry!", 8000);
  })
}

// galog

window.getGALogFile = (dataurl) => {
  if(!dataurl){
    dataurl = 'https://taoalpha-github-page.appspot.com/query?id=ahZzfnRhb2FscGhhLWdpdGh1Yi1wYWdlchULEghBcGlRdWVyeRiAgICAq_OHCgw&format=json'
  }
  $.ajax({
    url: dataurl,
    dataType: 'jsonp',
    timeout: 1000 * 3,
    success: function(data) {
      parseGALog(data);
    },
    error: function() {
      console.log('Failed to get GA Log File from GAE!');
      $.ajax({
        url: '/blog/api/accesslog.json',
        dataType: 'json',
        success: function(data) {
          console.log('Local page view backup file.');
          return parseGALog(data);
        }
      })
    }
  })
}

window.parseGALog = (data) => {
  var overalldata = {}
  overalldata.tpv = data["totalsForAllResults"]["ga:pageviews"]
  overalldata.tuv = data["totalsForAllResults"]["ga:uniquePageviews"]
  overalldata.datasize = parseFloat(JSON.stringify(data).length/8/1024).toFixed(2)
  overalldata.referer = []
  overalldata['404'] = 0

  var requestdata = {},refererdata = {},osdata = {},browserdata = {},countrydata = {},temp_data = data.rows
  $.each(temp_data,(k,v) =>{
    if (!(v[0] in overalldata.referer)){
      overalldata.referer.push(v[0])
    }
    if(v[5] == "/blog/404"){
      overalldata['404'] += parseInt(v[7]) 
    }
    if (!requestdata[v[5]]) {
      requestdata[v[5]] = {};
      requestdata[v[5]]["pv"] = parseInt(v[7]);
      requestdata[v[5]]["uv"] = parseInt(v[8]);
    } else {
      requestdata[v[5]]["pv"] += parseInt(v[7]);
      requestdata[v[5]]["uv"] += parseInt(v[8]);
    }
    
    if (!countrydata[v[3]]) {
      countrydata[v[3]] = {};
      countrydata[v[3]]["pv"] = parseInt(v[7]);
      countrydata[v[3]]["uv"] = parseInt(v[8]);
    } else {
      countrydata[v[3]]["pv"] += parseInt(v[7]);
      countrydata[v[3]]["uv"] += parseInt(v[8]);
    }
    
    if (!refererdata[v[0]]) {
      refererdata[v[0]] = {};
      refererdata[v[0]]["pv"] = parseInt(v[7]);
      refererdata[v[0]]["uv"] = parseInt(v[8]);
    } else {
      refererdata[v[0]]["pv"] += parseInt(v[7]);
      refererdata[v[0]]["uv"] += parseInt(v[8]);
    }
    
    if (!osdata[v[2]]) {
      osdata[v[2]] = {};
      osdata[v[2]]["pv"] = parseInt(v[7]);
      osdata[v[2]]["uv"] = parseInt(v[8]);
    } else {
      osdata[v[2]]["pv"] += parseInt(v[7]);
      osdata[v[2]]["uv"] += parseInt(v[8]);
    }
    
    if (!browserdata[v[1]]) {
      browserdata[v[1]] = {};
      browserdata[v[1]]["pv"] = parseInt(v[7]);
      browserdata[v[1]]["uv"] = parseInt(v[8]);
    } else {
      browserdata[v[1]]["pv"] += parseInt(v[7]);
      browserdata[v[1]]["uv"] += parseInt(v[8]);
    }
 })

  // render overall part
  $('li.overall').find('summary').html(`<ul><li><span class='itemname'><i class='fa fa-bar-chart'></i>total pageviews</span> <span class='count'>${overalldata.tpv}</span></li><li><span class='itemname'><i class='fa fa-bar-chart'></i>total unique visitors</span> <span class='count'>${overalldata.tuv}</span></li><li><span class='itemname'><i class='fa fa-bar-chart'></i>referrers</span> <span class='count'>${overalldata.referer.length}</span></li><li><span class='itemname'><i class='fa fa-bar-chart'></i>total 404</span> <span class='count'>${overalldata['404']}</span></li><li><span class='itemname'><i class='fa fa-bar-chart'></i>log size</span> <span class='count'>${overalldata.datasize}kb</span></li><li><span class='itemname'><i class='fa fa-bar-chart'></i>log source</span> <span class='count'>ga</span></li></ul>`)

  showLogData(requestdata,parseInt(overalldata.tpv),parseInt(overalldata.tuv),'Path')
  showLogData(refererdata,parseInt(overalldata.tpv),parseInt(overalldata.tuv),'Referer')
  showLogData(osdata,parseInt(overalldata.tpv),parseInt(overalldata.tuv),'OS')
  showLogData(browserdata,parseInt(overalldata.tpv),parseInt(overalldata.tuv),'Browser')
  showLogData(countrydata,parseInt(overalldata.tpv),parseInt(overalldata.tuv),'Country')
}

window.showLogData = (rq,ptotal,utotal,id) => {
  var script = `if($(this).hasClass('expanded')){$(this).removeClass('expanded').closest('thead').next('tbody').find('tr:nth-of-type(n+10)').hide();}else{$(this).addClass('expanded').closest('thead').next('tbody').find('tr').show()}`
  var thead = `<tr><th>PageViews</th><th>%</th><th>Unique PageViews</th><th>%</th><th class=''>__title__<span onclick=${script}><i class='fa fa-expand'></i></span></th></tr>`
  var tbodyitem = `<tr class='root'><td class='num'>__value_1__</td><td>__value_2__</td><td class='num'>__value_3__</td><td>__value_4__</td><td>__value_5__</td></tr>`
  var tbody = ''
  $.each(rq, (k,v) => {
    tbody += tbodyitem.replace('__value_1__',v['pv']).replace('__value_2__',(v['pv']/ptotal*100).toFixed(2)).replace('__value_3__',v['uv']).replace('__value_4__',(v['uv']/utotal*100).toFixed(2)).replace('__value_5__',k)
  })

  $('li.'+id).find('thead').html(thead.replace('__title__',id))
  $('li.'+id).find('tbody').html(tbody)
}

window.showAlert = (status,msg,duration) =>{
  if (typeof duration !== "undefined" && duration !== null) {
    duration = 8000;
  }
  $('div.notification').stop().fadeIn().removeClass('fail success alert').addClass(status).html(msg).show().fadeOut(duration);
}

window.passwordNeeded = () => {
  let content = $('div.entry-content').html();
  $('div.entry-content').html('<p>Sorry, You need a password to see this post :) </p><p>This is a private post, and only people invited can watch, do not try to decrypt it, thanks for your cooperation.</p>');
  setTimeout( () => {
    let holywords = "U2FsdGVkX18ht85IwrbNtkElznGrxrhg6IGhPbhKcmc=",
      key = prompt("This post needs password to see:"),
      pwd = CryptoJS.AES.decrypt(holywords,key).toString(CryptoJS.enc.Utf8);
    if (key != null && pwd == "989398") {
      $('div.entry-content').html(content);
    }
  }, 1000); 
}
