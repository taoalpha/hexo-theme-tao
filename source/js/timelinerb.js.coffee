#
# Timeliner.js
# @version      1.6.1
# @copyright    Tarek Anandan (http:#www.technotarek.com)
# Modified for personal use by zzgary.
#
do($=jQuery)->
  colors = ['orange','green','purple']
  count = 0
  $.timeliner = (options) ->
    if ($.timeliners == null)
      $.timeliners = { options: [] }
      $.timeliners.options.push(options)
    else
      $.timeliners.options = []
      $.timeliners.options.push(options)
    $(document).ready ->
      for i in [0..$.timeliners.options.length]
        startTimeliner($.timeliners.options[i])

  startTimeliner = (options) ->
    settings =
      timelineContainer: options['timelineContainer'] || '#timelineContainer', # value: selector of the main element holding the timeline's content, default to #timelineContainer
      startState: options['startState'] || 'closed', # value: closed | open,
      # default to closed; sets whether the timeline is
      # initially collapsed or fully expanded
      startOpen: options['startOpen'] || [], # value: array of IDs of
      # single timelineEvents, default to empty; sets
      # the minor events that you want to display open
      # by default on page load
      baseSpeed: options['baseSpeed'] || 200, # value: numeric, default to
      # 200; sets the base speed for animation of the
      # event marker
      speed: options['speed'] || 4, # value: numeric, defalut to 4; a
      # multiplier applied to the base speed that sets
      # the speed at which an event's conents are
      # displayed and hidden
      fontOpen: options['fontOpen'] || '1.2em', # value: any valid CSS
      # font-size value, defaults to 1em; sets the font
      # size of an event after it is opened
      fontClosed: options['fontClosed'] || '1em', # value: any valid CSS
      # font-size value, defaults to 1em; sets the font
      # size of an event after it is closed
      expandAllText: options ['expandAllText'] || '+ expand all', # value:
      # string, sets the text of the expandAll selector
      # after the timeline is fully collapsed
      collapseAllText: options['collapseAllText'] || '- collapse all' # # value:
      # string, sets the text of the expandAll selector
      # after the timeline is fully expanded
      #
    openEvent = (eventHeading,eventBody) ->
      color = colors[count % 3]
      # add random color for this item;
      $(eventHeading)
      .removeClass('closed')
      .addClass('open')
      .addClass(color)
      .prev('div.arrow').addClass(color).show().end()
      # .next('div.cross').show()
      .animate({ fontSize: settings.fontOpen}, settings.baseSpeed)
      $(eventBody).slideDown(settings.speed*settings.baseSpeed)
      count = count+1

    closeEvent = (eventHeading,eventBody) ->
      $(eventBody).slideUp(settings.speed*settings.baseSpeed - 100)
      $(eventHeading)
      .animate({ fontSize: settings.fontClosed }, 100)
      .removeClass('open orange green purple')
      .prev('div.arrow').removeClass('orange green purple').hide().end()
      # .next('div.cross').hide()
      .addClass('closed')
    deleteEvent = (eventHeading) ->
      $(eventHeading)
      .closest('dl.timelineMinor').fadeOut(settings.speed*settings.baseSpeed - 100)
      .remove()
      checknullmajor()
    if ($(settings.timelineContainer).data('started'))
      return
      # we already initialized this timelineContainer
    else
      # $(settings.timelineContainer).data('started', true);
      $(settings.timelineContainer+" "+".expandAll").html(settings.expandAllText)
      $(settings.timelineContainer+" "+".collapseAll").html(settings.collapseAllText)
      # If startState option is set to closed, hide all the events; else, show fully expanded upon load
      if(settings.startState=='closed')
        # Close all items
        $(settings.timelineContainer+" "+".timelineEvent").hide()
        # show startOpen events
        $.each $(settings.startOpen), (index, value) ->
          count = count + 1
          openEvent($(value).parent(settings.timelineContainer+" "+".timelineMinor").find("dt a"),$(value))
      else
        # Open all items
        openEvent($(settings.timelineContainer+" "+".timelineMinor dt a"),$(settings.timelineContainer+" "+".timelineEvent"))
      # Minor Event Click
      $(settings.timelineContainer).off("click",".timelineMinor dt").on "click",".timelineMinor dt", ->
        # $("body").on("click",".timelineMinor dt",function(){
        currentId = $(this).attr('id')
        # if the event is currently open
        if($(this).find('a').is('.open'))
          closeEvent($("a",this),$("#"+currentId+"ex"))
        else
          # if the event is currently closed
          openEvent($("a", this),$("#"+currentId+"ex"))
      # Major Marker Click
      $(settings.timelineContainer).off("click",".timelineMajorMarker").on "click",".timelineMajorMarker", ->
        # number of minor events under this major event
        numEvents = $(this).parents(".timelineMajor").find(".timelineMinor").length
        # number of minor events already open
        numOpen = $(this).parents(".timelineMajor").find('.open').length
        if(numEvents > numOpen )
          openEvent($(this).parents(".timelineMajor").find("dt a","dl.timelineMinor"),$(this).parents(".timelineMajor").find(".timelineEvent"))
        else
          closeEvent($(this).parents(".timelineMajor").find("dl.timelineMinor a"),$(this).parents(".timelineMajor").find(".timelineEvent"))
      # delete item
      # $(settings.timelineContainer).on("click","div.cross",function(){
      #         deleteEvent($(this));
      # });
      # All Markers/Events
      $(settings.timelineContainer+" "+".expandAll").click ->
        if($(this).hasClass('expanded'))
          closeEvent($(this).parents(settings.timelineContainer).find("dt a","dl.timelineMinor"),$(this).parents(settings.timelineContainer).find(".timelineEvent"))
          $(this).removeClass('expanded').html(settings.expandAllText)
        else
          openEvent($(this).parents(settings.timelineContainer).find("dt a","dl.timelineMinor"),$(this).parents(settings.timelineContainer).find(".timelineEvent"))
          $(this).addClass('expanded').html(settings.collapseAllText)


