<?php

if (isset($_POST['apikey'])) {
    $apiKey = $_POST['apikey'];

} else {
    header(header: "Location: ask-api.php");
    exit();
}

$url = "http://marticliment.com/unigetui/statistics/report";

$options = [
    "http" => [
        "header" => "apiKey: $apiKey\r\n"
    ]
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);

if ($response === FALSE) {
    echo "<p>An error has occurred while reading the API endpoint</p>";
    echo '<div class="text-center my-8"></div>
        <button onclick="clearApiKey()" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            CLEAR API KEY
        </button>
    </div>

    <script>
        function clearApiKey() {
            localStorage.removeItem(\'API_KEY\');
            location.href = "./analyzer.php"
        }
    </script>';
    die();
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Visualization</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .chart-container {
            width: 80%;
            margin: auto;
            text-align: center;
        }
        canvas {
            max-width: 100%;
            max-height: calc(100vh - 100px); 
            max-width: calc(100vw - 60px);
            cursor: pointer;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>

<body class="bg-gray-900 text-gray-100"></body>
    <h1 class="text-4xl font-bold text-center my-8">UniGetUI statistics report</h1>
    <p class="text-lg text-center">Click any chart to enlarge it.</p>
    <button onclick="clearApiKey()" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded fixed top-4 right-4">
            Log out
    </button>
    
    <br>
    <div class="chart-container bg-gray-800 shadow-md rounded-lg p-6 mb-8">
        <div class="text-center">
            <span class="text-2xl font-semibold mb-4 text-center">Active user count: </span>
            <span id="activeUserCount" class="text-6xl text-green-400 font-bold text-center"></span>
        </div>
    </div>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-1">
    
        <div class="chart-container bg-gray-800 shadow-md rounded-lg p-6 mb-8 relative" id="languagesChartContainer" onclick="toggleFullscreen('languagesChartContainer')">
            <h2 class="text-2xl font-semibold mb-4">UI Language Share</h2>
            <canvas id="languagesChart"></canvas>
        </div>
        <div class="chart-container bg-gray-800 shadow-md rounded-lg p-6 mb-8 relative" id="versionsChartContainer" onclick="toggleFullscreen('versionsChartContainer')">
            <h2 class="text-2xl font-semibold mb-4">Version Share</h2>
            <canvas id="versionsChart"></canvas>
        </div>
        <div class="chart-container bg-gray-800 shadow-md rounded-lg p-6 mb-8 relative" id="managersChartContainer" onclick="toggleFullscreen('managersChartContainer')">
            <h2 class="text-2xl font-semibold mb-4">Package Managers</h2>
            <canvas id="managersChart"></canvas>
        </div>
        <div class="chart-container bg-gray-800 shadow-md rounded-lg p-6 mb-8 relative" id="settingsChartContainer" onclick="toggleFullscreen('settingsChartContainer')">
            <h2 class="text-2xl font-semibold mb-4">Enabled Settings</h2>
            <canvas id="settingsChart"></canvas>
        </div>
    </div>
    <div class="chart-container bg-gray-800 shadow-md rounded-lg p-6 mb-8">
        <h2 class="text-2xl font-semibold mb-4">Package install ranking</h2>
        <ul id="programRanking" class="list-disc list-inside text-left"></ul>
    </div>

    <script>
        function clearApiKey() {
            localStorage.removeItem('API_KEY');
            location.href = "./analyzer.php"
        }
    </script>
</body>

<script>

        function toggleFullscreen(chartId) {
            const chartElement = document.getElementById(chartId);
            if (!document.fullscreenElement) {
                if (chartElement.requestFullscreen) {
                    chartElement.requestFullscreen();
                } else if (chartElement.mozRequestFullScreen) { // Firefox
                    chartElement.mozRequestFullScreen();
                } else if (chartElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
                    chartElement.webkitRequestFullscreen();
                } else if (chartElement.msRequestFullscreen) { // IE/Edge
                    chartElement.msRequestFullscreen();
                }
            }/* else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) { // Firefox
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) { // IE/Edge
                    document.msExitFullscreen();
                }
            }*/
        }

        function generateColors(numColors) {
            const colors = [];
            for (let i = 0; i < numColors; i++) {
                const hue = (i * 360 / numColors) % 360; // Distribute hues evenly
                const saturation = 70; // Fixed saturation
                const lightness = 50; // Fixed lightness
                const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                colors.push(color);
            }
            return colors;
        }

        
        const languageMap = {
            "default": "System language",
            "ar": "Arabic",
            "bg": "Bulgarian",
            "bn": "Bangla",
            "ca": "Catalan",
            "cs": "Czech",
            "da": "Danish",
            "de": "German",
            "el": "Greek",
            "et": "Estonian",
            "en": "English",
            "en-CA": "English (CA)",
            "es": "Spanish",
            "fa": "Persian",
            "fi": "Finnish",
            "fr": "French",
            "fr-CA": "French (CA)",
            "gu": "Gujarati",
            "hi": "Hindi",
            "hr": "Croatian",
            "he": "Hebrew",
            "hu": "Hungarian",
            "it": "Italian",
            "id": "Indonesian",
            "ja": "Japanese",
            "kn": "Kannada",
            "ko": "Korean",
            "lt": "Lithuanian",
            "mk": "Macedonian",
            "nb": "Norw. bokmål",
            "nn": "Norw. nynorsk",
            "nl": "Dutch",
            "pl": "Polish",
            "pt_BR": "Portuguese (BR)",
            "pt_PT": "Portuguese (PT)",
            "ro": "Romanian",
            "ru": "Russian",
            "sa": "Sanskrit",
            "sk": "Slovak",
            "sr": "Serbian",
            "sq": "Albanian",
            "si": "Sinhala",
            "sl": "Slovene",
            "sv": "Swedish",
            "tg": "Tagalog",
            "th": "Thai",
            "tr": "Turkish",
            "ua": "Ukrainian",
            "ur": "Urdu",
            "vi": "Vietnamese",
            "zh_CN": "Chinese (CN)",
            "zh_TW": "Chinese (TW)"
        }

        const jsonData = <?php echo $response; ?>;

        let userCount = document.getElementById("activeUserCount");
        userCount.innerHTML = jsonData.active_users;

        const sortedLanguages = Object.entries(jsonData.active_languages).sort((a, b) => b[1] - a[1]);
        const languageLabels = sortedLanguages.map(([id]) => languageMap[id] || id);
        const languageData = sortedLanguages.map(([, value]) => value);
        createChart(
            "languagesChart", 
            languageLabels, 
            languageData, 
            "Percentage of Users", 
            'doughnut', 
            generateColors(languageLabels.length)
        );

        let colors = generateColors(10)

        
        createChart("versionsChart", Object.keys(jsonData.active_versions), Object.values(jsonData.active_versions), "Active version share", 'pie', colors);
        

        const managers = [
                "WinGet", 
                "Scoop", 
                "Chocolatey", 
                "NPM", 
                "Pip", 
                "Cargo", 
                "vcpkg", 
                ".NET Tool",
                "PowerShell5",
                "PowerShell7",
        ];
        new Chart(document.getElementById("managersChart"), {
            type: "bar",
            data: {
                labels: managers,
                datasets: [{
                    label: "Enabled",
                    data: jsonData.active_managers.filter((_, index) => index % 2 === 0),
                    backgroundColor: 'rgb(122, 122, 122, 100%)'
                }, 
                {
                    label: "Enabled and Found",
                    data: jsonData.active_managers.filter((_, index) => index % 2 === 1),
                    backgroundColor: 'rgb(0, 255, 127, 100%)'
                }]
            },
            options: { 
                responsive: true,
                plugins: {
                    legend: {
                        onClick: null,
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: 'white'
                        }
                    },
                    y: {
                        ticks: {
                            color: 'white'
                        }
                    }
                },
                plugins: {
                    legend: {
                        onClick: null,
                        labels: {
                            color: 'white'
                        }
                    }
                }
            }
        });
        
        createChart(
            "settingsChart", 
            [
                "Self Update",
                "Self Update (PreRelease)",
                "System Tray",
                "Notifications",
                "Check for package updates",
                "Automatically update packages",
                "Delete desktop shortcuts",
                "Backup installed packages",
                "Cache UAC",
                "Cache UAC (Batch only)",
                "Force Legacy WinGet",
                "System Chocolatey",
                "Portable install",
                "Launched at startup"
            ], 
            jsonData.active_settings, 
            "Current data", 
            'bar', 
            colors,
            {
                scales: {
                    x: {
                        ticks: {
                            color: 'white'
                        }
                    },
                    y: {
                        ticks: {
                            color: 'white'
                        }
                    }
                },
            
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                let value = tooltipItem.raw;
                                let total = tooltipItem.dataset.data.reduce((acc, val) => acc + val, 0);
                                let percent = ((value / total) * 100).toFixed(2);
                                return `${tooltipItem.label}: ${percent}%`;
                            }
                        }
                    },
                    legend: {
                        onClick: null,
                        labels: {
                            color: 'white'
                        }
                    }
                }
            }
        );

        const rankingList = document.getElementById("programRanking");
        jsonData.program_ranking.forEach(item => {
            const li = document.createElement("li");
            li.textContent = `${item[0]} - ${item[1]} (${item[2]}) - Rank: ${item[3]}`;
            rankingList.appendChild(li);
        });
        
        function createChart(chartId, labels, data, label, type = 'bar', colors = [], options = {}) {
            new Chart(document.getElementById(chartId), {
                type: type,
                data: {
                    labels: labels,
                    datasets: [{
                        label: label,
                        data: data,
                        backgroundColor: colors,
                        borderWidth: 1
                    }]
                },
                options: { 
                    responsive: true, 
                    ...options,
                    plugins: {
                        legend: {
                            onClick: null,
                            labels: {
                                color: 'white'
                            }
                        }
                    }
                }
            });
        }
        
        

    </script>
</body>
</html>
