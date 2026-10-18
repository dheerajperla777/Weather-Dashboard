const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const status = document.getElementById("status");
const weather = document.getElementById("weather");

function getCondition(code) {
    if (code === 0) return "Clear sky";
    if ([1, 2].includes(code)) return "Mostly clear";
    if (code === 3) return "Overcast";
    if ([45, 48].includes(code)) return "Foggy";
    if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return "Rainy";
    }
    if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return "Snowy";
    }
    if ([95, 96, 99].includes(code)) return "Thunderstorm";

    return "Weather conditions unavailable";
}

async function getWeather(city) {
    status.textContent = "Loading weather...";
    weather.hidden = true;

    try {
        const geoUrl =
            "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(city) + "&count=1&language=en&format=json";

        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            throw new Error("Unable to search for the city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Check the spelling.");
        }

        const place = geoData.results[0];

        const weatherUrl =
            "https://api.open-meteo.com/v1/forecast" +
            `?latitude=${place.latitude}` +
            `&longitude=${place.longitude}` +
            "&current=temperature_2m,relative_humidity_2m," +
            "wind_speed_10m,weather_code";

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Unable to retrieve weather data.");
        }

        const data = await weatherResponse.json();
        const current = data.current;

        document.getElementById("cityName").textContent =
            [place.name, place.admin1, place.country]
                .filter(Boolean)
                .join(", ");

        document.getElementById("condition").textContent =
            getCondition(current.weather_code);

        document.getElementById("temperature").textContent =
            current.temperature_2m;

        document.getElementById("humidity").textContent =
            current.relative_humidity_2m;

        document.getElementById("wind").textContent =
            current.wind_speed_10m;

        weather.hidden = false;
        status.textContent =
            "Updated: " + current.time.replace("T", " ") +
            " (local time at the selected location).";

 } catch (error) {
    console.error("Weather API error:", error);
    status.textContent = "Error: " + error.message;
    }
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (city) {
        getWeather(city);
    }
});
