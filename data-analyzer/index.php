<?php
function do_login_and_get_response()
{
    if (isset($_GET['ask_api_key'])) {
        echo "
        <script>
            document.addEventListener('DOMContentLoaded', function() {
            const form = document.querySelector('form');
            const input = document.getElementById('API_KEY');

            form.addEventListener('submit', function(event) {
                event.preventDefault();
                const Xvalue = input.value;
                localStorage.setItem('API_KEY', Xvalue);
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = location.href.replace('?ask_api_key=true', '');

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
                <form method='post' action='" . $_SERVER['PHP_SELF'] . "' class='bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-sm'>
                    <label for='API_KEY' class='block text-sm font-medium text-gray-300 mb-2'>Enter the API KEY:</label>
                    <input type='password' id='API_KEY' name='API_KEY' required class='block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-gray-100'>
                    <button type='submit' id='sendkeybutton' class='mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>Log in</button>
                </form>
            </body>
        </html>
        ";
        die();
    }
    else if (isset($_GET["post_apikey"]))
    {
        echo /*html*/"
        <html>
        <body>
        <form id='form' style='visibility: hidden'></form>
        <script>
            const Xvalue = localStorage.getItem('API_KEY');
            const form = document.getElementById('form');
            form.method = 'POST';
            form.action = location.href.replace('?post_apikey=true', '');

            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.name = 'apikey';
            hiddenField.value = Xvalue;

            form.appendChild(hiddenField);
            document.body.appendChild(form);
            document.body.style.display = 'none';
            form.submit();
        </script>
        </body>
        </html>
        ";
        die();
    }
    else if (!isset($_POST['apikey']))
    {
        header("Location: " . $_SERVER['PHP_SELF'] . "?post_apikey=true");
        exit();
    } 
    else 
    {
        $apiKey = $_POST['apikey'];
    }

    $url = "http://marticliment.com/unigetui/statistics/report";
    // $url = "http://localhost:3000/report";

    $options = [
        "http" => [
            "header" => "apiKey: $apiKey\r\n"
        ]
    ];

    error_reporting(0);
    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
    // $response = "false";
    $error = "";
    if ($response === FALSE) {
        return "false";
    }
    return $response;
}


$response = do_login_and_get_response();

$randomId = 0;

$generators = [];

function begin_chart_zone($title)
{
    echo /*html*/ "
        <h1 class='text-4xl font-bold text-center my-8'>$title</h1>
        <div class='widgetPanel'>
    ";

}

function end_chart_zone()
{
    echo /*html*/ "</div>";
}

function chart_div($id, $title, $class = "chartDiv")
{
    echo /*html*/ "
    <div class='$class' id='" . $id . "Chart'>
        <div id='" . $id . "ChartFS' class='fsBg'>
            <h2 class='text-xl mb-2 alignCenter'>$title</h2>
                <div class='flex justify-between items-center w-full mb-2 px-2'>
                    <button onclick='toggleTable(\"" . $id . "\")' class='bg-blue-900 hover:bg-blue-700 text-white font-bold py-1 px-1 rounded-md text-xs align-middle'>
                        <img src='./table.svg' alt='Fullscreen' class='w-6 h-6 p-0 align-middle'>
                    </button>
                    <p class='text-l alignCenter' style='display: none' id='" . $id . "CountBlock'><span>Analyzed samples: </span><span class='text-blue-400 font-bold' id='" . $id . "Count'></span></p>
                    <button onclick='toggleFullscreen(\"" . $id . "ChartFS\")' class='bg-blue-900 hover:bg-blue-700 text-white font-bold py-1 px-1 rounded-md text-xs align-middle'>
                        <img src='./fullscreen.svg' alt='Fullscreen' class='w-6 h-6 p-0 align-middle'>
                    </button>
                </div>
            <div style='width: 100%; height: 100%; position: relative' id='" . $id . "scrollable'>
                <canvas id='$id'></canvas>
                <table id='" . $id . "table' class='tableDiv' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: auto;'></table>
            </div>
        </div>
    </div>";
}

function draw_pie($id, $json_id, $description)
{
    global $randomId, $generators;
    echo /*html*/ "
        <script>
        function generate$randomId(jsonData)
        {
            let SIZE = 0;
            Object.values(jsonData.$json_id).forEach(element => {
                SIZE += element;
            });

            let sortedData = Object.entries(jsonData.$json_id).sort((a, b) => b[1] - a[1]).reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});

            createChart('$id', 
                Object.keys(sortedData), 
                Object.values(sortedData), 
                '$description', 'pie', generateColors(Object.keys(sortedData).length));
            
            document.getElementById('" . $id . "Count').innerText = SIZE;
            document.getElementById('" . $id . "CountBlock').style.display = 'block';

            let table = \"<table class='min-w-full bg-gray-800 text-gray-100'><thead><tr>\";
            table += \"<th class='py-2 px-4 border-b border-gray-700'>Key</th>\";
            table += \"<th class='py-2 px-4 border-b border-gray-700'>Value</th>\";
            table += \"</tr></thead><tbody>\";

            Object.entries(sortedData).forEach(([key, value]) => {
                table += \"<tr>\";
                table += `<td class='py-2 px-4 border-b border-gray-700'>\${key}</td>`;
                table += `<td class='py-2 px-4 border-b border-gray-700'>\${value}</td>`;
                table += \"</tr>\";
            });

            table += \"</tbody></table>\";
            document.getElementById('" . $id . "table').innerHTML = table;
            
        }
        </script>
    ";
    array_push($generators, "generate$randomId");
    $randomId++;
}
function ranking($title, $id, $jsonId)
{
    global $randomId, $generators;

    echo /*html*/ "
    <div class='chart-container bg-gray-800 shadow-md rounded-lg p-6 mb-8'>
        <h2 class='text-2xl font-semibold mb-4'>$title</h2>
        <ul id='$id' class='list-disc list-inside text-left'></ul>
    </div>

    <script>
    function generate$randomId(jsonData)
    {
        let rankDiv = document.getElementById('$id');
        jsonData.$jsonId.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `\${item[0]} - \${item[1]}: \${item[2]} (\${item[3]} hits)`;
            rankDiv.appendChild(li);
        });
    }
    </script>
    ";
    array_push($generators, "generate$randomId");
    $randomId++;
}
function draw_pie_operation($id1, $id2, $id3, $json_id, $description, $description2)
{
    global $randomId, $generators;

    echo /*html*/ "
        <script>
        function generate$randomId(jsonData)
        {
            let data_perManager = {
                'Winget': 0,
                'Chocolatey': 0,
                'Scoop': 0,
                'Npm': 0,
                'Pip': 0,
                'PowerShell': 0,
                'PowerShell7': 0,
                '.NET Tool': 0,
                'Cargo': 0,
                'vcpkg': 0,
            };
            let data_perResult = {SUCCESS: 0, FAILED: 0};
            let data_success = JSON.parse(JSON.stringify(data_perManager));
            let data_failure = JSON.parse(JSON.stringify(data_perManager));
            
            let SIZE = 0;
            Object.values(jsonData.$json_id).forEach(element => {
                SIZE += element;
            });;

            Object.keys(jsonData.$json_id).forEach(key => {
                const MANAGER = key.split('_')[0];
                const RESULT = key.split('_')[1];
                if (!data_perManager[MANAGER]) data_perManager[MANAGER] = 0;
                if (!data_perResult[RESULT]) data_perResult[RESULT] = 0;
                if (!data_success[MANAGER]) data_success[MANAGER] = 0;
                if (!data_failure[MANAGER]) data_failure[MANAGER] = 0;
                const val = jsonData." . $json_id . "[key];
                data_perManager[MANAGER] += val;
                data_perResult[RESULT] += val;
                if(RESULT == 'SUCCESS') data_success[MANAGER] += val;
                else data_failure[MANAGER] += val;
            });

            // PER MANAGER DISTRIBUTION
            data_perManager = Object.keys(data_perManager).sort((a, b) => data_perManager[b] - data_perManager[a]).reduce((acc, key) => {
                acc[key] = data_perManager[key];
                return acc;
            }, {});
            const labels1 = Object.keys(data_perManager);
            const data1 = Object.values(data_perManager);
            createChart('$id1', labels1, data1, '$description', 'pie', generateColors(labels1.length));

            // SUCCESS RATIO
            const labels2 = Object.keys(data_perResult);
            const data2 = Object.values(data_perResult);
            createChart('$id2', labels2, data2, '$description2', 'pie', ['rgb(32, 255, 32)', 'rgb(255, 32, 32)']);
            
            document.getElementById('" . $id1 . "Count').innerText = SIZE;
            document.getElementById('" . $id2 . "Count').innerText = SIZE;
            document.getElementById('" . $id1 . "CountBlock').style.display = 'block';
            document.getElementById('" . $id2 . "CountBlock').style.display = 'block';

            
            const labels3 = Object.keys(data_success);
            const data3_1 = Object.values(data_success);
            const data3_2 = Object.values(data_failure);

            for (let i = 0; i < data3_1.length; i++) {
                let total = data3_1[i] + data3_2[i];
                data3_1[i] = data3_1[i]/total*100;
                data3_2[i] = data3_2[i]/total*100;
            }

            let table = \"<table class='bg-gray-800 text-gray-100'><thead><tr>\";
            table += \"<th class='py-2 px-4 border-b border-gray-700'>Key</th>\";
            table += \"<th class='py-2 px-4 border-b border-gray-700'>Value</th>\";
            table += \"</tr></thead><tbody>\";

            Object.entries(data_perResult).forEach(([key, value]) => {
                table += \"<tr>\";
                table += `<td class='py-2 px-4 border-b border-gray-700'>\${key}</td>`;
                table += `<td class='py-2 px-4 border-b border-gray-700'>\${value}</td>`;
                table += \"</tr>\";
            });

            table += \"</tbody></table>\";
            document.getElementById('" . $id2 . "table').innerHTML = table;

            table = \"<table class='bg-gray-800 text-gray-100'><thead><tr>\";
            table += \"<th class='py-2 px-4 border-b border-gray-700'>Key</th>\";
            table += \"<th class='py-2 px-4 border-b border-gray-700'>Value</th>\";
            table += \"</tr></thead><tbody>\";

            Object.entries(data_perManager).forEach(([key, value]) => {
                table += \"<tr>\";
                table += `<td class='py-2 px-4 border-b border-gray-700'>\${key}</td>`;
                table += `<td class='py-2 px-4 border-b border-gray-700'>\${value}</td>`;
                table += \"</tr>\";
            });

            table += \"</tbody></table>\";
            document.getElementById('" . $id1 . "table').innerHTML = table;


            table = \"<table class='bg-gray-800 text-gray-100'><thead><tr>\";
            table += \"<th class='py-2 px-4 border-b border-gray-700'>Key</th>\";
            table += \"<th class='py-2 px-4 border-b border-gray-700'>Success</th>\";
            table += \"<th class='py-2 px-4 border-b border-gray-700'>Failure</th>\";
            table += \"</tr></thead><tbody>\";

            for(let i = 0; i < labels3.length; i++)
            {
                table += \"<tr>\";
                table += `<td class='py-2 px-4 border-b border-gray-700'>`+labels3[i]+`</td>`;
                table += `<td class='py-2 px-4 border-b border-gray-700'>`+data3_1[i].toFixed(1)+`%</td>`;
                table += `<td class='py-2 px-4 border-b border-gray-700'>`+data3_2[i].toFixed(1)+`%</td>`;
                table += \"</tr>\";
            };

            table += \"</tbody></table>\";
            document.getElementById('" . $id3 . "table').innerHTML = table;


            if(chartForCanvas['$id3'] != null) 
            {
                chartForCanvas['$id3'].clear();
                chartForCanvas['$id3'].destroy();
            }

            chartForCanvas['$id3'] = new Chart(document.getElementById('$id3'), {
                type: 'bar',
                data: {
                    labels: labels3,
                    datasets: [{
                        label: 'Success ratio',
                        data: data3_1,
                        backgroundColor: 'rgb(32, 255, 32)'
                    }, 
                    {
                        label: 'Failure ratio',
                        data: data3_2,
                        backgroundColor: 'rgb(255, 32, 32)'
                    }]
                },
                options: { 
                    responsive: true,
                    plugins: {
                        legend: {
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
                            labels: {
                                color: 'white'
                            }
                        }
                    }
                }
            });
        }
        </script>
    ";
    array_push($generators, "generate$randomId");
    $randomId++;
}


