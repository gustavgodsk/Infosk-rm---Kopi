let roots = window.roots;
let currentRoot = null;
let data;

document.addEventListener("DOMContentLoaded", () => {
    init();
});

function init() {
    const container = document.querySelector(".menu-button-container");
    const goBackBtn = document.querySelector("#go-back-button");
    goBackBtn.style.display = "none";
    // Generate root level buttons
    roots.forEach((root, index) => {
        const button = document.createElement("div");
        button.classList.add("menu-button");
        button.style.backgroundColor = root.primaryColor;
        const text = document.createElement("p");
        text.textContent = root.rootName;
        const arrow = document.createElement("div");
        arrow.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25"><path style="fill:none; stroke:white; stroke-width:1" d="m17.5 5.999-.707.707 5.293 5.293H1v1h21.086l-5.294 5.295.707.707L24 12.499l-6.5-6.5z" data-name="Right"/></svg>';
        button.addEventListener("click", () => {
            showAreaMenu(root, index);
        });
        button.appendChild(text);
        button.appendChild(arrow);
        container.appendChild(button);
    });
}

function showAreaMenu(root, rootIndex) {
    currentRoot = root;
    const container = document.querySelector(".menu-button-container");
    const menu = document.querySelector(".menu");
    const goBackBtn = document.querySelector("#go-back-button");
    const titleText = document.querySelector(".title-circle");
    
    // Clear existing buttons
    removeChildren(container);
    
    // Show back button - explicitly set to "block"
    goBackBtn.style.display = "block";
    
    // Update title and background
    setTimeout(() => {
        titleText.innerHTML = `
        <h2 class="menu2-title-h2">Se udviklingen af</h2>
        <h1><span class="menu2-title">${root.rootName}</span></h1>
        `;
    }, 100);
    menu.style.backgroundImage = `url("billeder/${root.rootName}/${root.backgroundImage}")`;
    
    // Animate transition
    menu.style.transform = "scale(0)";
    setTimeout(() => {
        // Generate area buttons
        root.areas.forEach((area, areaIndex) => {
            const button = document.createElement("div");
            button.classList.add("menu-button");
            button.style.backgroundColor = root.primaryColor;
            const text = document.createElement("p");
            text.textContent = area.areaName;
            const arrow = document.createElement("div");
            arrow.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25"><path style="fill:none; stroke:white; stroke-width:1" d="m17.5 5.999-.707.707 5.293 5.293H1v1h21.086l-5.294 5.295.707.707L24 12.499l-6.5-6.5z" data-name="Right"/></svg>';
            button.addEventListener("click", () => {
                setup(area, areaIndex);
            });
            button.appendChild(text);
            button.appendChild(arrow);
            container.appendChild(button);
        });
        menu.style.transform = "scale(1)";
    }, 300);
}

function goBack() {
    const menu = document.querySelector(".menu");
    const main = document.querySelector("#main");
    const goBackBtn = document.querySelector("#go-back-button");
    const titleText = document.querySelector(".title-circle");
    
    if (main.style.transform === "scale(1)") {
        // Going back from main view to area menu
        resetMainView();
        showAreaMenu(currentRoot);
    } else {
        // Going back from area menu to root menu
        goBackBtn.style.display = "none";
        menu.style.transform = "scale(0)";
        
        // Reset title and background
        setTimeout(() => {
            titleText.innerHTML = `
                <h1>Bliv klogere på</h1>
            <h1><span>udviklingen</span></h1>
            <h1>af Aarhus</h1>
            `;
            menu.style.backgroundImage = 'url("lib/static/aarhusoe-skyline.jpg")';
        }, 100);
        
        setTimeout(() => {
            const container = document.querySelector(".menu-button-container");
            removeChildren(container);
            init();
            menu.style.transform = "scale(1)";
        }, 300);
    }
}

function resetMainView() {
    const oversigtskort = document.querySelector("#oversigtskort");
    oversigtskort.src = "";
    
    document.querySelector(".oversigtskort-container")
        .querySelectorAll(".oversigtskort-knap")
        .forEach(element => element.remove());
    
    const main = document.querySelector("#main");
    main.style.transform = "scale(0)";
    
    const venstre = document.querySelector(".venstre");
    const højre = document.querySelector(".højre");
    removeChildren(venstre);
    removeChildren(højre);
}