$(document).ready ->
  Handlebars.registerHelper 'judgepic',(url,def) ->
    ret = ''
    if(url.match(/youtube.com/g))
      return "youtube"
    else
      return "colmodal"
  $('input').on 'click', ->
    $(this).select()
  $('textarea').focus ->
    $this = $(this)
    $this.select()
    window.setTimeout ->
      $this.select()
    , 1
    # Work around WebKit's little problem
    $this.mouseup ->
    # Prevent further mouseup intervention
      $this.unbind("mouseup")
      return false
  $('body').off('click','div.cross').on 'click','div.cross', ->
    tempc = []
    majorindex = $('body').find('div.timelineMajor').index($(this).closest('div.timelineMajor'))
    minorindex = $(this).closest('div.timelineMajor').find('dl').index($(this).closest('dl'))
    major = Object.keys(context.datas).length - majorindex -1
    minor = Object.keys(context.datas[major].minoritems).length - minorindex -1
    thisminor = context.datas[major].minoritems
    delete thisminor[minor]
    $.each thisminor,(i,val) ->
      tempc.push(val)
    context.datas[major].minoritems = $.extend({}, tempc)
    updateitem(context.datas[major],allids[major])
    $(this)
    .closest('dl.timelineMinor').fadeOut(300)
    .remove()
    checknullmajor()
  $('div#edit_box button').off('click').on 'click', ->
    if($('#edit_box input.mediaurl').val()!="" && !$('#edit_box input.mediaurl').val().match(/^((http|https):\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})/g))
      alert("You need enter a img/video url!")
      return
    context.datas[cmajor].minoritems[cminor].title = $('#edit_box input.newtitle').val()
    context.datas[cmajor].minoritems[cminor].content = $('#edit_box textarea.newcontent').val()
    if($('div#edit_box input.mediaurl').val()!="")
      context.datas[cmajor].minoritems[cminor].media= {}
      context.datas[cmajor].minoritems[cminor].media.url = $('#edit_box input.mediaurl').val()
      context.datas[cmajor].minoritems[cminor].media.title = $('#edit_box input.mediatitle').val()
    #console.log(context.datas[cmajor]);
    updateitem(context.datas[cmajor],allids[cmajor])
    render()
    $('#cboxOverlay').trigger('click')
  $('body').off('click','div.edit').on 'click','div.edit',->
    majorindex = $('body').find('div.timelinemajor').index($(this).closest('div.timelinemajor'))
    minorindex = $(this).closest('div.timelinemajor').find('dl').index($(this).closest('dl'))
    cmajor = Object.keys(context.datas).length - majorindex -1
    cminor = Object.keys(context.datas[cmajor].minoritems).length - minorindex -1
    showeditbox(cmajor,cminor)
    console.log(context.datas[cmajor])
  $('#add_content button').off('click').on 'click', ->
    thedate = new Date()
    newitem = {}
    numberm = Object.keys(context.datas).length-1
    if(thedate.toLocaleDateString()==context.datas[numberm].timeday)
      if(($('#add_content input.mediaurl').val()!="" && $('#add_content input.mediaurl').val()!="Any image or video src.") && !$('#add_content input.mediaurl').val().match(/^((http|https):\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})/g))
        alert("You need enter a img/video url!")
        return
      number = Object.keys(context.datas[numberm].minoritems).length
      context.datas[numberm].minoritems[number] = {}
      context.datas[numberm].minoritems[number].title = $('#add_content input.newtitle').val()
      context.datas[numberm].minoritems[number].content = $('#add_content textarea.newcontent').val()
     context.datas[numberm].minoritems[number].timehour = thedate.toLocaleString().replace(/\s+|\/|:|,/g,'')
     context.datas[numberm].minoritems[number].showtime = thedate.toLocaleString()
     if($('#add_content input.mediaurl').val()!="" && $('#add_content input.mediaurl').val()!="Any image or video src.")
      context.datas[numberm].minoritems[number].media = {}
      context.datas[numberm].minoritems[number].media.url = $('#add_content input.mediaurl').val()
      context.datas[numberm].minoritems[number].media.title = $('#add_content input.mediatitle').val()
      updateitem(context.datas[numberm],allids[numberm])
    else
      if(($('#add_content input.mediaurl').val()!="" && $('#add_content input.mediaurl').val()!="Any image or video src.") && !$('#add_content input.mediaurl').val().match(/^((http|https):\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})/g))
        alert("You need enter a img/video url!")
        return
      number = Object.keys(context.datas).length
      context.datas[number] = {}
      context.datas[number].timeday = thedate.toLocaleDateString()
      context.datas[number].minoritems = {}
      context.datas[number].minoritems[0] = {}
      context.datas[number].minoritems[0].title = $('#add_content input.newtitle').val()
      context.datas[number].minoritems[0].content = $('#add_content textarea.newcontent').val()
      context.datas[number].minoritems[0].timehour = thedate.toLocaleString().replace(/\s+|\/|:|,/g,'')
      context.datas[number].minoritems[0].showtime = thedate.toLocaleString()
      if($('#add_content input.mediaurl').val()!="" && $('#add_content input.mediaurl').val()!="Any image or video src.")
        context.datas[number].minoritems[0].media = {}
        context.datas[number].minoritems[0].media.url = $('#add_content input.mediaurl').val()
        context.datas[number].minoritems[0].media.title = $('#add_content input.mediatitle').val()
      addnewitem(number,thedate)
    render()
    $('#cboxOverlay').trigger('click')
