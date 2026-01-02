let latestData = null; // store last fetched data

async function fetchCountryData() {
    const country = document.getElementById("countryInput").value.trim();

    if (!country) {
        alert("Please enter a country name");
        return;
    }

    document.getElementById("weather").textContent = "Loading...";
    document.getElementById("time").textContent = "Loading...";

    try {
        // 1. Geocoding: get latitude, longitude, timezone
        const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(country)}`
        );
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            document.getElementById("weather").textContent = "Country not found";
            document.getElementById("time").textContent = "Country not found";
            latestData = null;
            return;
        }

        const { latitude, longitude, timezone, name } = geoData.results[0];

        // 2. Weather
        const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );
        const weatherData = await weatherRes.json();

        const temp = weatherData.current_weather.temperature;
        const wind = weatherData.current_weather.windspeed;

        document.getElementById("weather").textContent =
            `Location: ${name} | Temp: ${temp}°C | Wind: ${wind} km/h`;

        // 3. Time
        const timeRes = await fetch(
            `https://api.open-meteo.com/v1/timezone?latitude=${latitude}&longitude=${longitude}`
        );
        const timeData = await timeRes.json();

        const initialTime = new Date(timeData.datetime);

        document.getElementById("time").textContent =
            initialTime.toLocaleTimeString("en-GB", { timeZone: timezone });

        // Auto-update local time every second using timezone
        if (window.timeInterval) {
            clearInterval(window.timeInterval);
        }
        window.timeInterval = setInterval(() => {
            const now = new Date();
            document.getElementById("time").textContent =
                now.toLocaleTimeString("en-GB", { timeZone: timezone });
        }, 1000);

        // Store latest data for saving to backend
        latestData = {
            country: country,
            latitude,
            longitude,
            timezone,
            temperature: temp,
            windspeed: wind,
            time: initialTime.toISOString()
        };

    } catch (err) {
        console.error(err);
        document.getElementById("weather").textContent = "Error fetching data";
        document.getElementById("time").textContent = "Error fetching data";
        latestData = null;
    }
}

async function saveData() {
    if (!latestData) {
        alert("Search a country first");
        return;
    }

    try {
        // relative path -> goes via the same host/Ingress
        const res = await fetch("/api/save-country", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(latestData)
        });

        if (!res.ok) {
            throw new Error("Request failed");
        }

        const result = await res.json();
        alert(result.message);

    } catch (err) {
        console.error(err);
        alert("Failed to save data");
    }
}
