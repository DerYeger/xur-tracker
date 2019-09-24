import org.w3c.xhr.XMLHttpRequest
import kotlin.js.Promise
import kotlin.js.Promise.Companion.reject
import kotlin.js.Promise.Companion.resolve

const val endpoint = "https://www.bungie.net/Platform"

const val xApiKeyHeader = "X-API-Key"
const val xApiKeyValue = "52b973d5b38d4557a2f3ac1b099e9f0b"

external interface XurInventory(val r: String)

data class Cost(val currency: String, val quantity: Int)
data class Item(val hash: String, val cost: Cost)

fun main() {
    val xurInventory: Promise<Any> = getXurInventory()
}

fun getXurInventory() = Promise<> {
    param: (Any) -> Unit, function: (Throwable) -> Unit ->
    XMLHttpRequest().apply {
        overrideMimeType("text/json")
        open("GET", "$endpoint/Destiny2/Vendors/?components=402")
        setRequestHeader(xApiKeyHeader, xApiKeyValue)
        onloadend = {
            if (status.toInt() == 200) {
                resolve(JSON.parse(responseText))
            } else {
                reject(Error(statusText))
            }

        }
    }.send()
}

fun parseItems(responseText: String) {

    println(responseText)
}


//fun getItemByHash(hash: String) {
//    val request = XMLHttpRequest()
//    request.overrideMimeType("text/json")
//    request.open("GET", "$endpoint/Destiny2/Manifest/DestinyInventoryItemDefinition/$hash/")
//    request.setRequestHeader(xApiKeyHeader, xApiKeyValue)
//    request.onloadend = with (request) {
//            if (status.toInt() == 200) {
//                println("Success")
//                return JSON.parse(responseText)
//            } else {
//                println("Error")
//            }
//        }
//    request.send()
//}