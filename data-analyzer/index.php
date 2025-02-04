<?php
function do_login_and_get_response()
{
    if (!isset($_POST['apikey'])) {
        echo "
        <script>
            document.addEventListener('DOMContentLoaded', function() {
            const form = document.querySelector('form');
            const input = document.getElementById('API_KEY');

            // Check if X is already in localStorage
            if (localStorage.getItem('API_KEY')) {
                const Xvalue = localStorage.getItem('API_KEY');
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = location.href;

                const hiddenField = document.createElement('input');
                hiddenField.type = 'hidden';
                hiddenField.name = 'apikey';
                hiddenField.value = Xvalue;

                form.appendChild(hiddenField);
                document.body.appendChild(form);
                form.submit();
                document.body.style.display = 'none';
            }

            form.addEventListener('submit', function(event) {
                event.preventDefault();
                const Xvalue = input.value;
                localStorage.setItem('API_KEY', Xvalue);
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = location.href;

                const hiddenField = document.createElement('input');
                hiddenField.type = 'hidden';
                hiddenField.name = 'apikey';
                hiddenField.value = Xvalue;

                form.appendChild(hiddenField);
                document.body.appendChild(form);
                form.submit();
            });
        });
        </script>

        <!DOCTYPE html>
        <html lang='en' class='dark'></html>
            <head>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                <title>API Key required - Statistics</title>
                <link href='https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css' rel='stylesheet'>
            </head>
            <body class='bg-gray-900 text-gray-100 flex items-center justify-center min-h-screen'>
                <form method='post' action='".$_SERVER['PHP_SELF']."' class='bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-sm'>
                    <label for='API_KEY' class='block text-sm font-medium text-gray-300 mb-2'>Enter the API KEY:</label>
                    <input type='password' id='API_KEY' name='API_KEY' required class='block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-gray-100'>
                    <button type='submit' id='sendkeybutton' class='mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>Log in</button>
                </form>
            </body>
        </html>
        ";
        die();

    } else {
        $apiKey = $_POST['apikey'];
    }

    // $url = "http://marticliment.com/unigetui/statistics/report";
    $url = "http://localhost:3000/report";

    $options = [
        "http" => [
            "header" => "apiKey: $apiKey\r\n"
        ]
    ];

    error_reporting(0);
    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
    $error = "";
    if ($response === FALSE) {
        $error .= "An error has occurred while reading the endpoint";
        echo '
        <!DOCTYPE html>
        <html lang="en" class="dark"></html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>API Key required - Statistics</title>
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            </head>
            <body class="bg-gray-900 text-gray-100 flex items-center justify-center min-h-screen">
                <form method="post" action="".$_SERVER["PHP_SELF"]."" class="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-sm">
                    <label for="API_KEY" class="block text-sm font-medium text-gray-300 mb-2">'.$error.'. Check the API key and try again later<br>&nbsp;</label>
                    <button onclick="clearApiKey()" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md w-full ">
                        CLEAR API KEY
                    </button>
                </form>
            </body>
        </html>
        
        <div class="text-center my-8"></div>
        </div>

        <script>
            function clearApiKey() {
                localStorage.removeItem(\'API_KEY\');
                location.href = location.href;
            }
        </script>';
        die();
    }
    return $response;
}


$response = do_login_and_get_response();

$randomId = 0;

function begin_chart_zone($title)
{
    echo /*html*/"
        <h1 class='text-4xl font-bold text-center my-8'>$title</h1>
        <div class='grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-4 gap-1'>
    ";

}

function end_chart_zone()
{
    echo /*html*/"</div>";
}

function chart_div($id, $title, $padding=2, $margin=4, $bg = "bg-gray-800 shadow-md", $style = "")
{
    echo /*html*/"
    <div class='chart-container $bg rounded-2xl p-$padding mb-$margin relative' id='".$id."Chart' onclick='toggleFullscreen(\"".$id."Chart\")' style='height: 100%;'>
        <h2 class='text-xl mb-2'>$title</h2>
        <p class='text-l mb-2' style='display: none' id='".$id."CountBlock'><span>Total results: </span><span class='text-blue-400 font-bold' id='".$id."Count'></span></p>
        <div style='$style; display: flex; flex-direction: column; align-items: center;'><canvas id='$id'></canvas></div>
    </div>";
}

function draw_pie($id, $json_id, $description)
{
    echo /*html*/"
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

    echo /*html*/"
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
function draw_pie_operation($id1, $id2, $id3, $json_id, $description, $description2)
{   
    global $randomId;
    $randomId++;

    echo /*html*/"
        <script>
        function generate$randomId()
        {
            let data_perManager = {};
            let data_perResult = {};
            let data_success = {};
            let data_failure = {};
            
            const SIZE = Object.values(jsonData.$json_id).length;

            Object.keys(jsonData.$json_id).forEach(key => {
                const MANAGER = key.split('_')[0];
                const RESULT = key.split('_')[1];
                if (!data_perManager[MANAGER]) data_perManager[MANAGER] = 0;
                if (!data_perResult[RESULT]) data_perResult[RESULT] = 0;
                if (!data_success[MANAGER]) data_success[MANAGER] = 0;
                if (!data_failure[MANAGER]) data_failure[MANAGER] = 0;
                const val = jsonData.".$json_id."[key];
                data_perManager[MANAGER] += val;
                data_perResult[RESULT] += val;
                if(RESULT == 'SUCCESS') data_success[MANAGER] += val;
                else data_failure[MANAGER] += val;
            });

            const labels1 = Object.keys(data_perManager);
            const data1 = Object.values(data_perManager);
            createChart('$id1', labels1, data1, '$description', 'pie', generateColors(labels1.length));

            const labels2 = Object.keys(data_perResult);
            const data2 = Object.values(data_perResult);
            createChart('$id2', labels2, data2, '$description2', 'pie', generateColors(labels2.length));
            
            document.getElementById('".$id1."Count').innerText = SIZE;
            document.getElementById('".$id2."Count').innerText = SIZE;
            document.getElementById('".$id1."CountBlock').style.display = 'block';
            document.getElementById('".$id2."CountBlock').style.display = 'block';

            
            const labels3 = Object.keys(data_success);
            const data3_1 = Object.values(data_success);
            const data3_2 = Object.values(data_failure);

            for (let i = 0; i < data3_1.length; i++) {
                let total = data3_1[i] + data3_2[i];
                data3_1[i] = data3_1[i]/total*100;
                data3_2[i] = data3_2[i]/total*100;
            }

            new Chart(document.getElementById('$id3'), {
                type: 'bar',
                data: {
                    labels: labels3,
                    datasets: [{
                        label: 'SUCCEEDED',
                        data: data3_1,
                        backgroundColor: 'rgb(64, 255, 64, 100%)'
                    }, 
                    {
                        label: 'FAILED',
                        data: data3_2,
                        backgroundColor: 'rgb(255, 64, 64, 100%)'
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
                            stacked: true,
                            ticks: { color: 'white' }
                        },
                        y: {
                            stacked: true,
                            ticks: { color: 'white' }
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
        }
        generate$randomId();
        </script>
    ";
}


function operations_region($opName, $jsonId, $title)
{
    global $randomId;

    $id1 = "div$randomId"; $randomId++;
    $id2 = "div$randomId"; $randomId++;
    $id3 = "div$randomId"; $randomId++;

    echo /*html*/"
        <div style='width: calc(100% - 80px); margin-left: 40px;'>
            <h1 class='text-2xl font-bold text-center my-8'>$title</h1>
            <div class='bg-gray-800 p-4 mb-6 rounded-2xl shadow-md' 
                style='display: flex; flex-direction: row; align-items: center; gap: 6px; height: 400px; position: relative'>
    ";

    chart_div($id1, "$opName success rate", 0, 0, "", "height: calc(100% - 100px)");
    $randomId++;
    chart_div($id2, "$opName distribution per Package Manager", 0, 0, "", "height: calc(100% - 100px)");
    $randomId++;
    chart_div($id3, "$opName success rate per Package Manager", 0, 0, "", "height: calc(100% - 100px)");
    $randomId++;

    draw_pie_operation($id2, $id1, $id3, $jsonId, "", "");

    echo "</div></div>";
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
                const hue = (30 + (i * 360 / numColors)) % 360; // Distribute hues evenly
                const saturation = 100; // Fixed saturation
                const lightness = 56; // Fixed lightness
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
chart_div("installDownload_referral", "Package discovering referral");
chart_div("operation_types", "Operation types");


draw_pie("versionsChart", "active_versions", "Amount of clients running this version");
draw_pie("installDownload_referral", "install_reason", "");
end_chart_zone();

// ----------------------------------------------


operations_region("Install", "install_count", "Install operations");
operations_region("Download", "download_count", "Download operations");
operations_region("Update", "update_count", "Update operations");
operations_region("Uninstall", "uninstall_count", "Uninstall operations");


begin_chart_zone(title: "Installed and downloaded packages");
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

?> <br><br><br> <?php

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

        const operationTypes = {
            "Download": jsonData.download_count,
            "Install": jsonData.install_count,
            "Update": jsonData.update_count,
            "Uninstall": jsonData.uninstall_count
        };

        const operationLabels = Object.keys(operationTypes);
        const operationData = Object.values(operationTypes).map(values => Object.values(values).reduce((a, b) => a + b, 0));

        createChart(
            "operation_types",
            operationLabels,
            operationData,
            "Count",
            "pie",
            generateColors(operationLabels.length)
        );

        createChart("operation_types", [], [], "", "pie");
    </script>
</body>
</html>
