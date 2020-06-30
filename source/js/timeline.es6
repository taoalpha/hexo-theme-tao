class Timeline {
  constructor(){
    // puzzles from gist, will save to localStorage in order to reduce the requests
    this.apidata = {}
    // url of gist which i save all puzzles into
    this.gisturl = ''
    // the time of last update, will save into localStorage
    this.api_last_update = new Date()

    this.getFromAPI()
  }

  render(){
    var renderHTML = ''
    this.apidata.sort((a, b) => b.start_date - a.start_date);
    this.apidata.forEach((entry, i) => {
      renderHTML += `
        <div class='timeline-wrapper' id="${i}-">
          <h2 class='timeline-time date-title'>
            <span>${entry.start_date} - ${entry.end_date}</span>
            <span class='count'>${(entry.items || []).length} items</span>
          </h2>
      `;

      const key = `${entry.start_date.replace(".", "-")}-${entry.end_date.replace(".", "-")}`;

      (entry.items || []).forEach((item, j) => {
        renderHTML += `
          <dl class='timeline-series'>
            <dt class='timeline-event ${!item.desc && "no-desc"}' id="${i}-${j}-${key}">
              <a class='closed timeline-item-title'>${item.title}</a>
            </dt>
            ${
              item.desc ? `
              <dd class='timeline-event-content' id='${i}-${j}-${key}EX'>
                <p class='timeline-item-desc'>${item.desc}</p>
              </dd>` : ""
            }
          </dl>`
      });
      renderHTML += "</div><br class='clear'>";
    });
    $('#timeline').empty().append(renderHTML);
  }

  getFromAPI(){
    // Get the puzzles stored in github as a gist.
    $.ajax({
      url: "https://api.github.com/gists/aa2a829c5a4f77cead7f6310db6809de",
      dataType: "json",
      success: res => {
        var data;
        data = JSON.parse(res.files['timeline.json'].content);
        this.api_last_update = data.last_update;
        this.apidata = data.entries || [];
        this.render();
      },
      error: () => {
        // fallback to load from local
        return this.getFromLocal();
      }
    });
  }

  getFromLocal() {
    // Get the puzzles stored in github as a gist.
    $.ajax({
      url: "/blog/api/timeline.json",
      dataType: "json",
      success: data => {
        this.api_last_update = data.last_update;
        this.apidata = data.entries || [];
        this.render();
      },
      error: () => {
        showAlert("fail", "Fail to load the timeline data!", 8000);
      }
    });
  }
}
