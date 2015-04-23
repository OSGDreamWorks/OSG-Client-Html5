var api = null;
var ProtoBuf = null;

cc.loader.loadJs("src", [
    "api.js",
    "login/LoginScene.js",
    "Long.js",
    "ByteBuffer.js",
    "ProtoBuf.js",
    "msg.js",
], function(err){
	api = new API();
	ProtoBuf = dcodeIO.ProtoBuf;
    if(localStorage.getItem("udid") == null) {
        localStorage.setItem("udid", "web-"+api.udid());
    }
    if(err) return console.log("load failed");
    //success
});
