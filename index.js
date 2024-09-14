const userTab= document.querySelector("[data-userWeather]");
const searchTab= document.querySelector("[data-searchWeather]");
const userContainer= document.querySelector(".weather-container");
const searchInp=document.querySelector("[data-searchInput]");
const grantAccessContainer= document.querySelector(".grant-location-container");
const searchForm= document.querySelector("[data-searchForm]");
const loadingScreen=document.querySelector(".loading-container");
const userInfoContainer= document.querySelector(".user-info-container");
const notFound=document.querySelector(".Error");
const retryBtn=document.querySelector(".retry");

// initially variables need
let currentTab=userTab;
const API_KEY="229cc7c2f375c51e17bf4ea9ad5b4bd3";
currentTab.classList.add("current-tab");
notFound.classList.remove("active");
//ek kaam pending pr h

function switchTab(clickedTab){
    if(clickedTab!=currentTab){
        currentTab.classList.remove("current-tab");
        currentTab=clickedTab;
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            //is search form wala container is invisible.if yes then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active"); 
        }
        else{
            // means phele  search wale tab pr tha. b your weather tab visible karna h
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            // ab weather tab mei aa gaye h to weather bhi display karna padega so lets check locak storage first
            //for the cordinates,if we saved them there.
            getfromSessionStorage();
        }
    }
   
}

userTab.addEventListener("click", ()=>{
    //pass clicked tab as input parameter
    switchTab(userTab);
});
searchTab.addEventListener("click", ()=>{
    //pass clicked tab as input parameter
    switchTab(searchTab);
});


//check if cordinates are alredy present in session storage
function getfromSessionStorage(){
     const localCoordinates= sessionStorage.getItem("user-coordinates");
     if(!localCoordinates){
        //agar local cordinates nahi mile
        grantAccessContainer.classList.add("active");
     }
     else{
        const coordinates =JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
     }
}
function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        //hw-show an alert for no gelolocation support available
    }
}


function showPosition(position){

    const userCoordinates={
        lat:position.coords.latitude,
        lon:position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    //sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton=document.querySelector("[data-grantAccess]");
getfromSessionStorage();
grantAccessButton.addEventListener("click", getLocation);

async function fetchUserWeatherInfo(coordinates){
    const { lat, lon } =coordinates;
    //make grantcontainer invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");

    //API call
    try{
      const response =await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data=await response.json();

      loadingScreen.classList.remove("active");
      userInfoContainer.classList.add("active");
      renderWeatherInfo(data);

    }
    catch(err){
        loadingScreen.classList.remove("active");
    }
}

function renderWeatherInfo(weatherInfo){
    // firsty feth the elements jin mei value set kr ni h
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc =document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");
    const sunrise=document.querySelector("[data-sunrise]");
    const sunset=document.querySelector("[data-sunset]");
    const pressure=document.querySelector("[data-pressure]");

    // now fetch the value from weather info object and put it in UI elements
    cityName.innerText=weatherInfo?.name;
    // link se liy or fir json file me jaa kr deta fetch kara us se flag mil jayega
    countryIcon.src=`https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText=weatherInfo?.weather?.[0]?.description;
    weatherIcon.src=`https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText= `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText=`${weatherInfo?.wind?.speed} m/sec`;
    humidity.innerText=`${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText=`${weatherInfo?.clouds?.all} %`;
    sunrise.innerText=timeconversion(`${weatherInfo?.sys?.sunrise}`);
    sunset.innerText=timeconversion(`${weatherInfo?.sys?.sunset}`);
    pressure.innerText=`${weatherInfo?.main?.pressure}hpa`;

}

const searchInput=document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    let cityName=searchInput.value;
    if(cityName==="")
        return;

    else
    fetchSearchWeatherInfo(cityName);
});

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try{
        const response=await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data=await response.json();
        if (response.ok) { // If API call was successful
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            notFound.classList.remove("active");
            searchInp.value='';
            renderWeatherInfo(data);
        } else { // If city not found or other error
            loadingScreen.classList.remove("active");
            notFound.classList.add("active");
            searchInp.value='';
        }
    } catch (error) {
        loadingScreen.classList.remove("active");
        notFound.classList.add("active");
        searchInp.value='';
        
    }
}

// on click on this button again search bar come...
retryBtn.addEventListener("click", ()=>{
    //pass clicked tab as input parameter
    // grantAccessContainer.classList.add("active");
    notFound.classList.remove("active");
    searchForm.classList.add("active");
    searchInp.value='';

});

function timeconversion(value){
    let unix_timestamp=value;
    var date=new Date(unix_timestamp*1000).toLocaleTimeString();
    return date;
}



