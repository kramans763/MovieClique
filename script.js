//states
let currentPage=1;
let lastPage;
let movies=[];

const prevPageBtn=document.getElementById("prev-button"); 
const currPageBtn=document.getElementById("curr-page-button");
const nextPageBtn=document.getElementById("next-button"); 

const searchInput=document.getElementById("search-input");
const searchBtn=document.getElementById("search-btn");

const sortByDateBtn=document.getElementById("sort-by-date");
const sortByRatingBtn=document.getElementById("sort-by-rating");

const allTabBtn=document.getElementById("all-tab");
const favTabBtn=document.getElementById("favorites-tab");


async function fetchMovie(pageNumber){
    try{
        const options = {
            method: 'GET',
            headers: {
              accept: 'application/json',
              Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZWI1ODczZGE4NWU4NjY5OTk1MTkxMTkzODhiYzIxMiIsInN1YiI6IjY0OTFkNzRiNTU5ZDIyMDExYzRlMmVkZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.K8DfOaHGC6KufJiKjy_dWuN2RC9WHFftWuFtfvqCrWQ'
            }
          };

        const url=`https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=${pageNumber}`;
        const response=await fetch(url,options);
        let data=await response.json();
        const{total_pages}=data;
        lastPage= total_pages;
        const changedData = reMapData(data);
        movies=changedData;
        renderMovies(movies);
        return data;
    }catch(error){
      console.log(error);
    }
      
}

async function fetchMovieWithId(id){
     const url=`https://api.themoviedb.org/3/movie/${id}?api_key=beb5873da85e866999519119388bc212`;
     const response = await fetch(url)
     const dataList = await response.json();
     console.log(dataList);
 
         return {
             title: dataList.title,
             voteAverage: dataList.vote_average,
             posterPath: dataList.poster_path,
             popularity: dataList.popularity,
             id: dataList.id
         }
}

function reMapData(data){
  const movieList=data.results;
  const mappedMovieList=movieList.map(movie=>{
    return{
    title: movie.title,
    voteAverage: movie.vote_average,
    popularity : movie.popularity,
    posterPath: movie.poster_path,
    id:movie.id
    }
  });
  return mappedMovieList;
}
fetchMovie(currentPage);

// local staorage get and set

function getMoviesFromLocal(){
  const allFavMovieString=JSON.parse(localStorage.getItem("favMovie"));
  if(allFavMovieString===null || allFavMovieString===undefined){
    return [];
  }else{
    return allFavMovieString;
  }
}

function setMoviesToLocal(movie){
   const allFavMovie=getMoviesFromLocal();
   const arrayOfMovie=[...allFavMovie,movie];
   localStorage.setItem("favMovie", JSON.stringify(arrayOfMovie));
}

function removeMovieFromLocal(id){
  const favMovieId=getMoviesFromLocal();
  const filteredFavMovie=favMovieId.filter((movieId)=>movieId!==id);
  localStorage.setItem("favMovie",JSON.stringify(filteredFavMovie));
}

const movieCardContainer=document.getElementById("movies-card-container");

// rendering movies

function renderMovies(movieList){

  const favMovieList=getMoviesFromLocal();

  clearMovieList();
  movieList.forEach(movie=>{
    const{title,popularity,posterPath,voteAverage,id}=movie;

     // check for fav movie or not
    const isfavMovie=favMovieList.indexOf(id+"")>-1;

    const cardDiv=document.createElement("div");
    cardDiv.classList.add("card");
    const posterUrl='https://image.tmdb.org/t/p/original'+posterPath;
    cardDiv.innerHTML=`
    <section>
       <img class="poster" src=${posterUrl} alt="">
    </section>
    <p class="movie-title">
      ${title}
    </p>
    <section class="votes-favorites">
        <section class="votes">
          <p class="vote-count">Votes: ${voteAverage} </p>
          <p class="vote-rating">Rating: ${popularity}</p>
        </section>
        <section class="favorites">
          <i id=${id} class="fa-regular fa-heart ${isfavMovie ? 'fa-solid' : ''}"></i>
         </section>
    </section>
    `;
    //const movieCardContainer=document.getElementById("movies-card-container");
    movieCardContainer.appendChild(cardDiv);

    const favItemBtn=document.getElementById(id);
    favItemBtn.addEventListener('click',(event)=>{
         const heartSign=event.target;
         const{id}=heartSign;


         if(favItemBtn.classList.contains("fa-solid")){
            // remove movie from local storage
            removeMovieFromLocal(id);
            favItemBtn.classList.remove("fa-solid");

         }else{
          // add movie to local storage
          setMoviesToLocal(id);
          //make black heart
          favItemBtn.classList.add("fa-solid");
         }
    })
  })
}

