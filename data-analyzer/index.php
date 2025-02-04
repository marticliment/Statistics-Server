<?php
require_once 'login_helper.php';

$response = do_login_and_get_response();

$randomId = 0;

function begin_chart_zone($title)
{
    echo "
        <h1 class='text-4xl font-bold text-center my-8'>$title</h1>
        <div class='grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-1'>
    ";

}

function end_chart_zone()
{
    echo "</div>";
}

function chart_div($id, $title)
{
    echo "
    <div class='chart-container bg-gray-800 shadow-md rounded-lg p-6 mb-8 relative' id='".$id."Chart' onclick='toggleFullscreen(\"".$id."Chart\")'>
        <h2 class='text-xl mb-2'>$title</h2>
        <p class='text-l mb-2' style='display: none' id='".$id."CountBlock'><span>Total results: </span><span class='text-blue-400 font-bold' id='".$id."Count'></span></p>
        <canvas id='$id'></canvas>
    </div>";
}

function draw_pie($id, $json_id, $description)
{
    echo "
        <script>
            createChart('$id', 
                Object.keys(jsonData.$json_id), 
                Object.values(jsonData.$json_id), 
                '$description', 'pie', generateColors(Object.keys(jsonData.$json_id).length));
            
            document.getElementById('".$id."Count').innerText = Object.values(jsonData.$json_id).length.toString();
            document.getElementById('".$id."CountBlock').style.display = 'block';
        </script>
    ";
}

function ranking($title, $id, $jsonId)
{
    global $randomId;
    $randomId++;

    echo "
    <div class='chart-container bg-gray-800 shadow-md rounded-lg p-6 mb-8'>
        <h2 class='text-2xl font-semibold mb-4'>$title</h2>
        <ul id='$id' class='list-disc list-inside text-left'></ul>
    </div>

    <script>
    function generate$randomId()
    {
        let rankDiv = document.getElementById('$id');
        jsonData.$jsonId.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `\${item[0]} - \${item[1]}: \${item[2]} (\${item[3]} hits)`;
            rankDiv.appendChild(li);
        });
    }
    generate$randomId();
    </script>
    ";
}