showdatas = (name)->
  context = {}
  usingdata = {}
  tempc=[]
  showid = "0"
  usingdata.username = name
  usingdata.flag = "getdata"
  $.post "http://fun.zzgary.info/allphps/wordsdiary/getdata.php", usingdata, (data)->
    rawdata = JSON.parse(data)
    allids = rawdata.ids
    allcontents = rawdata.contents
    $.each allcontents,(id,val)->
      if(typeof(val)=="string")
        allcontents[id]=JSON.parse(val)
      else if(typeof(val)=="object")
        allcontents[id]=val
      tempc.push(allcontents[id])
    context.datas = JSON.parse(JSON.stringify(tempc))
    showid = allcontents[0]["minoritems"][0].timehour
    render()
render = ->
  tempc = []
  tempmm = []
  showalldatas = JSON.parse(JSON.stringify(context))
  $.each context.datas,(id,val)->
    tempm = []
    temp = context.datas[id]['minoritems']
    tempmm = JSON.parse(JSON.stringify(context.datas[id]))
    if(Object.keys(temp).length>1)
      $.each temp,(id2,val2)->
        tempm.push(temp[id2])
      tempmm.minoritems = JSON.parse(JSON.stringify(tempm.reverse()))
    tempc.push(tempmm)
  showalldatas.datas = JSON.parse(JSON.stringify(tempc.reverse()))
  showid = showalldatas.datas[0]["minoritems"][0].timehour
  $('div.timelineMajor').next('br').remove()
  $('div.timelineMajor').remove()
  source = $("#entry-template").html()
  template = Handlebars.compile(source)
  html = template(showalldatas)
  $('.timelineContainer').append(html)
  $.timeliner({
    startOpen:['#'+showid+'ex']
  })
  $(".colmodal").colorbox({rel:'colmodal',width:"75%", height:"75%"})
  $(".youtube").colorbox({iframe:true,innerWidth:640, innerHeight:390})
  $(".inline").colorbox({inline:true, width:"90%", height:"90%"})
  $(".editthis").colorbox({inline:true, width:"90%", height:"90%"})
  $('div.timelineMajor').last().find('div.edit').remove()

