const endpoint = "https://www.bungie.net/Platform";

const xApiKeyHeader = "X-API-Key";
const xApiKeyValue = "52b973d5b38d4557a2f3ac1b099e9f0b";

window.onload = function() {
    getXurInventory()
        .then(inventory => getItems(inventory))
        .then(items => loadItems(items))
        .catch(error => showError(error));
};

function getXurInventory() {
    return new Promise(function(resolve, reject) {
        const request = new XMLHttpRequest();
        request.overrideMimeType("text/json");
        request.open("GET", endpoint + "/Destiny2/Vendors/?components=402");
        request.setRequestHeader(xApiKeyHeader, xApiKeyValue);
        request.onloadend = function() {
            if (request.status === 200) {
                resolve(JSON.parse(request.responseText).Response.sales.data['2190858386'].saleItems);
            } else {
                reject(request.status, request.statusText);
            }
        };
        request.send()
    });
}

function getItems(inventory) {
    const xurItems = inventory;
    const promises = [];
    for (const entry of Object.entries(xurItems)) {
        promises.push(getItemInfo(entry[1]));
    }
    return Promise.all(promises);
}

function getItemInfo(item) {
    return new Promise(function(resolve) {
        const itemPromise = getItemNameByHash(item.itemHash);
        if (item.costs[0]) {
            const itemInfo = getItemNameByHash(item.costs[0].itemHash)
                .then(currencyPromise => {
                    return Promise.all([itemPromise, currencyPromise]);
                })
                .then(([itemPromise, currencyPromise]) => {
                    return {name: itemPromise, currency: currencyPromise, price: item.costs[0].quantity};
                });
            resolve(itemInfo);
        } else {
            const itemInfo = itemPromise
                .then(itemPromise => {
                    return {name: itemPromise, currency: "", price: "-"};
                });
            resolve(itemInfo);
        }
    });
}

function loadItems(items) {
    items.sort(function(a, b) {
        return a.price - b.price;
    });
    items.forEach(item => loadItem(item));
    reveal();
}

function loadItem(item) {
    const table = document.getElementById("item-table");
    const row = document.createElement("tr");
    row.appendChild(asTextContent(item.name));
    row.appendChild(asTextContent(item.price + " " + item.currency));
    table.appendChild(row);
}

function asTextContent(content) {
    const td = document.createElement("td");
    td.appendChild(document.createTextNode(content));
    return td;
}

function getItemNameByHash(hash) {
    return new Promise(function(resolve, reject) {
        const request = new XMLHttpRequest();
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
    const statusLabel = document.getElementById("status");
    statusLabel.classList.add("error");
    statusLabel.innerText = "Oop! Something went wrong. Try reloading the site\n" + message;
    statusLabel.hidden = false;
}

