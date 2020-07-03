class Timeline {
  private data: Array<{
    start_date: string;
    end_date: string;
    items: Array<{
      desc?: string;
      title?: string;
    }>;
    country: string;
  }> = [];
  private api_last_update = new Date();

  constructor() {
    this.getFromAPI();
  }

  render() {
    var renderHTML = ''
    this.data.sort((a, b) => b.start_date.localeCompare(a.start_date));
    this.data.forEach((entry, i) => {
      renderHTML += `
        <div class='timeline-wrapper' id="${i}-">
          <i class='fas fa-check'></i>
          <h2 class='timeline-time date-title'>
            <span>${entry.start_date} - ${entry.end_date} @ ${entry.country}</span>
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

  getFromAPI() {
    // Get the puzzles stored in github as a gist.
    $.ajax({
      url: "https://api.github.com/gists/aa2a829c5a4f77cead7f6310db6809de",
      dataType: "json",
      success: res => {
        var data;
        data = JSON.parse(res.files['timeline.json'].content);
        this.api_last_update = data.last_update;
        this.data = data.entries || [];
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
        this.data = data.entries || [];
        this.render();
      },
      error: () => {
        window.showAlert("fail", "Fail to load the timeline data!", 8000);
      }
    });
  }
}
