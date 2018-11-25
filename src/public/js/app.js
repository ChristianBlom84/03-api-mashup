class Mashed {
  constructor() {
    this.search = this.search.bind(this);

    this.initialize();
    this.addEventListeners();
  }

  initialize() {
    // Egenskaper för instanser av den här klassen, används för att referera till samma Node/Element i DOM.
    this.sentinel = document.querySelector('.sentinel');
    this.searchInput = document.querySelector('.search input');
    this.searchBtn = document.querySelector('.search button');
    this.sidebarWords = document.querySelectorAll('aside ul');
    this.searchResultsContainer = document.querySelector('.results ul');
    this.loadingIndicator = document.querySelector('.loader');
  }

  /**
   * Metod som sätter upp våra eventlyssnare
   */
  addEventListeners() {
    // Eventlyssnare för sök-knappen
    this.searchBtn.addEventListener('click', event =>
      this.search(event, this.searchInput.value)
    );

    /*
    * Eventlyssnare för alla ord i sidomenyn
    * För mer information om forEach: https://mzl.la/IysHjg
    */
    this.sidebarWords.forEach(wordEl =>
      wordEl.addEventListener('click', event =>
        this.search(event, event.target.textContent)
      )
    );

    /*
    * Eventlyssnare som kör masonry-funktionen för att justera om bildelementen
    * varje gång fönstret byter storlek. Ganska kostsamt att göra på detta sättet,
    * men det är en så lättkörd app att jag använde den metoden ändå.
    */
    window.addEventListener('resize', () =>
      this.masonry(".results ul", ".result", 5, 3, 3, 2)
    );
    
  }

  /**
   * Metod (används som callback) för att hantera sökningar
   *
   * @param {*} event Det event som gjorde att denna callback anropades
   * @param {*} [searchString=null] Den söksträng som användaren matat in i fältet, är null by default
   */
  search(event, searchString = null) {
    event.preventDefault();
    // Om söksträngen inte är tom och är definierad så ska vi söka
    if (this.checkSearchInput(searchString)) {
      this.loadingIndicator.classList.add("spin");
      let searchArray = [
        this.fetchFlickrPhotos(searchString),
        this.fetchWordlabWords(searchString)
      ];

      Promise.all(searchArray)
        .then((response) => {
          return response.map(result => {
            if (result.status === 200 || result.status === 303) {
              return result.json();
            } else {
              console.log(`Error, something broke with status code ${result.status}`);
            }
          })
        })
        .catch((error) => {
          console.log(error);
        })
        .then((res) => {
          Promise.all(res)
            .then((data) => {
              this.renderFlickrResults(data[0]);
              this.renderWordlabResults(data[1]);
            })
        })

    } else {
      return;
    }
  }

  /**
   * Metod som används för att kolla att söksträngen är giltig
   *
   * @param {*} searchString Söksträngen som matats in av användaren
   * @returns Boolean (true/false)
   */
  checkSearchInput(searchString) {
    return searchString && searchString.trim().length > 0;
  }

  /**
   *  Metod som används för att göra API-anrop till Flickr's API för att få bildresultat.
   *
   * @param {*} searchString Söksträngen som matats in av användaren
   * @returns {Promise} Ett fetch() Promise
   */
  fetchFlickrPhotos(searchString) {
    let flickrAPIkey = `ae89e17af123f4d7198fe58201322636`;
    let flickerAPIRootURL = `https://api.flickr.com/services/rest/?`;
    let flickrQueryParams = `&method=flickr.photos.search&api_key=${flickrAPIkey}&text=searchString&extras=url_q, url_o, url_m&format=json&tags=${searchString}&license=2,3,4,5,6,9&sort=relevance&parse_tags=1&nojsoncallback=1`;
    let flickrURL = `${flickerAPIRootURL}${flickrQueryParams}`;

    return fetch(flickrURL);
  }

  /**
   * Metod som används för att göra API-anrop till wordlab API:et för att få förslag på andra söktermer
   *
   * @param {*} searchString Söksträngen som matats in av användaren
   * @returns {Promise} Ett fetch() Promise
   */
  fetchWordlabWords(searchString) {
    let wordLabAPIkey = `104991b0904fc03f042fb114307ac9e8`; // Din API-nyckel här
    let wordLabURL = `http://words.bighugelabs.com/api/2/${wordLabAPIkey}/${searchString}/json`;

    return fetch(wordLabURL);
  }

  /**
   * Metod som skapar bild-element och relaterade element för varje sökresultat mot Flickr
   *
   * @param {Object} data Sökresultaten från Flickrs API.
   */
  renderFlickrResults(data) {
    let photoCount = 20;

    while (this.searchResultsContainer.childElementCount) {
      this.searchResultsContainer.lastChild.remove();
    }
    this.loadingIndicator.classList.remove("spin");

    if (data.photos.photo.length < 9) {
      photoCount = data.photos.photo.length;
    }

    for (let i = 0; i < photoCount; i++) {
      let imageContainer = document.createElement("li");
      imageContainer.innerHTML = `<a href="${data.photos.photo[i].url_o}" target="_blank" aria-label="View photo on Flickr in a new tab"><img src="${data.photos.photo[i].url_m}" /></a>`;
      imageContainer.classList.add("result");
      this.searchResultsContainer.appendChild(imageContainer);
    }
  
    this.masonry(".results ul", ".result", 5, 3, 3, 2);
    
  }

  /**
   * Metod som skapar ord-element för relaterade sökord som kommer från Wordlabs API
   *
   * @param {Object} data Sökresultaten från Wordlabs API.
   */
  renderWordlabResults(data) {
    let synonyms = [];
    let chosenSynonyms = [];

    while (this.sidebarWords[0].childElementCount) {
      this.sidebarWords[0].lastChild.remove();
    }

    if (data) {
      if (data.noun) {
        synonyms = data.noun.syn;
      }
      if (data.verb) {
        let verb = data.verb.syn;
        verb.forEach(function(item) {
          synonyms.push(item);
        });
      }
      if (data.adjective) {
        let adjective = data.adjective.syn;
        adjective.forEach(function(item) {
          synonyms.push(item);
        });
      }
    } else {
      synonyms = ["No synonoms"];
    }

    if (synonyms.length >= 5) {
      chosenSynonyms = this.getRandomWords(synonyms, 5);
    } else {
      chosenSynonyms = this.getRandomWords(synonyms, synonyms.length);
    }

    for (let i = 0; i < chosenSynonyms.length; i++) {
      let synonymElement = document.createElement("li");
      let synonymAnchor = document.createElement("a");
      synonymAnchor.href = "#";
      synonymElement.appendChild(synonymAnchor);
      this.sidebarWords[0].appendChild(synonymElement);
      this.sidebarWords[0].children[i].firstElementChild.innerText = chosenSynonyms[i];
    }
  }


  /**
   * Metod som returnerar wordAmount antal slumpmässiga ord från wordlabArray
   *
   * @param {Array} wordlabArray
   * @param {Number} wordAmount
   * @memberof Mashed
   */
  getRandomWords(wordlabArray, wordAmount) {
    let randomWords = [];
    let duplicate = false;

    if (wordAmount > wordlabArray.length) {
      wordAmount = wordlabArray.length;
    }

    for (let i = 0; i < wordAmount; i++) {
      let randomIndex = Math.floor(Math.random() * wordlabArray.length);
      duplicate = false;

      if (randomWords.length > 0) {
        for (let j = 0; j < randomWords.length; j++) {
          if (randomWords[j] === wordlabArray[randomIndex]) {
            duplicate = true;
            i--;
          }
        }

        if (duplicate === false) {
          randomWords.push( wordlabArray[randomIndex] );
        }
      } else {
        randomWords.push( wordlabArray[randomIndex] );
      }
    }

    return randomWords;
  }

  /**
   * Metod som ordnar bilderna i en masonry. Från https://w3bits.com/flexbox-masonry/. Den beräknar
   * totala höjden på alla bildelement och räknar ut korrekt maxhöjd för containern så att det blir rätt
   * antal kolumner och inget overflow. Jag hann inte få imageLoaded att fungera, så jag lade in en timeout
   * på 1.2 sekunder för att se till att alla bilder laddats innan stylingen sätts.
   *
   * @param {*} grid Containern för bildelementen
   * @param {*} gridCell De enskilda elementen som innehåller bilderna
   * @param {*} gridGutter Avståndet mellan bildelementen
   * @param {*} dGridCol Antalet kolumner för desktop/största storleken
   * @param {*} tGridCol Antalet kolumner för tablets/mellanstorleken
   * @param {*} mGridCol Antalet kolumner för mobil/minsta storleken
   * @memberof Mashed
   */
  masonry(grid, gridCell, gridGutter, dGridCol, tGridCol, mGridCol) {
    var g = document.querySelector(grid),
        gc = document.querySelectorAll(gridCell),
        gcLength = gc.length,
        gHeight = 0,
        i;
    
    setTimeout(function () {
      for(i=0; i<gcLength; ++i) {
        gHeight+=gc[i].offsetHeight+parseInt(gridGutter);
      }

      if(window.innerWidth >= 1024)
        g.style.height = gHeight/dGridCol + gHeight/(gcLength+1) + "px";
      else if(window.innerWidth < 1024 && window.innerWidth >= 768)
        g.style.height = gHeight/tGridCol + gHeight/(gcLength+1) + "px";
      else
        g.style.height = gHeight/mGridCol + gHeight/(gcLength+1) + "px";
    }, 1200);
    
  }

}
// Immediately-Invoked Function Expression, detta betyder att när JS-filen läses in så körs koden inuti funktionen nedan.
(function() {
  new Mashed();
})();