function operations_region($opName, $jsonId, $title)
{
    global $randomId;

    $id1 = "div$randomId";
    $randomId++;
    $id2 = "div$randomId";
    $randomId++;
    $id3 = "div$randomId";
    $randomId++;

    begin_chart_zone($title);

    chart_div($id1, "$opName success rate");
    $randomId++;
    chart_div($id2, $opName . "s per Package Manager");
    $randomId++;
    chart_div($id3, "$opName success rate per Package Manager (in %)", "chartDiv biggerChartDiv");
    $randomId++;

    draw_pie_operation($id2, $id1, $id3, $jsonId, "", "");

    end_chart_zone();
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
            /* max-width: 100%; */
            max-height: calc(100vh - 100px);
            max-width: calc(100vw - 60px);
        }

        .widgetPanel {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            align-items: center;
        }

        .chartDiv {
            width: min(350px, 100vw);
            background-color: #1f2937;
            border-radius: 16px;
            padding: 0px;
            margin: 8px;

            flex-flow: column;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .tableDiv {
            visibility: hidden;
        }

        .mediumChartDiv {
            width: min(500px, 100vw);
        }

        .biggerChartDiv {
            width: min(700px, 100vw);
        }

        .alignCenter {
            text-align: center;
        }

        .fsBg {
            background-color: #1f2937;
            border-radius: 12px;
            width: 100%;
            height: 100%;
            padding: 8px;
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
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) { // Firefox
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) { // IE/Edge
                    document.msExitFullscreen();
                }
            }
        }

        function toggleTable(id) {
            let chartDiv = document.getElementById(id);
            let tableDiv = document.getElementById(id + "table");
            let scrollDiv = document.getElementById(id + "scrollable")

            if (tableDiv.style.visibility == "visible") {
                chartDiv.style.visibility = "visible";
                tableDiv.style.visibility = "hidden";
                scrollDiv.style.overflow = "hidden";
            } else {
                chartDiv.style.visibility = "hidden";
                tableDiv.style.visibility = "visible";
                scrollDiv.style.overflow = "auto";
            }
        }

        function generateColors(numColors) {
            const colors = [];
            for (let i = 0; i < numColors; i++) {
                const hue = (30 + (i * 360 / numColors)) % 360; // Distribute hues evenly
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

        let chartForCanvas = {};

        function createChart(chartId, labels, data, label, type = 'bar', colors = [], options = {}) {
            if (chartForCanvas[chartId] != null) {
                chartForCanvas[chartId].clear();
                chartForCanvas[chartId].destroy();
            }

            chartForCanvas[chartId] = new Chart(document.getElementById(chartId), {
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
                            labels: {
                                color: 'white'
                            }
                        }
                    }
                }
            });
        }

        function reloadLiveButton()
        {
            location.href = location.href;
        }

        function clearApiKey()
        {
            // Check if X is already in localStorage
            if (localStorage.getItem('API_KEY')) {
                localStorage.clear();
                location.href = location.href;
            } else {
                location.href = location.href + "?ask_api_key=true"
            }
        }
    </script>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css" rel="stylesheet">
