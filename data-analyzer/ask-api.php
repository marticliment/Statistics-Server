<script>
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const input = document.getElementById('API_KEY');



    // Check if X is already in localStorage
    if (localStorage.getItem('API_KEY')) {
        const Xvalue = localStorage.getItem('API_KEY');
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = './analyzer.php';

        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = 'apikey';
        hiddenField.value = Xvalue;

        form.appendChild(hiddenField);
        document.body.appendChild(form);
        form.submit();
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const Xvalue = input.value;
        localStorage.setItem('API_KEY', Xvalue);
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = './analyzer.php';

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
<html lang="en" class="dark"></html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Key required - Statistics</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-900 text-gray-100 flex items-center justify-center min-h-screen">
        <form method="post" action="" class="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-sm">
            <label for="API_KEY" class="block text-sm font-medium text-gray-300 mb-2">Enter the API KEY:</label>
            <input type="text" id="API_KEY" name="API_KEY" required class="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-gray-100">
            <button type="submit" class="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Save</button>
        </form>
    </body>
</html>