//setup funktionen åbner en bestemt side
function setup(area, index){
    data = area;
    let oversigtskort = document.querySelector("#oversigtskort");
    oversigtskort.src = "billeder/" + currentRoot.rootName + "/" + data.areaName + "/" + data.oversigtskort;

    const menu = document.querySelector(".menu");
    menu.style.transform = "scale(0)";

    const main = document.querySelector("#main");
    main.style.transform = "scale(1)";
    const venstre = document.querySelector(".venstre")
    const højre = document.querySelector(".højre")
    const antalElementer = data.elementer.length;

    // If 5 or fewer elements, put them all on the left side
    if (antalElementer <= 5) {
        data.elementer.forEach((element, index) => {
            const sideElement = lavSideElement(data, element, index);
            venstre.appendChild(sideElement);
            const oversigtskortKnap = lavOversigtskortKnap(data, element, index);
        });
    } 
    // If between 6 and 10 elements, fill left side first then right
    else if (antalElementer <= 10) {
        data.elementer.forEach((element, index) => {
            const sideElement = lavSideElement(data, element, index);
            if (index < 5) {
                venstre.appendChild(sideElement);
            } else {
                højre.appendChild(sideElement);
            }
            const oversigtskortKnap = lavOversigtskortKnap(data, element, index);
        });
    }
    // If more than 10 elements, divide evenly
    else {
        data.elementer.forEach((element, index) => {
            const sideElement = lavSideElement(data, element, index);
            if (index < Math.floor(antalElementer/2)) {
                venstre.appendChild(sideElement);
            } else {
                højre.appendChild(sideElement);
            }
            const oversigtskortKnap = lavOversigtskortKnap(data, element, index);
        });
    }



    // Event listener for at lukke modal
    document.addEventListener('click', function(event) {
        const overlay = document.getElementById('overlay');
        
        if ((event.target === overlay || event.target.classList.contains('luk-modal-knap')) && !window.isCarouselDragging) {
            lukModal();
        }
    });
}

//lav side element funktion. Køres 20 gange i setup-funktionen
function lavSideElement(data, element, index){
    const sideContainer = document.createElement('div');
    sideContainer.className = 'side-container';
    sideContainer.addEventListener("click", () => {åbnModal(data, element, index)})

    const tekstContainer = document.createElement('div');
    tekstContainer.className = 'tekst-container';

    const navn = document.createElement('h2');
    navn.innerHTML = element.navn.replace("(split)", "&shy;");

    const beskrivelse = document.createElement('p');
    beskrivelse.textContent = element.beskrivelse;

    const billedeContainer = document.createElement('div');
    billedeContainer.className = 'billede-container';

    const billede = document.createElement('img');
    billede.src = "billeder/" + currentRoot.rootName + "/" + data.areaName + "/" + element.billeder.primary;

    const billedeId = document.createElement('div');
    billedeId.textContent = data.showBuildingNumbers !== false ? index+1 : '';
    billedeId.style.backgroundColor = currentRoot.primaryColor

    
    tekstContainer.appendChild(navn);
    tekstContainer.appendChild(beskrivelse);
    billedeContainer.appendChild(billede);
    billedeContainer.appendChild(billedeId);
    sideContainer.appendChild(tekstContainer);
    sideContainer.appendChild(billedeContainer);

    return sideContainer;
}

function lavOversigtskortKnap(data, element, index){
    const knap = document.createElement("button");
    knap.className = "oversigtskort-knap";
    knap.style.top = element.y;
    knap.style.left = element.x;
    knap.textContent = data.showBuildingNumbers !== false ? index+1 : '';
    if (data.showBuildingNumbers !== false) {
        knap.style.backgroundColor = data.primaryColor
    } else {
        knap.style.backgroundColor = 'transparent';
        knap.style.border = '3px solid ' + data.primaryColor;
        knap.style.height = '30px';
    }
    knap.onclick = () => {
        åbnModal(data, element, index)
    }

    const oversigtskortContainer = document.querySelector(".oversigtskort-container");
    oversigtskortContainer.appendChild(knap)
}

function modalCarousel(data, element, index) {
    const images = element.billeder.all.map((e, i) => {
        return "billeder/" + currentRoot.rootName + "/" + data.areaName + "/" + e;
    });

    const container = document.querySelector(".carousel-container");
    const primary = element.billeder.all.indexOf(element.billeder.primary);
    
    // Initialize metadata with default empty values if not present
    const metadata = {};
    element.billeder.all.forEach(filename => {
        metadata[filename] = element.billeder.metadata?.[filename] || {
            description: '',
            author: '',
            year: ''
        };
    });

    const carousel = new ImageCarousel(container, images, primary, metadata);
    container.__carouselInstance = carousel;
}