</head>

<body class="bg-gray-900 text-gray-100">
<h1 class="text-4xl font-bold text-center my-8 pt-10">UniGetUI statistics report</h1>
<p class="text-lg text-center">Click any chart to enlarge it.</p>

<div style="width: 100%; height: auto; position: fixed; top: 0px; left: 0px; display: flex; flex-direction: row; justify-content: space-between; z-index: 10;"
    class="bg-blue-900">
    <div style="padding: 0px">
        <button onclick="reloadLiveButton()" id="ReloadLiveButton"
            class="text-white font-semibold py-2 px-4 transition duration-100 mx-0">Reload live</button>
        <button onclick="document.getElementById('fileInput').click()"
            class="bg-blue-900 hover:bg-blue-700 text-white font-semibold py-2 px-4 transition duration-100 mx-0">From JSON</button>
        <button onclick="exportToJson()"
            class="bg-blue-900 hover:bg-blue-700 text-white font-semibold py-2 px-4 transition duration-100 mx-0">Export to JSON</button>
    </div>
    <div>
        <button onclick="clearApiKey()" id="ApiKeyButton"
            class="bg-blue-900 text-white font-semibold py-2 px-4 mx-0 transition duration-100">N/A</button>
    </div>
</div>
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
chart_div("languagesChart", "UI Language share", "chartDiv mediumChartDiv");
chart_div("versionsChart", "Version Share");
chart_div("managersChart", "Package Managers (in %)", "chartDiv biggerChartDiv");
chart_div("settingsChart", "Enabled Settings (in %)", "chartDiv biggerChartDiv");

