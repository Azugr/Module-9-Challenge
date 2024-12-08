HEAD
Module-9-Challenge: Weather Dashboard

This project is a Weather Dashboard application that allows users to view current weather conditions and a five-day forecast for cities around the world. It utilizes the OpenWeather API for data and is designed with a simple and responsive UI.

Features

    City Search: Search for any city to view its weather.
    Current Weather: Shows temperature, wind speed, humidity, and an icon representing the weather.
    5-Day Forecast: Displays date, temperature, wind speed, humidity, and a weather icon.
    Search History: Previously searched cities are saved for quick access.

Technologies Used

    Node.js and Express for the back-end.
    OpenWeather API to fetch weather data.
    Render for deployment.

Installation

    Clone the repository:

git clone https://github.com/your-username/Module-9-Challenge.git
cd Module-9-Challenge

Install dependencies:

npm install

Set up Environment Variables:

    Register for an API key at OpenWeather.
    Create a .env file in the root directory and add your API key:

    OPENWEATHER_API_KEY=your_api_key_here

Run the Server:

    npm start

    View in Browser: Open http://localhost:3000 in your browser to access the app.

Usage

    Enter a City in the search box and click "Search" to fetch weather data.
    View Current Weather and 5-Day Forecast in the main area.
    Click a City in the History to reload weather data for that city.

Deployment

The app is deployed on Render. View the live application.
License

This project is licensed under the MIT License.
=======
# Module-9-Challenge
This app uses the OpenWeather API to show current and 5-day weather forecasts for cities. Features include city search, persistent search history, and weather data display with temperature, wind speed, and humidity. Built with Node.js, Express, and deployed on Render.