class ImageCarousel {
    constructor(container, imageSources, primary = 0, metadata) {
      this.container = container;
      this.images = imageSources;
      this.isTransitioning = false;
      this.isInitialized = false;
    //   this.currentIndex = 1;
    //   this.currentIndex = element.billeder.all.indexOf(element.billeder.primary);
    this.currentIndex = primary+1;
    this.metadata = metadata;
        this.wasDragging = false; // Add this flag to track if we were dragging
        this.container.__carouselInstance = this; // Store the instance on the container
      
      this.setup();
      this.bindEvents();
      
      requestAnimationFrame(() => {
        this.updateSlidePosition(false);
        this.isInitialized = true;
      });
    }
  
    setup() {
      this.innerContainer = document.createElement('div');
      this.innerContainer.style.position = 'relative';
      this.innerContainer.style.width = '100%';
      this.innerContainer.style.height = '100%';
      this.innerContainer.style.overflow = 'hidden';
      this.innerContainer.style.userSelect = 'none';
      this.innerContainer.style.webkitUserSelect = 'none';
      this.innerContainer.style.mozUserSelect = 'none';
      this.innerContainer.style.msUserSelect = 'none';
      this.innerContainer.style.touchAction = 'pan-y pinch-zoom';
      
      this.track = document.createElement('div');
      this.track.style.display = 'flex';
      this.track.style.height = '100%';
      this.track.style.transition = 'transform 0.3s ease-out';
      this.track.style.width = '100%';
      this.track.style.pointerEvents = 'none';
      this.track.style.userSelect = 'none';
      this.track.style.webkitUserSelect = 'none';
      this.track.style.mozUserSelect = 'none';
      this.track.style.msUserSelect = 'none';
  
      // Create slides including clones

      this.createSlide(this.images[this.images.length - 1],  Object.values(this.metadata)[this.images.length - 1]);
      this.images.forEach((src,i) => this.createSlide(src,  Object.values(this.metadata)[i]));
      this.createSlide(this.images[0], Object.values(this.metadata)[0]);
  
      const createButton = (direction) => {
        const button = document.createElement('button');
        button.style.position = 'absolute';
        button.style.top = '50%';
        button.style.transform = 'translateY(-50%)';
        button.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        button.style.border = 'none';
        button.style.width = '40px';
        button.style.height = '40px';
        button.style.borderRadius = '50%';
        button.style.cursor = 'pointer';
        button.style.fontSize = '20px';
        button.style.zIndex = '10';
        button.style[direction] = '10px';
        button.innerHTML = direction === 'left' ? '←' : '→';
        button.style.userSelect = 'none';
        return button;
      };
  
      if (this.images.length > 1){
        this.prevButton = createButton('left');
        this.nextButton = createButton('right');
        this.innerContainer.appendChild(this.prevButton);
        this.innerContainer.appendChild(this.nextButton);
        }
  
      this.innerContainer.appendChild(this.track);

      this.container.appendChild(this.innerContainer);
  
      this.isDragging = false;
      this.startPosition = 1;
      this.currentTranslate = 0;
      this.previousTranslate = 0;
    }
  
    createSlide(src, metadata = {}) {
        const slide = document.createElement('div');
        slide.style.flexShrink = '0';
        slide.style.width = '100%';
        slide.style.height = '100%';
        slide.style.pointerEvents = 'none';
        slide.style.userSelect = 'none';
        slide.style.webkitUserSelect = 'none';
        slide.style.mozUserSelect = 'none';
        slide.style.msUserSelect = 'none';
        slide.style.position = 'relative';

        const img = document.createElement('img');
        img.src = src;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.draggable = false;
        img.style.pointerEvents = 'none';
        img.style.userSelect = 'none';
        img.style.webkitUserSelect = 'none';
        img.style.mozUserSelect = 'none';
        img.style.msUserSelect = 'none';

        // Get the filename from the src path
        const filename = src.split('/').pop();
        const imageMetadata = this.metadata[filename] || { description: '', author: '', year: '' };

        // Only create metadata div if there's actual content
        if (imageMetadata.description || imageMetadata.author || imageMetadata.year) {
            const div = document.createElement("div");
            div.classList.add("metadata");
            
            if (imageMetadata.description) {
                const descText = document.createElement('p');
                descText.textContent = imageMetadata.description;
                div.appendChild(descText);
            }

            if (imageMetadata.author || imageMetadata.year) {
                const creditText = document.createElement('p');
                let content = [];
                if (imageMetadata.author) content.push(`Foto: ${imageMetadata.author}`);
                if (imageMetadata.year) content.push(imageMetadata.year);
                creditText.textContent = content.join(', ');
                div.appendChild(creditText);
            }

            slide.appendChild(div);
        }

        slide.appendChild(img);
        this.track.appendChild(slide);
    }
  
