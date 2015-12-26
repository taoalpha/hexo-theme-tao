class Puzzles{
  constructor(flag){
    // compatibility for localStorage, will show error meesage for creating if false
    this.compatibility = this.compatibility_check()
    // puzzles from gist, will save to localStorage in order to reduce the requests
    this.apidata = {}
    // url of gist which i save all puzzles into
    this.gisturl = ''
    // all datas we have including the apidata we got from last update and data changed by users.
    this.localdata = {}
    // the time of last update, will save into localStorage
    this.api_last_update = new Date()
    // statistics about the puzzles
    this.statistic = {}

    // initilize
    if(flag == "all"){
      this.getFromlocalStorage()
      this.getFromAPI()
    }
  }
  compatibility_check(){
    // Check the compatibility of browser!
    try{
      return 'localStorage' in window && window['localStorage'] != null
    }catch (error){
      return false
    }
  }

  notif(msg){
    _alert(msg)
  }

  merge(){
    // Merge two data set into one, if there is an update on apidata, otherwise we use the localdata only
    if (typeof this.apidata !== "object" || typeof this.localdata !== "object") {
      return "Not a validate Object";
    }
    // Based on localdata and updatit if api changed.
    if (!localStorage.getItem("local_last_update") || (Date.parse(localStorage.getItem("local_last_update")) > Date.parse(this.api_last_update))) {
      for (var i in this.apidata) {
        if (this.localdata.hasOwnProperty(i)) {
          for (var j in this.apidata[i]) {
            if (!this.localdata[i].hasOwnProperty(j)) {
              this.localdata[i][j] = this.api[i][j];
            }
          }
        } else {
          this.localdata[i] = this.apidata[i];
        }
      }
      localStorage.setItem("local_last_update", new Date());
      this.saveLocaldata();
    }
    this.statistical();
  }

  statistical(){

    // Statistical things about the puzzles
    this.statistic['number_of_blocks'] = Object.keys(this.localdata).length
    this.statistic['number_of_puzzles'] = 0
    this.statistic['number_of_check_puzzles'] = 0
    this.statistic['number_of_ongoing_puzzles'] = 0
    this.statistic['distribution'] = {}
    var renderHTML = ''
    for (var i in this.localdata){
      if(!this.statistic['distribution'][i]){
        this.statistic['distribution'][i] = {}
        this.statistic['distribution'][i].ongoing = 0
        this.statistic['distribution'][i].check = 0
      }
      var dateStringL = new Date(i+" 00:00:00").toString().split(" ")
      renderHTML += `<div class='timeline-wrapper' id='${i.replace(/-/g,'')}' data-date='${i}'><h2 class='timeline-time date-title'><span class='puzzles-title'>${dateStringL.slice(0,2).join(",")} ${dateStringL.slice(2,4).join(",")}</span><span class='count'>${Object.keys(this.localdata[i]).length} puzzles</span></h2>`
      for (var j in this.localdata[i]){
        this.statistic['number_of_puzzles'] += 1
        if(this.localdata[i][j].status == 'check'){
          this.statistic['number_of_check_puzzles'] += 1
          this.statistic['distribution'][i].check += 1
        }
        if(this.localdata[i][j].status == 'ongoing'){
          this.statistic['number_of_ongoing_puzzles'] += 1
          this.statistic['distribution'][i].ongoing += 1
        }
        var answer = this.localdata[i][j].answer
        if(!this.localdata[i][j].answer){
          answer = "Type here to write your answers. If the answer is too long, please use a link."
        }
        renderHTML += `<dl class='timeline-series ${this.localdata[i][j].status}' data-time='${j}'><dt id=${i.replace(/-|:/g,'')}${j.replace(/-|:/g,'')} class='timeline-event'><a class='closed puzzle_title'>${this.localdata[i][j].title}</a><span><i class='fa fa-check fa-2x'></i></span></dt><dd class='timeline-event-content puzzle_detail' id='${i.replace(/-|:/g,'')}${j.replace(/-|:/g,'')}EX'><p class='puzzle-desc'>${this.localdata[i][j].desc}</p><p contentEditable='true' class='editanswer' placeholder='Type here to write your answers. If the answer is too long, please use a link.'>${answer}</p></dd></dl>`
      }
      renderHTML += "</div><br class='clear'>"
    }
    this.renderPuzzles(renderHTML)
  }

  sort(){
    return
  }

  getFromAPI(){
    // Get the puzzles stored in github as a gist.
    var _this = this
    $.ajax({
      url: "https://api.github.com/gists/a0f243d7b54e77bca43d",
      dataTyle: "jsonp",
      success: function(res) {
        var data;
        data = JSON.parse(res.files['puzzles.json'].content);
        _this.api_last_update = data.lastupdate;
        _this.apidata = data.puzzles;
        _this.merge();
      }
    })
  }
  getFromlocalStorage(){

    //Get all puzzles stored in the browser.

    if(!this.compatibility){
      this.notif("Sorry, your browser doesn't support localStorage which we use to save datas locally ! Please update or change a new browser! ")
      // this.localdata = {}
      return
    }
    if (localStorage["local_puzzles"] != null) {
      this.localdata = JSON.parse(localStorage["local_puzzles"]);
    }
  }

  createPuzzle(puzzle){

    //Create a new puzzle and save it into localStorage

    if(!this.compatibility){
      this.notif("Sorry, your browser doesn't support localStorage which we use to save datas locally ! Please update or change a new browser! ")
      return
    }
    var date = new Date()
    var date_title = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
    var time_title = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    // save into localdata
    this.localdata[date_title] = this.localdata[date_title] || {}
    this.localdata[date_title][time_title] = puzzle
    this.saveLocaldata()
    this.renderSinglePuzzle(date_title,this.localdata[date_title])
  }

  saveLocaldata(){

    // Save localdata into localStorage
    localStorage.setItem("local_puzzles",JSON.stringify(this.localdata))
    // set the flag to record last update time
    localStorage.setItem("local_last_update",new Date())
  }

  pushToGist(){
    // Push all puzzles to Gist and create an anonymous gist.
    // Save the final link into this.gisturl
    var date = new Date()
    var date_title = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
    var time_title = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    var postdata = {
      "description": 'a gist created for recording all puzzles from TaoAlpha blog',
      'public': true,
      'files': {
        'puzzles.json': {
          'content': `{'lastupdate':'${date_title} ${time_title}','puzzles':${JSON.stringify(this.localdata)}}`
        }
      }
    }
    _this = this
    $.ajax({
      url: "https://api.github.com/gists",
      type: "POST",
      data: JSON.stringify(postdata),
      dataType: "json",
      success: function(res) {
        return _this.gisturl = res.html_url;
      }
    });
  }
  savePuzzleAnswer(date_title,time_title,answer){

    // Save the answer into localdata

    this.localdata[date_title][time_title].answer = answer
    this.saveLocaldata()
  }

  updatePuzzleStatus(date_title,time_title,status){

    // Update the status of puzzle into alladata

    this.localdata[date_title][time_title].status = status
    if(status == "check"){
      this.statistic['distribution'][date_title].check += 1
      this.statistic['distribution'][date_title].ongoing -= 1
    }else{
      this.statistic['distribution'][date_title].check -= 1
      this.statistic['distribution'][date_title].ongoing += 1
    }
    this.updateStatus()
    this.saveLocaldata()
  }

  renderSinglePuzzle(date_title,puzzle){

    // Render single puzzle into the page.

    renderHTML = `<dl class='timeline-series ${puzzle.status}' data-time='${time_title}'><dt id=${date_title.replace(/-|:/g,'')}${time_title.replace(/-|:/g,'')} class='timeline-event'><a class='closed puzzle_title'></a><span><i class='fa fa-check fa-2x'></i></span></dt><dd class='timeline-event-content puzzle_detail' id='${date_title.replace(/-|:/g,'')}${time_title.replace(/-|:/g,'')}EX'><p class='puzzle-desc'>${puzzle.description}</p><p contentEditable='true' class='editanswer' placeholder='Type here to write your answers. If the answer is too long, please use a link.'>Type here to write your answers. If the answer is too long, please use a link.</p></dd></dl>`
    $('#'+date_title).append(renderHTML)
  }

  renderPuzzles(renderHTML){

    // Render all puzzles into the page

    $('#timeline').empty().append(renderHTML)
    this.updateStatus()
  }

  updateStatus(){

    // Update the statistic data on page, eg: number of check puzzles, number of ongoing puzzles and whether a puzzle-block is check or ongoing
    var distribution = this.statistic['distribution']
    $('div.namespace').find('span.check i').text(this.statistic['number_of_check_puzzles']).end().find('span.ongoing i').text(this.statistic['number_of_ongoing_puzzles'])
    for (var i in distribution){
      if(distribution[i].check > 0 && distribution[i].ongoing == 0){
        $('#'+i.replace(/-|:/g,'')).addClass("check")
      }else{
        $('#'+i.replace(/-|:/g,'')).addClass("ongoing")
      }
    }
  }
}
