type TimeFrame = "daily" | "weekly" | "monthly";

class dashboardCard {
    private title: string;
    private color: string;
    private currentHour: number;
    private previousHour: number;
    private timeframe: TimeFrame;

    constructor(title: string, color: string, currentHour: number, previousHour: number, timeframe: TimeFrame) {
        this.title = title;
        this.color = color;
        this.currentHour = currentHour;
        this.previousHour = previousHour;
        this.timeframe = timeframe;
    };

    private cardSvg(): SVGSVGElement {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const pathData = "M2.5 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm8 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm8 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z";
        
        svg.setAttribute("width", "21");
        svg.setAttribute("height", "5");

        path.setAttribute("d", pathData);
        path.setAttribute("fill", "inherit");
        path.setAttribute("fill-rule", "evenodd");

        svg.append(path)

        return svg;
    };

    private pre_text(): string {
        switch(this.timeframe) {
            case 'daily': 
                return "Yesterday -";
            
            case 'weekly':
                return "Last Week -";

            default:
                return "Last Month -";
        };
    };

    private check_Hour(number: number) {
        if (number <= 1) {
            return `${number}hr`
        } else {
            return `${number}hrs`
        };
    };

    private currentText(): string {
        return this.check_Hour(this.currentHour);
    };

    private previousText(): string {
        const prvText = this.check_Hour(this.previousHour);
        return `${this.pre_text()} ${prvText}`;
    };

    private cardSection(): HTMLElement {
        const section = document.createElement("section");
        const section_header = document.createElement("header");
        const h2 = document.createElement("h2");
        const button = document.createElement("button");
        const svg = this.cardSvg();
        const footer = document.createElement("footer")
        const footer_p1 = document.createElement("p");
        const footer_p2 = document.createElement("p");

        section.className = "dashboard-card_section dashboard-card_section--active";
        section.setAttribute("tabindex", "0");
        
        section_header.className = "dashboard-card_header";

        h2.textContent = this.title;

        button.className = "dashboard-card_icon";
        button.append(svg);
        
        section_header.append(h2, button);

        footer.className = "dashboard-card_hour-container";

        footer_p1.className = "dashboard-card_current-hour";
        footer_p1.textContent = this.currentText();

        footer_p2.className = "dashboard-card_previous-hour";
        footer_p2.textContent =  this.previousText();

        footer.append(footer_p1, footer_p2);

        section.append(section_header, footer);

        return section;
    };

    private cardArticle(): HTMLElement {
        const article = document.createElement("article");
        const article_header = document.createElement("header");

        article.className = `dashboard-card dashboard-card--${this.color}`;

        article_header.className = `dashboard-card_image dashboard-card_image--${this.title}`;

        article.append(article_header, this.cardSection());

        return article;
    };

    public card(): DocumentFragment {
        const fragment = new DocumentFragment();
        fragment.append(this.cardArticle());

        return fragment;
    };
};

type Title = "Work" | "Play" | "Study" | "Exercise" | "Social" | "Self Care";

type Hour = {
  current: number;
  previous: number;
};

type RecievedData = {
  title: Title;
  timeframes: {
    daily: Hour;
    weekly: Hour;
    monthly: Hour;
  }
};

function isTitle(title: string): title is Title {
  const validTitles = [ "Work" , "Play" , "Study" , "Exercise" , "Social" , "Self Care" ];

  if(validTitles.includes(title)) {
    return true;
  } 
  return false;
};

function isHour(data: unknown): data is Hour {
  if(typeof data === "object" && data != null) {
    if("current" in data && typeof data.current === "number" &&
      "previous" in data && typeof data.previous === "number"
    ) {
      return true;
    }
  }
  return false;
}

function isData(data: unknown): data is RecievedData {
  if(typeof data === "object" && data != null) {
    const obj = data as Record<string, unknown>;

    if(obj.title && typeof obj.title === "string" && isTitle(obj.title) &&
      typeof obj.timeframes === "object" && obj.timeframes != null) {
      const tFrame = obj.timeframes as Record<string, unknown>;

      if(isHour(tFrame.daily) && isHour(tFrame.weekly) && isHour(tFrame.monthly)) {
        return true;
      };
    };
  };

  return false;
};

function isVerfiedData(data: unknown): data is RecievedData[] {
  return Array.isArray(data) && data.every(isData);
};

async function getData(): Promise<RecievedData[]> {
  try {
    const response = await fetch("./data.json");

    if(!response.ok) throw new Error("`Opps something went wrong! ${response.status}`");

    const data: unknown = await response.json();

    if (isVerfiedData(data)) {
      return data;
    } else {
      throw new Error("Recieved Data is Invalid");
    };
  } catch(error) {
    console.error(error);
    throw error;
  };
};

async function displayCards(path: HTMLDivElement, time: TimeFrame): Promise<void> {
  try {
    const receivedData: RecievedData[] = await getData();
    const colors = ["orange","blue","pink","green","purple","yellow"];

    path.textContent = "";
    
    const cardList = new DocumentFragment;

    for(let [i, data] of Object.entries(receivedData)) {
      const index = Number(i);
      const title = data.title;
      const color = colors[index] != undefined ? colors[index] : "";
      const currentHour = data.timeframes[time].current;
      const previousHour = data.timeframes[time].previous;

      const createCard = new dashboardCard(title, color, currentHour, previousHour, time);
      const newCard = createCard.card();

      cardList.append(newCard);
    }

    path.append(cardList);
  } catch(error) {
    console.error(error);
  };
};

const cards_container = document.getElementById("cards-container") as HTMLDivElement;

((): void => {
  displayCards(cards_container, "weekly");
})();


const dashboard_btns = document.getElementsByClassName("dashboard_list");
const btn_Array = Array.from(dashboard_btns) as HTMLButtonElement[];

function isTimeFrame(time: string): time is TimeFrame {
  const timeFrames = ["daily", "weekly", "monthly"];
  if(timeFrames.includes(time)) {
    return true;
  }
  return false;
};

btn_Array.forEach((sub_list) => {
  
  sub_list.addEventListener('click', function(): void {
    
    btn_Array.forEach((list) => {
      list.classList.remove("dashboard_list--active");
    });
    this.classList.add("dashboard_list--active");
    
    const timeValue = this.value;
    const time_Frame: TimeFrame = isTimeFrame(timeValue) ? timeValue : 'daily'; 

    displayCards(cards_container, time_Frame);
  });
});

