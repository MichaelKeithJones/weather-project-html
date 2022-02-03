(function () {
    /*----------------------------------
    CONSTANTS VARIABLES
    ----------------------------------*/
    const root = document.documentElement;
    const DEGREE = '\u00B0';
    const STARTING_MAPBOX_COORD = [-98.489597, 29.42681];                   // Starting position: 600 Navarro St #600, San Antonio, TX 78205
    const STARTING_MAPBOX_ZOOM = 15;                                        // Starting zoom
    const STARTING_MAPBOX_STYLE = 'mapbox://styles/mapbox/streets-v9'       // Starting mapbox map style - Street v9
    const OPEN_WEATHER_MAP_WEATHER_URL = 'http://api.openweathermap.org/data/2.5/weather';
    const OPEN_WEATHER_MAP_FORECAST_URL = 'http://api.openweathermap.org/data/2.5/forecast';

    /*----------------------------------
    GLOBAL VARIABLES
    ----------------------------------*/
    let darkMode = false;
    let map = new mapboxgl.Map({
        accessToken: MAPBOX_API_KEY,
        container: 'map',                                                   // Mapbox map ID
        style:  STARTING_MAPBOX_STYLE,
        center: STARTING_MAPBOX_COORD,
        zoom:   STARTING_MAPBOX_ZOOM
    });
    let marker = new mapboxgl.Marker({ draggable: true }).setLngLat(STARTING_MAPBOX_COORD).addTo(map);
    let chartGridColor = '#6c757d';
    let humidityChart = new Chart($('#humidity-chart'), {type: 'line', options: {
            plugins: {
                legend: {
                    labels: {
                        color: chartGridColor
                    }
                }
            },
            maintainAspectRatio: false,
            animation: false,
            scales: {
                x: {
                    grid: {color: chartGridColor},
                    ticks: {color: chartGridColor}
                },
                y: {
                    grid: {color: chartGridColor},
                    beginAtZero: true,
                    max: 100,
                    min: 0,
                    ticks: {
                        color: chartGridColor,
                        stepSize: 10
                    }
                }
            }
        }});
    let pressureChart = new Chart($('#pressure-chart'), {type: 'bar', options: {
            plugins: {
                legend: {
                    labels: {
                        color: chartGridColor
                    }
                }
            },
            maintainAspectRatio: false,
            animation: false,
            scales: {
                x: {
                    grid: {color: chartGridColor},
                    ticks: {color: chartGridColor}
                },
                y: {
                    grid: {color: chartGridColor},
                    beginAtZero: true,
                    max: 1200,
                    min: 800,
                    ticks: {
                        color: chartGridColor,
                        stepSize: 50
                    }
                }
            }
        }});
    let windChart = new Chart($('#wind-chart'), {type: 'line', options: {
            plugins: {
                legend: {
                    labels: {
                        color: chartGridColor
                    }
                }
            },
            maintainAspectRatio: false,
            animation: false,
            scales: {
                x: {
                    grid: {color: chartGridColor},
                    ticks: {color: chartGridColor}
                },
                y: {
                    grid: {color: chartGridColor},
                    beginAtZero: true,
                    ticks: {
                        color: chartGridColor,
                    }
                }
            }
        }});

    /*----------------------------------
    FUNCTIONS
    ----------------------------------*/
    const capitalizeFirstLetter = string => string.replace(/^./, string[0].toUpperCase());
    const getWeekday = date => date.toLocaleString('en-us', { weekday: 'short'});
    const formatDate = date => date.toLocaleString('en-us', { month: 'short', day: 'numeric'});
    const formatTime = time => time.toLocaleString('en-us', { timeStyle: 'short', timeZone: 'US/Central'});
    let getDateTime = (dt, timezone) => new Date(dt*1000+(timezone*1000));
    function geocode(search, token) {
        var baseUrl = 'https://api.mapbox.com';
        var endPoint = '/geocoding/v5/mapbox.places/';
        return fetch(baseUrl + endPoint + encodeURIComponent(search) + '.json' + "?" + 'access_token=' + token)
            .then(function(res) {
                return res.json();
            }).then(function(data) {
                return data.features[0].center;
            });
    }

    /*----------------------------------
    EVENT HANDLERS
    ----------------------------------*/
    $('#header-search-btn').on('click', () => {
        let location = $('#header-search-bar').val();
        geocode(location, MAPBOX_API_KEY).then(function(coordinates) {
            marker.setLngLat(coordinates);
            map.flyTo({
                zoom: 15,
                bearing: 0,
                center: [
                    coordinates[0],
                    coordinates[1]
                ],
                essential: true
            });
            getOpenWeatherData(coordinates[0], coordinates[1]);
        });
    });
    $('#header-search-bar').on('keyup', (event) => {
        if (event.keyCode === 13) {
            let location = $('#header-search-bar').val();
            geocode(location, MAPBOX_API_KEY).then(function(coordinates) {
                marker.setLngLat(coordinates);
                map.flyTo({
                    zoom: 15,
                    bearing: 0,
                    center: [
                        coordinates[0],
                        coordinates[1]
                    ],
                    essential: true
                });
                getOpenWeatherData(coordinates[0], coordinates[1]);
            });
        }
        return null;
    });
    $('#dark-mode').on('click', () => {
        if(darkMode) {
            darkMode = false;
            root.style.setProperty('--body-background-color', 'white');
            root.style.setProperty('--current-weather-font-color', 'black');
            root.style.setProperty('--chart-tab-font-color', 'var(--teal)');
            chartGridColor = '#6c757d';
            humidityChart.options = {
                plugins: {
                    legend: {
                        labels: {
                            color: chartGridColor
                        }
                    }
                },
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    x: {
                        grid: {color: chartGridColor},
                        ticks: {color: chartGridColor}
                    },
                    y: {
                        grid: {color: chartGridColor},
                        beginAtZero: true,
                        max: 100,
                        min: 0,
                        ticks: {
                            color: chartGridColor,
                            stepSize: 10
                        }
                    }
                }
            };
            humidityChart.update();
            pressureChart.options = {
                plugins: {
                    legend: {
                        labels: {
                            color: chartGridColor
                        }
                    }
                },
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    x: {
                        grid: {color: chartGridColor},
                        ticks: {color: chartGridColor}
                    },
                    y: {
                        grid: {color: chartGridColor},
                        beginAtZero: true,
                        max: 1200,
                        min: 800,
                        ticks: {
                            color: chartGridColor,
                            stepSize: 50
                        }
                    }
                }
            };
            pressureChart.update();
            windChart.options = {
                plugins: {
                    legend: {
                        labels: {
                            color: chartGridColor
                        }
                    }
                },
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    x: {
                        grid: {color: chartGridColor},
                        ticks: {color: chartGridColor}
                    },
                    y: {
                        grid: {color: chartGridColor},
                        beginAtZero: true,
                        ticks: {
                            color: chartGridColor,
                        }
                    }
                }
            };
            windChart.update();
        } else {
            darkMode = true;
            root.style.setProperty('--body-background-color', 'rgba(0, 0, 0, 0.8)');
            root.style.setProperty('--current-weather-font-color', 'white');
            root.style.setProperty('--chart-tab-font-color', 'white');
            chartGridColor = 'white';
            humidityChart.options = {
                plugins: {
                    legend: {
                        labels: {
                            color: chartGridColor
                        }
                    }
                },
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    x: {
                        grid: {color: chartGridColor},
                        ticks: {color: chartGridColor}
                    },
                    y: {
                        grid: {color: chartGridColor},
                        beginAtZero: true,
                        max: 100,
                        min: 0,
                        ticks: {
                            color: chartGridColor,
                            stepSize: 10
                        }
                    }
                }
            };
            humidityChart.update();
            pressureChart.options = {
                plugins: {
                    legend: {
                        labels: {
                            color: chartGridColor
                        }
                    }
                },
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    x: {
                        grid: {color: chartGridColor},
                        ticks: {color: chartGridColor}
                    },
                    y: {
                        grid: {color: chartGridColor},
                        beginAtZero: true,
                        max: 1200,
                        min: 800,
                        ticks: {
                            color: chartGridColor,
                            stepSize: 50
                        }
                    }
                }
            };
            pressureChart.update();
            windChart.options = {
                plugins: {
                    legend: {
                        labels: {
                            color: chartGridColor
                        }
                    }
                },
                maintainAspectRatio: false,
                animation: false,
                scales: {
                    x: {
                        grid: {color: chartGridColor},
                        ticks: {color: chartGridColor}
                    },
                    y: {
                        grid: {color: chartGridColor},
                        beginAtZero: true,
                        ticks: {
                            color: chartGridColor,
                        }
                    }
                }
            };
            windChart.update();
        };

    });
    marker.on('dragend', () => {
        map.flyTo({
            zoom: 15,
            bearing: 0,
            center: [
                marker.getLngLat().lng,
                marker.getLngLat().lat
            ],
            essential: true
        });
        getOpenWeatherData(marker.getLngLat().lng, marker.getLngLat().lat);
    });

    /*----------------------------------
    OPEN WEATHER API LOGIC
    ----------------------------------*/