chart_div("operation_types", "Performed operations");
chart_div("installDownload_referral", title: "INST+DWNLD package source");

draw_pie("versionsChart", "active_versions", "Amount of clients running this version");
draw_pie("installDownload_referral", "install_reason", "");
end_chart_zone();

// ----------------------------------------------


operations_region("Install", "install_count", "Install operations");
operations_region("Download", "download_count", "Download operations");
operations_region("Update", "update_count", "Update operations");
operations_region("Uninstall", "uninstall_count", "Uninstall operations");


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

?> <br><br><br>
<?php

ranking("Popular packages", "popularRanking", "popular_ranking");
ranking("Installed packages", "installedRanking", "installed_ranking");
ranking("Wall of shame (uninstalled ranking)", "wallOfShameRanking", "uninstalled_ranking");


// ----------------------------------------------

?>
</body>

<script>

    function generateCustom(jsonData) {
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
            'pie',
            generateColors(languageLabels.length)
        );

        let table = "<table class='bg-gray-800 text-gray-100'><thead><tr>";
        table += "<th class='py-2 px-4 border-b border-gray-700'>Key</th>";
        table += "<th class='py-2 px-4 border-b border-gray-700'>Success</th>";
        table += "</tr></thead><tbody>";

        for (let i = 0; i < languageLabels.length; i++) {
            table += "<tr>";
            table += `<td class='py-2 px-4 border-b border-gray-700'>` + languageLabels[i] + `</td>`;
            table += `<td class='py-2 px-4 border-b border-gray-700'>${languageData[i].toLocaleString()}</td>`;
            table += "</tr>";
        };

        table += "</tbody></table>";
        document.getElementById('languagesCharttable').innerHTML = table;



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

        const managers_data1 = jsonData.active_managers.filter((_, index) => index % 2 === 0);
        const managers_data2 = jsonData.active_managers.filter((_, index) => index % 2 === 1);

        if (chartForCanvas["managersChart"] != null) {
            chartForCanvas["managersChart"].clear();
            chartForCanvas["managersChart"].destroy();
        }
        chartForCanvas["managersChart"] = new Chart(document.getElementById("managersChart"), {
            type: "bar",
            data: {
                labels: managers,
                datasets: [{
                    label: "ENABLED",
                    data: managers_data1,
                    backgroundColor: 'rgb(122, 122, 122, 100%)'
                },
                {
                    label: "ENABLED & FOUND",
                    data: managers_data2,
                    backgroundColor: 'rgb(0, 255, 127, 100%)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
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
                        labels: {
                            color: 'white'
                        }
                    }
                }
            }
        });

        table = "<table class='bg-gray-800 text-gray-100'><thead><tr>";
        table += "<th class='py-2 px-4 border-b border-gray-700'>Manager</th>";
        table += "<th class='py-2 px-4 border-b border-gray-700'>Enabled</th>";
        table += "<th class='py-2 px-4 border-b border-gray-700'>Enabled & found</th>";
        table += "</tr></thead><tbody>";

        for (let i = 0; i < managers.length; i++) {
            table += "<tr>";
            table += `<td class='py-2 px-4 border-b border-gray-700'>` + managers[i] + `</td>`;
            table += `<td class='py-2 px-4 border-b border-gray-700'>${managers_data1[i].toFixed(1)}%</td>`;
            table += `<td class='py-2 px-4 border-b border-gray-700'>${managers_data2[i].toFixed(1)}%</td>`;
            table += "</tr>";
        };

        table += "</tbody></table>";
        document.getElementById('managersCharttable').innerHTML = table;

        const settingsNames = [
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
        ];
        createChart(
            "settingsChart",
            settingsNames,
            jsonData.active_settings,
            "% of users",
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
                            label: function (tooltipItem) {
                                let value = tooltipItem.raw;
                                let total = tooltipItem.dataset.data.reduce((acc, val) => acc + val, 0);
                                let percent = ((value / total) * 100).toFixed(2);
                                return `${tooltipItem.label}: ${percent}%`;
                            }
                        }
                    },
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                }
            }
        );

        table = "<table class='bg-gray-800 text-gray-100'><thead><tr>";
        table += "<th class='py-2 px-4 border-b border-gray-700'>Setting</th>";
        table += "<th class='py-2 px-4 border-b border-gray-700'>Enabled</th>";
        table += "</tr></thead><tbody>";

        for (let i = 0; i < settingsNames.length; i++) {
            table += "<tr>";
            table += `<td class='py-2 px-4 border-b border-gray-700'>` + settingsNames[i] + `</td>`;
            table += `<td class='py-2 px-4 border-b border-gray-700'>${jsonData.active_settings[i].toFixed(1)}%</td>`;
            table += "</tr>";
        };

        table += "</tbody></table>";
        document.getElementById('settingsCharttable').innerHTML = table;


        let operationTypes = {
            "Update": jsonData.update_count,
            "Install": jsonData.install_count,
            "Uninstall": jsonData.uninstall_count,
            "Download": jsonData.download_count,
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

        table = "<table class='bg-gray-800 text-gray-100'><thead><tr>";
        table += "<th class='py-2 px-4 border-b border-gray-700'>OperationType</th>";
        table += "<th class='py-2 px-4 border-b border-gray-700'>Count</th>";
        table += "</tr></thead><tbody>";

        for (let i = 0; i < operationLabels.length; i++) {
            table += "<tr>";
            table += `<td class='py-2 px-4 border-b border-gray-700'>` + operationLabels[i] + `</td>`;
            table += `<td class='py-2 px-4 border-b border-gray-700'>${operationData[i]}</td>`;
            table += "</tr>";
        };

        table += "</tbody></table>";
        document.getElementById('operation_typestable').innerHTML = table;


        let op_size = 0;
        operationData.forEach(element => {
            op_size += element;
        });

        document.getElementById('operation_typesCount').innerText = op_size;
        document.getElementById('operation_typesCountBlock').style.display = 'block';
    }
