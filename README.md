# rss2jsonfn
Azure Function to read an rss or Atom feed and return json

## Development and Deployment
To run this function locally, you need the [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-develop-local).

Once you install that, you should be able to clone the repo and run `npm install`. When ready to run the function, run `npm start`. Make sure you create your local.settings.json file with local settings (see sample in repo).

Once you have done that, you can see how it works with RSS feeds. (There should be a whitelist of RSS feeds, but that is not yet implemented.)

To use in production, create an Azure Function and upload to Azure. For security, make sure you set up CORS so that people across the Internet can't randomly use your function.

[This tutorial](https://learn.microsoft.com/en-us/azure/azure-functions/create-first-function-cli-csharp?tabs=azure-cli%2Cin-process) shows how to deploy an Azure function.

## Usage
To use the function, get your function URL and then just append the RSS URL that you would like to get as JSON. For example:

https://&lt;YourFunctionPrefix&gt;.azurewebsites.net/api/rssfeed?code=&lt;SuperSecretCode&gt;&feed=https://martinfowler.com/feed.atom

To run locally, start with `npm start` then use a URL as such:

http://localhost:7071/api/rssfeed?feed=https://martinfowler.com/feed.atom

If you put that in a browser, you'll see a bunch of JSON. You can load it from your web page and manipulate it as you see fit. (React component coming soon!)