    getSlideWidth() {
      return this.innerContainer.clientWidth;
    }
  
    bindEvents() {
        if (this.prevButton){
            this.prevButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!this.isTransitioning && this.isInitialized) {
                  this.navigate('prev');
                }
              });
              
        }
        if (this.nextButton){
            this.nextButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!this.isTransitioning && this.isInitialized) {
                  this.navigate('next');
                }
              });
        }


      let startX;
    
        this.innerContainer.addEventListener('mousedown', (e) => {
            startX = e.clientX;
        });
  
      this.innerContainer.addEventListener('mousedown', this.startDragging.bind(this));
      this.innerContainer.addEventListener('touchstart', this.startDragging.bind(this));
      this.innerContainer.addEventListener('click', (e) => {
        const moveDistance = Math.abs(e.clientX - startX);
        if (moveDistance < 5) {  // If moved less than 5px, consider it a click
            toggleModalCircle();
        } 
      })
      window.addEventListener('mousemove', this.drag.bind(this));
      window.addEventListener('touchmove', this.drag.bind(this));
  
      window.addEventListener('mouseup', this.endDragging.bind(this));
      window.addEventListener('touchend', this.endDragging.bind(this));
      
      this.track.addEventListener('transitionend', () => {
        this.isTransitioning = false;
        
        if (this.currentIndex === 0) {
          this.currentIndex = this.images.length;
          this.updateSlidePosition(false);
        } else if (this.currentIndex === this.images.length + 1) {
          this.currentIndex = 1;
          this.updateSlidePosition(false);
        }
      });
  
      window.addEventListener('resize', () => {
        this.updateSlidePosition(false);
      });
    }
  
    getPositionX(event) {
      return event.type.includes('mouse') ? event.pageX : event.touches[0].pageX;
    }
  
    startDragging(event) {
        if (this.isTransitioning || !this.isInitialized) return;
        
        if (event.target === this.prevButton || event.target === this.nextButton) {
            return;
        }
        this.wasDragging = false;  // Reset at start of drag

        window.isCarouselDragging = true; // Add this line
        this.isDragging = true;
        this.startPosition = this.getPositionX(event);
        this.track.style.transition = 'none';
    }
  
    drag(event) {
      if (!this.isDragging) return;
      this.wasDragging = true;  // Set as soon as we start moving

      event.preventDefault();
      const currentPosition = this.getPositionX(event);
      const diff = currentPosition - this.startPosition;
      this.currentTranslate = this.previousTranslate + diff;
      this.track.style.transform = `translateX(${this.currentTranslate}px)`;
    }
  
    endDragging() {
        if (!this.isDragging) return;

        this.wasDragging = true; // Set when drag ends
        this.isDragging = false;
        const movedBy = this.currentTranslate - this.previousTranslate;
        
        if (Math.abs(movedBy) > this.getSlideWidth() / 8) {
            if (movedBy < 0) {
                this.navigate('next');
            } else {
                this.navigate('prev');
            }
        } else {
            this.updateSlidePosition(true);
        }
    
        // Reset the flag after a small delay
        setTimeout(() => {
             this.wasDragging = false
            window.isCarouselDragging = false;
        }, 50);
    }
    navigate(direction) {
      if (this.isTransitioning || !this.isInitialized) return;
      this.isTransitioning = true;
  
      if (direction === 'next') {
        this.currentIndex++;
      } else {
        this.currentIndex--;
      }
      this.updateSlidePosition(true);
    }
  
    updateSlidePosition(useTransition = true) {
      if (useTransition) {
        this.track.style.transition = 'transform 0.3s ease-out';
      } else {
        this.track.style.transition = 'none';
      }
      
      const slideWidth = this.getSlideWidth();
      this.currentTranslate = -this.currentIndex * slideWidth;
      this.previousTranslate = this.currentTranslate;
      this.track.style.transform = `translateX(${this.currentTranslate}px)`;
    }
  }
