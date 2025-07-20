async function getData(time_Frame) {
  
  const response = await fetch("./data.json")
  
  if (!response.ok) {
    throw new Error (`Opps something went wrong! ${response.status}`)
  }
  
  else {
    const data = await response.json()
    populate_DOM(time_Frame,data)
  }
}

function pre_text(time_Frame) {
  
  if (time_Frame === "daily") {
    return "Yesterday -"
  }
  
  else if (time_Frame === "weekly") {
    return "Last Week -"
  }
  
  else {
    return "Last Month -"
  }
}

function check_Hour(number) {
  
  if (number <= 1) {
    return `${number}hr`
  }
  
  else {
    return `${number}hrs`
  }
}

function populate_DOM(time_Frame,data) {
  
  const colors = ["orange","blue","pink","green","purple","yellow"]
  const cards_container = document.getElementById("cards-container")
  
  cards_container.innerHTML = " "
  
  for (let i = 0; i < data.length; i++) {
    
    const title = data[i].title
    const current_Hours = data[i].timeframes[time_Frame].current
    const previous_Hours = data[i].timeframes[time_Frame].previous
    
    let article = document.createElement("article")
    
    article.className = `dashboard-card dashboard-card--${colors[i]}`
    
    article.innerHTML = `
    <header class="dashboard-card_image dashboard-card_image--${title}">
    </header>
    <section class="dashboard-card_section dashboard-card_section--active">
      <header class="dashboard-card_header">
        <h2>${title}</h2>
        <figure class="dashboard-card_icon">
          <svg width="21" height="5" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm8 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm8 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" fill="inherit" fill-rule="evenodd"/></svg>
        </figure>
      </header>
      <footer class="dashboard-card_hour-container">
        <p class="dashboard-card_current-hour">${check_Hour(current_Hours)}</p>
        <p class="dashboard-card_previous-hour">${pre_text(time_Frame)} ${check_Hour(previous_Hours)}</p>
      </footer>
    </section>`
    
    cards_container.insertAdjacentElement('beforeend',article)
  }
}

getData("weekly")

const dashboard_list = document.getElementsByClassName("dashboard_list")
const list_Array = Array.from(dashboard_list)

list_Array.forEach((list) => {
  
  list.addEventListener('click', function(event) {
    
    list_Array.forEach((list) => {
      list.classList.remove("dashboard_list--active")
    })
    
    this.classList.add("dashboard_list--active")
    time_Frame = this.innerHTML.toLowerCase()
    getData(time_Frame)
  })
})

