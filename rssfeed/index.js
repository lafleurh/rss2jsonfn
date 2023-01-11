const processFeed = require("./rssProcess.js");

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const name = (req.query.name || (req.body && req.body.name));

    // In the request, feed will be the name of the feed to be retrieved
    const feed = req.query.feed;

    // Process the feed and get JavaScript results
    const response = await processFeed(feed);

    // After the json is created (JSON.stringify), it will be sent to the client
    const responseMessage = JSON.stringify(response);
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };
}
