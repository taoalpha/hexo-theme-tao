//import "functions.js";
var rotation = 0
var OpenInNewWindow = false
$ => {
  $('.follow').click(function(e) {
    e.preventDefault();
    $(this).animate({
      borderSpacing: -90
    }, {
      step: function(now, fx) {
        $(this).css('-webkit-transform', "rotate(" + now + "deg)");
        $(this).css('-moz-transform', "rotate(" + now + "deg)");
        return $(this).css('transform', "rotate(" + now + "deg)");
      },
      duration: 'fast'
    }, 'linear');
    $(this).toggleClass("active");
    if ($('.home-contact').is(':visible')) {
      $('.home-contact').slideUp(100);
    } else {
      $('.home-contact').slideDown(100);
    }
  });
  
  $('.makecontribution').click(function(e) {
    var contribution;
    e.preventDefault();
    console.log("make contribution");
    contribution = $('#contribution');
    contribution.removeClass('hide');
    $('body').addClass('noscroll');
    return $('#contributionContent').focus();
  });
  
  $('div#contribution span.close').click(function(e) {
    e.stopPropagation();
    $('#contribution').addClass("hide");
    return $('body').removeClass("noscroll");
  });
  
  $('#sendToMe').click(function(e) {
    var msg;
    e.preventDefault();
    msg = {};
    msg.sender_mail = $('input#sender_mail').val();
    msg.sender_name = "User";
    msg.subject = "Hi, Tao!";
    msg.content = $('textarea#contributionContent').val();
    sendMail(msg);
    $('#contribution').addClass("hide");
    return $('body').removeClass("noscroll");
  });
  
  $('#togglemusic').click(function(e) {
    var OpenInNewWindow;
    e.preventDefault();
    console.log("music");
    $(this).find('i').toggleClass("rotate");
    if ($('#musicbar').is(':visible')) {
      $('#musicbar').find('iframe').attr('src', 'http://music.163.com/outchain/player?type=0&id=78822606&auto=0&height=32');
      OpenInNewWindow = false;
      return $('#musicbar').slideUp(300);
    } else {
      $('#musicbar').find('iframe').attr('src', 'http://music.163.com/outchain/player?type=0&id=78822606&auto=1&height=32');
      OpenInNewWindow = true;
      return $('#musicbar').slideDown(300);
    }
  });
  
  $('a').on('click', function(e) {
    var newlink;
    if ($(this).attr('href') && $(this).attr('href').indexOf("javascript") === 0) {
      return;
    }
    if (!OpenInNewWindow) {
      return;
    }
    e.preventDefault();
    newlink = $(this).attr("href");
    if ((newlink != null) && newlink !== "javascript:;") {
      return window.open(newlink, "something");
    }
  });
  
  $('.series h2,.series .expand,.series .collapse').on('click', function(e) {
    e.stopPropagation();
    $('.series ul').slideToggle(300);
    $('.series .expand').toggle();
    return $('.series .collapse').toggle();
  });
  
  $('i.reloadimage').on('click', function() {
    var path_prefix;
    path_prefix = location.pathname.split("/")[2];
    return randomImage(path_prefix);
  });
  
  $(".filter").on("click", function() {
    var $filter, $this;
    $this = $(this);
    if (!$this.hasClass("active")) {
      $(".filter").removeClass("active");
      $this.addClass("active");
      $filter = $this.data("rel");
      if ($filter.toLowerCase() === 'all') {
        return $(".post").not(":visible").fadeIn();
      } else {
        return $(".post").fadeOut(0).filter(function() {
          return $(this).data("filter").split(" ").indexOf($filter) !== -1;
        }).fadeIn(1000);
      }
    }
  });
}(jQuery)