updateitem = (data,majorid)->
  usingdata.flag = "updateitem"
  usingdata.id = majorid
  usingdata.itemc = addslashes(JSON.stringify(data))
  $.post "http://fun.zzgary.info/allphps/wordsdiary/getdata.php", usingdata, (data)->
    console.log(data)

addnewitem = (number,addtime)->
  usingdata.flag = "additem"
  addtime.setHours(addtime.getHours()-addtime.getTimezoneOffset()/60)
  tempdate = addtime.toISOString().replace("T"," ")
  usingdata.addtime = tempdate.substring(0,tempdate.length - 5)
  usingdata.itemc = addslashes(JSON.stringify(context.datas[number]))
  $.post "http://fun.zzgary.info/allphps/wordsdiary/getdata.php", usingdata, (data)->
    console.log(data)
    if(data != "null")
      allids[number] = data

deleteitem = (number)->
  usingdata.flag = "deleteitem"
  usingdata.id = number
  $.post "http://fun.zzgary.info/allphps/wordsdiary/getdata.php", usingdata, (data)->
    console.log(data)

checknullmajor = ->
  $.each $('div.timelineMajor'),(i,val)->
    if($(val).find('dl').length == 0)
      $(val).fadeOut(100)
      deleteitem(allids.reverse()[i])

addslashes = (string) ->
  return string.replace(/\\/g, '\\\\').
  replace(/\u0008/g, '\\b').
  replace(/\t/g, '\\t').
  replace(/\n/g, '\\n').
  replace(/\f/g, '\\f').
  replace(/\r/g, '\\r').
  replace(/'/g, '\\\'').
  replace(/"/g, '\\"');

showeditbox = (major,minor)->
  thisminor = context.datas[major].minoritems[minor]
  $('div#edit_box input.newtitle').val(thisminor.title)
  $('div#edit_box textarea.newcontent').text(thisminor.content)
  if(thisminor.media)
    $('div#edit_box input.mediaurl').val(thisminor.media.url)
    $('div#edit_box input.mediatitle').val(thisminor.media.title)