async function searchMovies(movieName){
  try{
  const url=`https://api.themoviedb.org/3/search/movie?query=${movieName}&api_key=beb5873da85e866999519119388bc212`;
  const response= await fetch(url);
  const data=await response.json();
  const filteredData=reMapData(data);
  renderMovies(filteredData);
  }catch(error){
      console.log("invalid movie search");
  }
}

function clearMovieList(){
  movieCardContainer.innerHTML="";
}

async function renderFavMovies(){
   clearMovieList();
   const favMovieList = getMoviesFromLocal(); // id[240, 290]

    const favMovieListData = [];

    for (let index = 0; index < favMovieList.length; index++) {
        const movieId = favMovieList[index];

        const response = await fetchMovieWithId(movieId)

        favMovieListData.push(response);
    } 
    renderMovies(favMovieListData);   
}
function displayMovies(){
  if(favTabBtn.classList.contains("active-tab")){
    sortByDateBtn.style.display="none";
    sortByRatingBtn.style.display="none";
    
    renderFavMovies();

  }else if(allTabBtn.classList.contains("active-tab")){
     sortByDateBtn.style.display="inline-block";
    sortByRatingBtn.style.display="inline-block";

    renderMovies(movies);
  }
}

function switchTab(event){
  allTabBtn.classList.remove("active-tab");
  favTabBtn.classList.remove("active-tab");

  const clickedBtn=event.target;
  clickedBtn.classList.add("active-tab");

  displayMovies();
}




// Listner


prevPageBtn.disabled=true;

nextPageBtn.addEventListener('click',()=>{
   currentPage++;
   fetchMovie(currentPage);
   currPageBtn.innerHTML=`Current Page: ${currentPage}`;

   if(currentPage===1){
    prevPageBtn.disabled=true;
   }
   else if(currentPage===2){
    prevPageBtn.disabled=false;
   }else if(currentPage===lastPage){
    nextPageBtn.disabled=true;
   }
})

prevPageBtn.addEventListener('click',()=>{
  currentPage--;
  fetchMovie(currentPage);
  currPageBtn.innerHTML=`Current Page: ${currentPage}`;

  if(currentPage===1){
   prevPageBtn.disabled=true;
  }
  else if(currentPage===2 && currentPage!==lastPage-1){
   prevPageBtn.disabled=false;
  }
  else if(currentPage===lastPage-1){
    nextPageBtn.disabled=false;
  }
})


searchBtn.addEventListener('click',()=>{
  const userQuery=searchInput.value;
  searchInput.value="";
  searchMovies(userQuery);
    
})

allTabBtn.addEventListener('click',switchTab);
favTabBtn.addEventListener('click',switchTab);

sortByRatingBtn.addEventListener('click', async ()=>{
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiZWI1ODczZGE4NWU4NjY5OTk1MTkxMTkzODhiYzIxMiIsInN1YiI6IjY0OTFkNzRiNTU5ZDIyMDExYzRlMmVkZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.K8DfOaHGC6KufJiKjy_dWuN2RC9WHFftWuFtfvqCrWQ'
    }
  };
  const response = await fetch('https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc', options);
  const data = await response.json()
  const changedData = reMapData(data)
  renderMovies(changedData);
  
})



