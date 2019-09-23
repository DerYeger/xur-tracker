const endpoint = "https://www.bungie.net/Platform";

const xApiKeyHeader = "X-API-Key";
const xApiKeyValue = "52b973d5b38d4557a2f3ac1b099e9f0b";

window.onload = function() {
    getItems();
};

function getItems() {
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
    let promises = [];
    for (let index in xurItems) {
        const promise = new Promise(function(resolve) {
            let item = xurItems[index];
            if (item.costs[0]) {
                let itemInfo = getItemNameByHash(item.itemHash)
                    .then(itemPromise => {
                        const currencyPromise = getItemNameByHash(item.costs[0].itemHash);
                        return Promise.all([itemPromise, currencyPromise]);
                    })
                    .then(([itemPromise, currencyPromise]) => {
                        return {name: itemPromise, currency: currencyPromise, price: item.costs[0].quantity};
                    });
                resolve(itemInfo);
            } else {
                let itemInfo = getItemNameByHash(item.itemHash)
                    .then(itemPromise => {
                        return {name: itemPromise, currency: "-", price: "-"};
                    });
                resolve(itemInfo);
            }
        });
        promises.push(promise);
    }
    Promise
        .all(promises)
        .then(result => loadItems(result))
        .catch(reason => showError(reason));
}

function loadItems(items) {
    for (let index in items) {
        let item = items[index];
        loadItem(item);
    }
    reveal()
}

function loadItem(item) {
    let table = document.getElementById("item-table");
    let row = document.createElement("tr");
    row.appendChild(asTextContent(item.name));
    row.appendChild(asTextContent(item.price));
    row.appendChild(asTextContent(item.currency));
    table.appendChild(row);
}

function asTextContent(content) {
    let td = document.createElement("td");
    td.appendChild(document.createTextNode(content));
    return td;
}

function getItemNameByHash(hash) {
    return new Promise(function(resolve, reject) {
        let request = new XMLHttpRequest();
        request.overrideMimeType("text/json");
        request.open("GET", endpoint + "/Destiny2/Manifest/DestinyInventoryItemDefinition/" + hash + "/");
        request.setRequestHeader(xApiKeyHeader, xApiKeyValue);
        request.onloadend = function() {
            if (request.status === 200) {
                resolve(JSON.parse(request.responseText).Response.displayProperties.name);
            } else {
                reject(request.status, request.statusText);
            }
        };
        request.send();
    });

}

function reveal() {
    document.getElementById("content").hidden = false;
    document.getElementById("status").hidden = true;
}


function showError(message) {
    let statusLabel = document.getElementById("status");
    statusLabel.classList.add("error");
    statusLabel.innerText = "Oop! Something went wrong. Try reloading the site\n" + message;
    statusLabel.hidden = false;
}

