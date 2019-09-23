const endpoint = "https://www.bungie.net/Platform";

const xApiKeyHeader = "X-API-Key";
const xApiKeyValue = "52b973d5b38d4557a2f3ac1b099e9f0b";

window.onload = function() {
    showItems();
};

let expectedItems = 0;
let receivedItems = 0;

let cachedItems = {};

function showItems() {
    let request = new XMLHttpRequest();
    request.overrideMimeType("text/json");
    request.open("GET", endpoint + "/Destiny2/Vendors/?components=402");
    request.setRequestHeader(xApiKeyHeader, xApiKeyValue);
    request.onloadend = function() {
        if (request.status === 200) {
            parseItems(JSON.parse(request.responseText));
        } else {
            showError(request.status, request.statusText);
        }
    };
    request.send()
}

function parseItems(response) {
    let xurItems = response.Response.sales.data['2190858386'].saleItems;
    for (let index in xurItems) {
        expectedItems++;
        let item = xurItems[index];
        if (item.costs[0]) {
            getItemNameByHash(item.itemHash, function(name) {
                getItemNameByHash(item.costs[0].itemHash, function(currency) {
                    loadItem(name, item.costs[0].quantity, currency);
                })
            })
        } else {
            getItemNameByHash(item.itemHash, function(name) {
                loadItem(name, "-", "-");
            })
        }
    }
}

function loadItem(item, price, currency) {
    let table = document.getElementById("item-table");
    let row = document.createElement("tr");
    row.appendChild(asTextContent(item));
    row.appendChild(asTextContent(price));
    row.appendChild(asTextContent(currency));
    table.appendChild(row);
    receivedItems++;
    checkState();
}

function asTextContent(content) {
    let td = document.createElement("td");
    td.appendChild(document.createTextNode(content));
    return td;
}

function getItemNameByHash(hash, callback) {
    if (hash in cachedItems) {
        callback((cachedItems[hash].Response.displayProperties.name));
        return;
    }
    let request = new XMLHttpRequest();
    request.overrideMimeType("text/json");
    request.open("GET", endpoint + "/Destiny2/Manifest/DestinyInventoryItemDefinition/" + hash + "/");
    request.setRequestHeader(xApiKeyHeader, xApiKeyValue);
    request.onloadend = function() {
        if (request.status === 200) {
            let item = JSON.parse(request.responseText);
            cachedItems[hash] = item;
            callback((item.Response.displayProperties.name));
        } else {
            showError(request.status, request.statusText);
        }
    };
    request.send()
}

function checkState() {
    if (receivedItems === expectedItems) {
        document.getElementById("content").hidden = false;
        document.getElementById("status").hidden = true;
    }
}

function showError(code, message) {
    let statusLabel = document.getElementById("status");
    statusLabel.classList.add("error");
    statusLabel.innerText = "Oops! " + code + ": " + message;
    statusLabel.hidden = false;
}

