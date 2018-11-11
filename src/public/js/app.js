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

    // Frivilligt: för att visa en laddningsindikator!
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
      console.log(`Trigga sökning med ${searchString}`);
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
              console.log("Error, something broke");
            }
          })
        })
        .catch((error) => {
          console.log(error);
        })
        .then((res) => {
          Promise.all(res).then((data) => {
            this.renderFlickrResults(data[0]);
            this.renderWordlabResults(data[1]);
          })
        })

      searchArray.forEach(promise => {
        console.log(promise);
      })

      // 1) Bygg upp en array med anrop (promise) till fetchFlickrPhotos och fetchWordlabWords med searchString
      // Notera: att ordningen du skickar in dessa i spelar roll i steg 3)

      // 2) Använd Promise.all för att hantera varje anrop (promise)

      // 2 a) then(results) => Om varje anrop lyckas och varje anrop returnerar data

      // 3) För varje resultat i arryen results, visa bilder från FlickR or ord från WordLab.
      // 4) results[0] kommer nu innehålla resultat från FlickR och results[1] resultat från WordLab.
      // 5) skapa element och visa dem i DOM:en med metoderna (renderFlickResults och renderWordlabResults)

      // 2 b) catch() => Om något anrop misslyckas, visa felmeddelande

    } else {
      console.log(
        `Söksträngen är tom, visa ett meddelande eller bara returnera`
      );
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
   * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
   * @param {*} searchString Söksträngen som matats in av användaren
   * @returns {Promise} Ett fetch() Promise
   */
  fetchFlickrPhotos(searchString) {
    let flickrAPIkey = `ae89e17af123f4d7198fe58201322636`; // Din API-nyckel här
    let flickerAPIRootURL = `https://api.flickr.com/services/rest/?`; // Grundläggande delen av Flickr's API URL

    // Olika sökparametrar som behövs för Flickr's API. För mer info om detta kolla i Flickrs API-dokumentation
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
   * @param {Object} data Sökresultaten från Flickr's API.
   */
  renderFlickrResults(data) {
    console.log(this.searchResultsContainer);

    while (this.searchResultsContainer.childElementCount) {
      this.searchResultsContainer.lastChild.remove();
    }
    this.loadingIndicator.classList.remove("spin");

    for (let i = 0; i < 9; i++) {
      let imageContainer = document.createElement("li");
      imageContainer.innerHTML = `<a href="${data.photos.photo[i].url_o}" target="_blank" aria-label="View photo on Flickr in a new tab"><img src="${data.photos.photo[i].url_q}" /></a>`;
      imageContainer.classList.add("result");
      this.searchResultsContainer.appendChild(imageContainer);
    }
  }

  /**
   * Metod som skapar ord-element för relaterade sökord som kommer från Wordlabs API
   *
   * @param {Object} data Sökresultaten från Flickr's API.
   */
  renderWordlabResults(data) {
    let nouns = data.noun;
    let verbs = data.verb;
    let adjectives = data.adjective;
    let synonyms;
    if (nouns) {
      synonyms = nouns;
      if (verbs) {
        synonyms = synonyms.concat(verbs);
      }
      if (adjectives) {
        synonyms = synonyms.concat(adjectives);
      }
    }

    console.log(data);
    console.log(synonyms);
  }
}

// Immediately-Invoked Function Expression, detta betyder att när JS-filen läses in så körs koden inuti funktionen nedan.
(function() {
  new Mashed();
})();