// åbn modal function
function åbnModal(data, element, index) {
    
    modalCarousel(data,element,index);

    const titel = document.querySelector(".modal-titel");
    titel.innerHTML = element.navn.replace("(split)", "&shy;");

    const modalCircle = document.querySelector(".modal-circle");
    modalCircle.classList.add(element.infoCirkelPlacering)
    modalCircle.style.transform = "scale(1)";

    const faktaboks = document.querySelector(".modal-faktaboks");
    faktaboks.style.transform = "scale(1)";

    const modalID = document.querySelector(".modal-id");
    modalID.textContent = data.showBuildingNumbers !== false ? index+1 : '';
    modalID.style.backgroundColor = data.primaryColor

    const modal = document.querySelector(".modal")
    const facts = Object.entries(element.faktaboks).filter((e) => {
        return e[1] !== "";
    })
    if (facts.length > 0){
        const faktaboks = document.querySelector(".modal-faktaboks");
        faktaboks.classList.add(element.faktaboksPlacering)
    
        const faktaboksListe = document.querySelector(".faktaboks-liste");
    
        for (let [key, value] of Object.entries(element.faktaboks)) {
            if (value == "" || value.length == 0) {
                
            } else {
                const punkt = document.createElement("li");
                punkt.textContent = `${key}: ${value}`;
                faktaboksListe.appendChild(punkt);
            }
    
          }
    
        faktaboks.style.display = "block";
    }
    
    
    const infoListe = document.querySelector(".info-liste")
    element.ekstraInfo.forEach(element => {
        const punkt = document.createElement("li");
        punkt.textContent = element;
        infoListe.appendChild(punkt);
    });

    const overlay = document.getElementById('overlay');
    overlay.style.display = "flex"

    setTimeout(() => {
    modal.style.transform = "scale(1)";
        
    }, 1);
}

// luk modal function
function lukModal() {
    
    const container = document.querySelector(".carousel-container")
    removeChildren(container)

    const overlay = document.getElementById('overlay');
    overlay.style.display = "none";

    const modalCircle = document.querySelector(".modal-circle");
    modalCircle.className = "modal-circle"
    const faktaboks = document.querySelector(".modal-faktaboks");
    faktaboks.className = "modal-faktaboks"
    faktaboks.style.display = "none";

    //nulstil titel
    const titel = document.querySelector(".modal-titel");
    titel.textContent = "";

    //nulstil beskrivelse
    // const beskrivelse = document.querySelector(".modal-beskrivelse");
    // beskrivelse.textContent = "";

    //slet alle punkter i faktaboks
    const faktaboksListe = document.querySelector(".faktaboks-liste");
    removeChildren(faktaboksListe);

    //slet alle punkter i ekstra info
    const infoListe = document.querySelector(".info-liste")
    removeChildren(infoListe);


    const modal = document.querySelector('.modal');
    modal.style.transform = "scale(0)";
}

function toggleModalCircle() {
    const faktaboks = document.querySelector(".modal-faktaboks");
    const modalCircle = document.querySelector(".modal-circle");
    // const modalBillede = document.querySelector("#modal-billede");
    if (modalCircle.style.transform == "scale(0)"){
        modalCircle.style.transform = "scale(1)";
        faktaboks.style.transform = "scale(1)";
    } else {
        faktaboks.style.transform = "scale(0)";
        modalCircle.style.transform = "scale(0)";
    }

}

function toggleFullscreen() {
    const toggleOpen = document.querySelector("#fullscreen-toggle-open");
    const toggleExit = document.querySelector("#fullscreen-toggle-exit");

    if (!document.fullscreenElement) {
        // Enter fullscreen mode
        document.documentElement.requestFullscreen().catch((err) => {
            alert(`Error attempting to enable fullscreen mode: ${err.message}`);
        });

        toggleOpen.style.display = "none";
        toggleExit.style.display = "initial";

    } else {
        // Exit fullscreen mode
        document.exitFullscreen().catch((err) => {
            alert(`Error attempting to exit fullscreen mode: ${err.message}`);
        });

        toggleOpen.style.display = "initial";
        toggleExit.style.display = "none";
    }

}

function removeChildren(element){
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}