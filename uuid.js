const crypto = require("crypto")

function offlineUUID(name){

return crypto
.createHash("md5")
.update("OfflinePlayer:" + name)
.digest("hex")

}

module.exports = offlineUUID