//-- Purpose: Fills the current weather & 5 day weather forecast. Also creates reading charts. --//
    let getOpenWeatherData = function(longitude, latitude) {
        $.ajax({
            url: OPEN_WEATHER_MAP_WEATHER_URL,
            type: 'GET',
            data: {
                lat:    latitude,
                lon:    longitude,
                appid:  OPEN_WEATHER_API_KEY,
                units: 'imperial'
            }
        }).done(function(data) {
            let city = $('#current-weather');
            let date = formatDate(getDateTime(data.dt, data.timezone));
            let time = formatTime(getDateTime(data.dt, data.timezone));
            let sunrise = formatTime(getDateTime(data.sys.sunrise, data.timezone));
            let sunset = formatTime(getDateTime(data.sys.sunset, data.timezone));
            city.find('#date-time').text(`${date}, ${time}`);
            city.find('#city-country').text(`${data.name}, ${data.sys.country}`);
            city.find('#current-temp').text(`${data.main.temp.toPrecision(2)}${DEGREE}F`);
            city.find('#feels-like').text(`${data.main.feels_like.toPrecision(2)}${DEGREE}F`);
            city.find('img').attr('src',`http://openweathermap.org/img/wn/${data.weather[0].icon}.png`);
            city.find('#clouds-description').text(`${capitalizeFirstLetter(data.weather[0].description)}`);
            city.find('#wind-speed').text(`Wind: ${data.wind.speed} mph`);
            city.find('#humidity').text(`Humidity: ${data.main.humidity} %`);
            city.find('#visibility').text(`Visibility: ${(data.visibility/1000).toFixed(1)} km`);
            city.find('#pressure').text(`Pressure: ${data.main.pressure} hPa`);
            city.find('#sunrise').text(`Sunrise: ${sunrise}`);
            city.find('#sunset').text(`Sunset: ${sunset}`);
        });
        $.ajax({
            url: OPEN_WEATHER_MAP_FORECAST_URL,
            type: 'GET',
            data: {
                lat:    latitude,
                lon:    longitude,
                appid:  OPEN_WEATHER_API_KEY,
                units: 'imperial'
            }
        }).done(data => {
            let forecast = data.list.filter((element, index) => index % 8 === 0);
            let days = [];
            let humidity = [];
            let pressure = [];
            let wind_speed = [];

            forecast.forEach(function(element) {
                const date_time = new Date(element.dt_txt.split(' ').join('T'));
                days.push(getWeekday(date_time));
                humidity.push(element.main.humidity);
                pressure.push(element.main.pressure);
                wind_speed.push(element.wind.speed);
            });

            humidityChart.data.labels = days;
            humidityChart.data.datasets = [{
                label: 'Humidity',
                data: humidity,
                backgroundColor: 'rgba(0, 128, 128, 0.5)',
                borderColor: 'rgba(0, 128, 128, 1)',
                borderWidth: 1,
                fill: true
            }];
            humidityChart.update();

            pressureChart.data.labels = days;
            pressureChart.data.datasets = [{
                label: 'Pressure',
                data: pressure,
                backgroundColor: 'rgba(250, 128, 114, 0.5)',
                borderColor: 'rgba(250, 128, 114, 1)',
                borderWidth: 1
            }];
            pressureChart.update();

            windChart.data.labels = days;
            windChart.data.datasets = [{
                label: 'Wind speed',
                data: wind_speed,
                backgroundColor: 'rgba(0, 128, 128, 0.5)',
                borderColor: 'rgba(0, 128, 128, 1)',
                borderWidth: 1,
                fill: true
            }];
            windChart.update();

            $('.forecast').each(function(index) {
                $(this).find('h4').text(`${days[index]}`);
                $(this).find('img').attr('src',`http://openweathermap.org/img/wn/${forecast[index].weather[0].icon}.png`);
                $(this).find('h1').text(`${forecast[index].main.temp.toPrecision(2)}${DEGREE}F`);
                $(this).find('small').text(`${forecast[index].main.feels_like.toPrecision(2)}${DEGREE}F`);
                $(this).find('p').text(`${capitalizeFirstLetter(forecast[index].weather[0].description)}`);
            });
        })
    }

    /*----------------------------------
    NEWS API LOGIC
    ----------------------------------*/
//-- Purpose: Fills the 3 news cards with current weather news stories. --//
    let createUrl = (search, date, sortBy, key) => { return `https://newsapi.org/v2/everything?q=${search}&from=${date}&sortBy=${sortBy}&apiKey=${key}`; }
    let url = createUrl('Weather', '2022-02-02', 'relevancy', NEWS_API_KEY);
    function fetchNews() { return fetch(new Request(url)).then(res => res.json()).then(data => data); }

    /*----------------------------------
    GLOBAL FUNCTION CALLS
    ----------------------------------*/
    getOpenWeatherData(STARTING_MAPBOX_COORD[0], STARTING_MAPBOX_COORD[1]);
    fetchNews().then(function(data) {
        let articles = data.articles;

        $('.news-card').each(function(index){
            $(this).find('img').attr('src', `${articles[index].urlToImage}`);
            $(this).find('p').html(`${articles[index].title}`);
            $(this).find('small').html(`${formatDate(new Date(articles[index].publishedAt.slice(0, -1)))}`);
            $(this).find('a').attr('href', `${articles[index].url}`);
        });
    });
})();