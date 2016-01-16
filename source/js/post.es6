$( () => {
  (()=>{
    var initHeading = function() {
      var h2, h2index, h3;
      h2 = [];
      h3 = [];
      h2index = 0;
      $.each($('.entry h2, .entry h3'), function(index, item) {
        var h2item, h3item;
        if (item.tagName.toLowerCase() === 'h2') {
          h2item = {};
          h2item.name = $(item).text();
          h2item.id = 'menuIndex' + index;
          h2.push(h2item);
          h2index++;
        } else {
          h3item = {};
          h3item.name = $(item).text();
          h3item.id = 'menuIndex' + index;
          if (!h3[h2index - 1]) {
            h3[h2index - 1] = [];
          }
          h3[h2index - 1].push(h3item);
        }
        return item.id = 'menuIndex' + index;
      });
      return {
        h2: h2,
        h3: h3
      };
    };
    var genTmpl = function() {
      var h1txt, h2, h3, heading,tmpl;
      h1txt = $('h1').text();
      tmpl = "<ul><li class='h1'><a href='#'>" + h1txt + "</a></li>";
      heading = initHeading();
      h2 = heading.h2;
      h3 = heading.h3;
      for (var i = 0;i<h2.length;i++){
        tmpl += "<li><a href='#' data-id=" + h2[i].id + ">" + h2[i].name + "</a></li>";
        if (h3[i] != null) {
          for(var j = 0;j<h3[i].length;j++){
            if (h3[i][j]) {
              tmpl += "<li class='h3'><a href='#' data-id=" + h3[i][j].id + ">" + h3[i][j].name + "</a></li>";
            }
          }
        }
      }
      return tmpl += '</ul>';
    };
    var genIndex = function() {
      var indexCon, tmpl;
      tmpl = genTmpl();
      indexCon = '<div id="menuIndex" class="sidenav"></div>';
      // insert into right after the last aside or the entry if there is no
      var insertInto = $("#content > aside").length==0? $("#content .entry") : $("#content >aside").last()
      $(indexCon).insertAfter(insertInto);
      $('#menuIndex').append($(tmpl)).delegate('a', 'click', function(e) {
        var scrollNum, selector;
        e.preventDefault();
        selector = $(this).attr('data-id') ? "#" + ($(this).attr('data-id')) : 'h1';
        scrollNum = $(selector).offset().top;
        $('body, html').animate({
          scrollTop: scrollNum - 30
        }, 400, 'swing');
      });
    };
    var waitForFinalEvent = (function() {
      var timers;
      timers = {};
      return function(callback, ms, uniqueId) {
        if (!uniqueId) {
          uniqueId = "Don't call this twice without a uniqueId";
        }
        if (timers[uniqueId]) {
          clearTimeout(timers[uniqueId]);
        }
        return timers[uniqueId] = setTimeout(callback, ms);
      };
    })();
    //if ($('.entry h2').length >= 1 && !isMobile.any() && !ie6) {
    if ($('.entry h2').length >= 1) {
      genIndex();
      $(window).load(function() {
        var menuIndexLeft, menuIndexTop, scrollTop;
        scrollTop = [];
        $.each($('#menuIndex li a'), function(index, item) {
          var selector, top;
          selector = $(item).attr('data-id') ? "#" + ($(item).attr('data-id')) : 'h1';
          top = $(selector).offset().top;
          return scrollTop.push(top);
        });
        menuIndexTop = $('#menuIndex').offset().top;
        menuIndexLeft = $('#menuIndex').offset().left;
        $(window).scroll(function() {
          waitForFinalEvent(function() {
            var i, index, k, length, nowTop, ref;
            nowTop = $(window).scrollTop();
            length = scrollTop.length;
            index = 0;
            if (nowTop + 20 > menuIndexTop) {
              $('#menuIndex').css({
                position: 'fixed',
                top: '20px',
                left: menuIndexLeft
              });
            } else {
              $('#menuIndex').css({
                position: 'static',
                top: 0,
                left: 0
              });
            }
            if (nowTop + 60 > scrollTop[length - 1]) {
              index = length;
            } else {
              for(var i = 0;i<length;i++){
                if (nowTop + 60 <= scrollTop[i]) {
                  index = i;
                  break;
                }
              }
            }
            $('#menuIndex li').removeClass('on');
            return $('#menuIndex li').eq(index - 1).addClass('on');
          });
        });
        return $(window).resize(function() {
          $('#menuIndex').css({
            position: 'static',
            top: 0,
            left: 0
          });
          menuIndexTop = $('#menuIndex').offset().top;
          menuIndexLeft = $('#menuIndex').offset().left;
          $(window).trigger('scroll');
          return $('#menuIndex').css('max-height', $(window).height() - 80);
        });
      });
    }
    return $('#menuIndex').css('max-height', $(window).height() - 80);
  })();
  // show the progress for reading
  
  ( () => {
    $(window).scroll( () => {
      if(window.scrollY > 220){
        var percentage = Math.ceil( ( (window.scrollY - 200 + $(window).height()) / $('section.entry').height() )*100 )
        if(percentage<=100){
          $('div#progressbar').fadeIn(300).find('span.text').text(percentage+"% READ")
          $('div#progressbar').fadeIn(300).find('span.bg').css({width:percentage+"%"})
        }
        // hide it when read 100%
        if(percentage >= 100){
          $('div#progressbar').fadeOut(300)
        }
      }else{
        $('div#progressbar').fadeOut(300)
      }
    })
  })()

})