function draw_pie_operation($id1, $id2, $json_id, $description, $description2)
{   
    global $randomId;
    $randomId++;

    echo "
        <script>
        function generate$randomId()
        {
            let combinedData = {};
            Object.keys(jsonData.$json_id).forEach(key => {
                const label1 = key.split('_')[0];
                if (!combinedData[label1]) combinedData[label1] = 0;
                combinedData[label1] += jsonData.".$json_id."[key];
            });
            const labels = Object.keys(combinedData);
            const data = Object.values(combinedData);
            createChart('$id1', labels, data, '$description', 'pie', generateColors(labels.length));

            combinedData = {};
            Object.keys(jsonData.$json_id).forEach(key => {
                const label2 = key.split('_')[1];
                if (!combinedData[label2]) combinedData[label2] = 0;
                combinedData[label2] += jsonData.".$json_id."[key];
            });

            const labels2 = Object.keys(combinedData);
            const data2 = Object.values(combinedData);
            createChart('$id2', labels2, data2, '$description2', 'pie', generateColors(labels2.length));
            
            document.getElementById('".$id1."Count').innerText = Object.values(jsonData.$json_id).length.toString();
            document.getElementById('".$id2."Count').innerText = Object.values(jsonData.$json_id).length.toString();
            document.getElementById('".$id1."CountBlock').style.display = 'block';
            document.getElementById('".$id2."CountBlock').style.display = 'block';
        }
        generate$randomId();
        </script>
    ";
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
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>

<body class="bg-gray-900 text-gray-100"></body>
    <h1 class="text-4xl font-bold text-center my-8">UniGetUI statistics report</h1>
    <p class="text-lg text-center">Click any chart to enlarge it.</p>
    <button onclick="clearApiKey()" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded fixed top-4 right-4">&nbsp;Log out&nbsp;</button>
    <button onclick="location.href = location.href;" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded fixed top-4 right-32">&nbsp;Refresh&nbsp;</button>
    
    <br>
    <div class="chart-container bg-gray-800 shadow-md rounded-lg p-6 mb-8">
        <div class="text-center">
            <span class="text-2xl font-semibold mb-4 text-center">Active user count: </span>
            <span id="activeUserCount" class="text-6xl text-green-400 font-bold text-center"></span>
            <span class="text-1xl font-semibold mb-4 text-center">Average last connection time (in days): </span>
            <span id="userCountLastPingAvg" class="text-3xl text-blue-400 font-bold text-center"></span>
        </div>
    </div>
    </div>
    
<?php 
begin_chart_zone("General statistics");    
chart_div("languagesChart", "UI Language share");
chart_div("versionsChart", "Version Share");
chart_div("managersChart", "Package Managers");
chart_div("settingsChart", "Enabled Settings");

draw_pie("versionsChart", "active_versions", "Amount of clients running this version");
end_chart_zone();

// ----------------------------------------------

begin_chart_zone(title: "Installed and downloaded packages");
chart_div("installed_successFailure", "Install operations success ratio");
chart_div("installed_byManager", "Installs per Package Manager");
chart_div("downloaded_successFailure", "Download operations success ratio");
chart_div("downloaded_byManager", "Downloads per Package Manager");
chart_div("installDownload_referral", "Package discovering referral");

draw_pie_operation("installed_byManager", "installed_successFailure", "install_count", "", "");
draw_pie_operation("downloaded_byManager", "downloaded_successFailure", "download_count", "", "");
draw_pie("installDownload_referral", "install_reason", "");
end_chart_zone();

// ----------------------------------------------

begin_chart_zone(title: "Package updates");
chart_div("updated_successFailure", "Update success ratio");
chart_div("updated_byManager", "Updates per Package Manager");

draw_pie_operation("updated_byManager", "updated_successFailure", "update_count", "", "");
end_chart_zone();

// ----------------------------------------------

begin_chart_zone(title: "Package uninstalls");
chart_div("uninstalls_successFailure", "Uninstall success ratio");
chart_div("uninstalls_byManager", "Uninstalls per Package Manager");

draw_pie_operation("uninstalls_byManager", "uninstalls_successFailure", "uninstall_count", "", "");
end_chart_zone();

// ----------------------------------------------

begin_chart_zone(title: "Shared packages & Package Details");
chart_div("SharedPackages", "Shared packages URI source");
chart_div("PackageDetails_Source", "Shown package details origin");
draw_pie("SharedPackages", "shared_packages", "");
draw_pie("PackageDetails_Source", "shown_package_details", "");
end_chart_zone();

// ----------------------------------------------

begin_chart_zone("Package bundles");
chart_div("importedBundles", "Imported bundles");
chart_div("exportedBundles", "Exported bundles");

draw_pie("importedBundles", "imported_bundles", "Imported bundles of type");
draw_pie("exportedBundles", "exported_bundles", "Exported bundles of type");
end_chart_zone();

ranking("Popular packages", "popularRanking", "popular_ranking");
ranking("Installed packages", "installedRanking", "installed_ranking");
ranking("Wall of shame (uninstalled ranking)", "wallOfShameRanking", "uninstalled_ranking");


// ----------------------------------------------

?>
    <script>
        function clearApiKey() {
            localStorage.removeItem('API_KEY');
            location.href = location.href;
        }
    </script>
</body>

<script>

        let userCount = document.getElementById("activeUserCount");
        userCount.innerHTML = jsonData.active_users;

        let connectAvg = document.getElementById("userCountLastPingAvg");
        connectAvg.innerHTML = (jsonData.avg_last_ping_timeDelta / (3600 * 24)).toFixed(2);

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

        let colors = generateColors(14)        

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
    </script>
</body>
</html>