</script>

<input type="file" id="fileInput" style="display: none;" accept=".json" onchange="loadLocalFile(event)">

<script>

    function loadData(jsonData) {
        generateCustom(jsonData);
        <?php
        for ($i = 0; $i < sizeof($generators); $i++) {
            echo $generators[$i] . "(jsonData);";
        }
        ?>
    }


    let jsonData = <?php echo $response; ?>;
    let reload = document.getElementById("ReloadLiveButton")
    let login = document.getElementById("ApiKeyButton")
    
    if(localStorage.getItem('API_KEY'))
    {
        loadData(jsonData)
        reload.style.visibility = "visible";
        login.innerText = "Close API Key session";
        login.classList.add("hover:bg-red-700");
        reload.classList.add("hover:bg-blue-700");
        reload.classList.add("bg-blue-900");
    } 
    else 
    {
        reload.disabled = true;
        reload.style.cursor = "not-allowed";
        login.innerText = "Login with API Key";
        login.classList.add("hover:bg-green-700");
        reload.classList.add("bg-grey-900");
        reload.style.opacity = 0.5;
    }

    function loadLocalFile(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const contents = e.target.result;
                try {
                    jsonData = JSON.parse(contents);
                    loadData(jsonData);
                } catch (error) {
                    alert('Invalid JSON file');
                }
            };
            reader.readAsText(file);
        }
    }

    function exportToJson() {
        const dataStr = JSON.stringify(jsonData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 'data.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

</script>
</body>

</html>