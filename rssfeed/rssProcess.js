const https = require('https');
const http = require('http');
const url = require('url');
const parseString = require('xml2js').parseString;

module.exports = async function (feed) {

    // Get the feed XML and convert it to JS objects
    const data = await getFeed(feed);
    const feedObj = await getFeedObjects(data);

    // The feed xml will be parsed and then converted to json including the 
    // text, image URLs, and other data
    const feedTitle = feedObj && 
        (feedObj.feed || 
            (feedObj.rss && feedObj.rss && feedObj.rss.channel &&
                feedObj.rss.channel.length && feedObj.rss.channel[0]));
    const response = new Object();

    if (feedTitle) {
        // Get the feed title
        response.title = feedTitle.title;
        if (response.title && response.title.length) {
            response.title = response.title[0];
            if (response.title["_"]) {
                response.title = response.title["_"];
            }
        }

        // Get the image URL
        if (feedTitle.image && feedTitle.image.length) {
            response.image = feedTitle.image[0];
            if (response.image[0].url) {
                response.image = response.image[0].url;
            }
        }

        // Get the link to the feed
        if (feedTitle.link && feedTitle.link.length && feedTitle.link[0]) {
            response.link = feedTitle.link[0];
            if (feedTitle.link[0]["$"] && feedTitle.link[0]["$"].href) {
                response.link = feedTitle.link[0]["$"].href;
            }
        }

        // Get all the items/articles from the feed
        response.items = new Array();

        const feedData = feedObj.feed || 
            (feedObj.rss.channel && feedObj.rss.channel[0]);
        entries = feedData.entry || feedData.item;
        if (entries && entries.length) {
            for (let i = 0; i < entries.length; i++) {
                // Item title
                let title = "";
                if (entries[i].title && entries[i].title.length) {
                    title = entries[i].title[0];
                    if (title["_"]) {
                        title = title["_"];
                    }
                }

                // Item description text
                let description = "";
                if (entries[i].description && entries[i].description.length) {
                    description = entries[i].description[0];
                }
                else if (entries[i].content && entries[i].content.length) {
                    description = entries[i].content[0];
                }
                else if (entries[i].summary && entries[i].summary.length && 
                    entries[i].summary[0] && entries[i].summary[0]["_"]) {
                    description = entries[i].summary[0]["_"];
                }

                // Item date
                let entryDate = null;
                if (entries[i].pubDate && entries[i].pubDate.length) {
                    entryDate = entries[i].pubDate[0];
                }
                else if (entries[i].updated && entries[i].updated.length) {
                    entryDate = entries[i].updated[0];
                }

                // Link to item
                let itemLink = entries[i].link[0];
                if (itemLink["$"] && itemLink["$"].href) {
                    itemLink = itemLink["$"].href;
                }
                const item = new Object();
                item.title = title;
                item.description = description;
                item.entryDate = entryDate;
                item.link = itemLink;
                response.items.push(item);
            }
        }
    }

    return response;
    
}

// Handle the http/https response
function handleResponse(res, resolve, hostName, redirectCount = 0) {
    if (redirectCount < 5 && res.statusCode > 300 && res.statusCode < 400 && 
        res.headers.location) {
            let location = res.headers.location;
            // The location for some (most) redirects will only 
            // contain the path,  not the hostname;
            // detect this and add the host to the path.
            if (!url.parse(res.headers.location).hostname) {
                // Hostname included; make request to 
                // res.headers.location
                location = hostName + "/" + location;
            }
            console.log("Redirecting to " + location);
            res.on('data', (chunk) => { });
            res.on('end', () => {
                if (location.startsWith('https://')) {
                    https.get(location, (resRedirect) => {
                        handleResponse(resRedirect, resolve, hostName, redirectCount + 1);
                    });
                }
                else {
                    http.get(location, (resRedirect) => {
                        handleResponse(resRedirect, resolve, hostName, redirectCount + 1);
                    });
                }
            });
        }
        else{
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                resolve(body);
            });
        }
}

// Get the rss or atom feed from a URL
async function getFeed(feed)
{
    const hostName = url.parse(feed).hostname;
    const options = { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:68.0) Gecko/20100101 Firefox/68.0" } };
    if (feed.startsWith('https://')) {
        return new Promise((resolve, reject) => {
            https.get(feed, options, (res) => handleResponse(res, resolve, "https://" + hostName))
                .on('error', (err) => {
                    reject(err);
                });
        });
    }
    else {
        return new Promise((resolve, reject) => {
            http.get(feed, options, (res) => { handleResponse(res, resolve, "http://" + hostName); })
                .on('error', (err) => {
                    reject(err);
                });
        });
    }
}

// Get the feed XML data as JS objects
async function getFeedObjects(feed)
{
    return new Promise((resolve, reject) => {
        parseString(feed, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        })
    });
}
