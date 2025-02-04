<?
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
?>
