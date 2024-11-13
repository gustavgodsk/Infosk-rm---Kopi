let areas = window.areas;
let data;

function init(){
    const container = document.querySelector(".menu-button-container")
    // areas.forEach((element, index) => {
    //     const button = document.createElement("div");
    //     button.classList.add("menu-button")
    //     button.style.backgroundColor = element.primaryColor;
    //     const text = document.createElement("p");
    //     text.textContent = element.areaName;
    //     const onclickEvent = button.addEventListener("click", () => {
    //         setup(element, index)
    //     })
    //     button.appendChild(text)
    //     container.appendChild(button)
    // });


    areas.forEach((element, index) => {
        const button = document.createElement("div");
        button.classList.add("menu-button")
        button.style.backgroundColor = element.primaryColor;
        const text = document.createElement("p");
        text.textContent = element.areaName;
        const arrow = document.createElement("div");
        arrow.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25"><path style="fill:none; stroke:white; stroke-width:1" d="m17.5 5.999-.707.707 5.293 5.293H1v1h21.086l-5.294 5.295.707.707L24 12.499l-6.5-6.5z" data-name="Right"/></svg>'
        const onclickEvent = button.addEventListener("click", () => {
            setup(element, index)
        })
        button.appendChild(text)
        button.appendChild(arrow)
        container.appendChild(button)
        
    })

}

init();

//setup funktionen åbner en bestemt side
function setup(area, index){
    data = area;
    let oversigtskort = document.querySelector("#oversigtskort");
    oversigtskort.src = "billeder/" + data.areaName + "/" + data.oversigtskort;

    const menu = document.querySelector(".menu");
    menu.style.transform = "scale(0)";

    const main = document.querySelector("#main");
    main.style.transform = "scale(1)";
    const venstre = document.querySelector(".venstre")
    const højre = document.querySelector(".højre")
    const antalElementer = data.elementer.length;
    data.elementer.forEach((element, index) => {
        //laver 20 elementer med titel, beskrivelse og billede, 10 i hver side
        if (index < Math.floor(antalElementer/2)){
            const sideElement = lavSideElement(data, element, index);
            venstre.appendChild(sideElement);
        // } else if (index >= Math.floor(antalElementer/2) && index < 20){
        } else if (index >= Math.floor(antalElementer/2)){
            const sideElement = lavSideElement(data, element, index);
            højre.appendChild(sideElement);
        } else {
            console.log("Over 20 elementer, undlader at lave sideElement med id:" + element.id)
        }

        const oversigtskortKnap = lavOversigtskortKnap(data, element, index);
    });



    // Event listener for at lukke modal
    document.addEventListener('click', function(event) {
        const overlay = document.getElementById('overlay');
        
        if ((event.target === overlay || event.target.classList.contains('luk-modal-knap')) && !window.isCarouselDragging) {
            lukModal();
        }
    });
}

function goBack(){
    const menu = document.querySelector(".menu");
    menu.style.transform = "scale(1)";
    //nulstil oversigtskort
    const oversigtskort = document.querySelector("#oversigtskort");
    oversigtskort.src = "";


    document.querySelector(".oversigtskort-container").querySelectorAll(".oversigtskort-knap").forEach(element => {
        console.log(element)
        element.remove()
    });
    const main = document.querySelector("#main");
    main.style.transform = "scale(0)";
    const venstre = document.querySelector(".venstre")
    const højre = document.querySelector(".højre")
    removeChildren(venstre);
    removeChildren(højre);
}

//lav side element funktion. Køres 20 gange i setup-funktionen
function lavSideElement(data, element, index){
    const sideContainer = document.createElement('div');
    sideContainer.className = 'side-container';
    sideContainer.addEventListener("click", () => {åbnModal(data, element, index)})

    const tekstContainer = document.createElement('div');
    tekstContainer.className = 'tekst-container';

    const navn = document.createElement('h2');
    navn.textContent = element.navn;

    const beskrivelse = document.createElement('p');
    beskrivelse.textContent = element.beskrivelse;

    const billedeContainer = document.createElement('div');
    billedeContainer.className = 'billede-container';

    const billede = document.createElement('img');
    billede.src = "billeder/" + data.areaName + "/" + element.billeder.primary;

    const billedeId = document.createElement('div');
    billedeId.textContent = index+1;
    billedeId.style.backgroundColor = data.primaryColor

    
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
    knap.textContent = index+1;
    knap.style.backgroundColor = data.primaryColor
    knap.onclick = () => {
        åbnModal(data, element, index)
    }

    const oversigtskortContainer = document.querySelector(".oversigtskort-container");
    oversigtskortContainer.appendChild(knap)
}

function modalCarousel(data,element,index){

    const images = element.billeder.all.map((e,i) => {
        return "billeder/" + data.areaName + "/" + e
    })

    const container = document.querySelector(".carousel-container")
    const primary = element.billeder.all.indexOf(element.billeder.primary)
    const metadata = element.billeder.metadata;
    const carousel = new ImageCarousel(container, images, primary, metadata);
    container.__carouselInstance = carousel; // Store the instance on the container element

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
  
    createSlide(src, metadata) {
      const slide = document.createElement('div');
      slide.style.flexShrink = '0';
      slide.style.width = '100%';
      slide.style.height = '100%';
      slide.style.pointerEvents = 'none';
      slide.style.userSelect = 'none';
      slide.style.webkitUserSelect = 'none';
      slide.style.mozUserSelect = 'none';
      slide.style.msUserSelect = 'none';
      slide.style.position = 'relative'; // Add this for absolute positioning of text

  
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
      

          // Create and style the text overlay
          if (metadata.description.length == 0 && metadata.author.length == 0 && metadata.year.length == 0){

          } else {
            const div = document.createElement("div")
            div.classList.add("metadata")
            let text = document.createElement('p');
            if (metadata.description.length > 0){
                text.textContent = metadata.description;
                div.appendChild(text)
            }
            if (metadata.author.length > 0 || metadata.year.length > 0){
                text = document.createElement('p');
                let content = "";
                if (metadata.author.length > 0){
                  content += "Foto: " + metadata.author;
                  if (metadata.year.length > 0){
                    content += ", " + metadata.year;
                  }
                } else if (metadata.year.length > 0){
                  content += metadata.year;
                }
                text.textContent = content;
                div.appendChild(text)
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
    titel.textContent = element.navn;

    const modalCircle = document.querySelector(".modal-circle");
    modalCircle.classList.add(element.infoCirkelPlacering)
    modalCircle.style.transform = "scale(1)";

    const modalID = document.querySelector(".modal-id");
    modalID.textContent = index+1;
    modalID.style.backgroundColor = data.primaryColor

    const modal = document.querySelector(".modal")
    const facts = Object.entries(element.faktaboks).filter((e) => {
        return e[1] !== "";
    })
    if (facts.length > 0){
        console.log(facts.length)
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
    
        faktaboks.style.display = "initial";
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