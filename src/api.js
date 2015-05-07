function API() {
	this.socket = null;
	this.req_id = 0;
	this.timeId = 0;
	this.player = null;
	this.delegate = null;
	// 用户系统设计api
	// 1 OK
	this.APIPing = function() {
			this.req_id++;
			var ping = new _root.protobuf.Ping({});
			var bufferRequest = ping.encode();
			var request = new _root.protobuf.Request({"id":this.req_id,"method":"Connector.Ping","serialized_request":bufferRequest.toArrayBuffer()});
			var buffer = request.encode();
			var send = new ProtoBuf.ByteBuffer(buffer.limit+4,ProtoBuf.ByteBuffer.LITTLE_ENDIAN);
			send.writeInt32(buffer.limit);
			send.append(buffer)
            this.socket.send(send.buffer);
	};
	this.APIChat = function(buff) {
			this.req_id++;
			var ping = new _root.protobuf.Chat({"msg":"hello world!"})
			var bufferRequest = ping.encode()
			var request = new _root.protobuf.Request({"id":this.req_id,"method":"Connector.Chat","serialized_request":bufferRequest.toArrayBuffer()})
			var buffer = request.encode()
			var send = new ProtoBuf.ByteBuffer(buffer.limit+4,ProtoBuf.ByteBuffer.LITTLE_ENDIAN);
			send.writeInt32(buffer.limit);
			send.append(buffer)
            this.socket.send(send.buffer);
	};
	this.APILogin = function(account, passwd) {
			this.req_id++;
			var login = new _root.protobuf.Login({"account":account, "password":passwd})
			var bufferRequest = login.encode()
			var request = new _root.protobuf.Request({"id":this.req_id,"method":"Connector.Login","serialized_request":bufferRequest.toArrayBuffer()})
			var buffer = request.encode()
			var send = new ProtoBuf.ByteBuffer(buffer.limit+4,ProtoBuf.ByteBuffer.LITTLE_ENDIAN);
			send.writeInt32(buffer.limit);
			send.append(buffer)
            this.socket.send(send.buffer);
	};
	this.OnSyncLoginInfo = function(msg) {
			clearInterval(api.timeId);
			if(api.socket != null)api.socket.close();
            api.socket = new WebSocket("ws://"+msg.serverIp);
            api.socket.onopen = function(evt) {
            	cc.log("onopen");
            	setTimeout(function(){
		            var account = localStorage.getItem("tf_Account");
		            var password = localStorage.getItem("tf_Passwd");
		            api.APILogin(account, password);
            	}, 500);
            };
            api.socket.onmessage = function(evt) {
				var fileReader     = new FileReader();
				fileReader.onload  = function(progressEvent) {
				    api.onmessage(this.result);
				};
				fileReader.readAsArrayBuffer(evt.data);
				fileReader.result;
            };
            api.socket.onerror = function(evt) {
				clearInterval(api.timeId);
            };
            api.socket.onclose = function(evt) {
            	cc.log("_wsiError websocket instance closed.");
				clearInterval(api.timeId);
            };
	};
	this.OnSyncLoginResult = function(msg) {

		switch (msg.result) 
		{
			case _root.protobuf.LoginResult.Result.OK:
				cc.log("OnSyncLoginResult : " + msg.sessionKey)
		        api.timeId = setInterval(function (){api.APIPing()},1000);	
		        api.player = new _root.protobuf.PlayerBaseInfo()
		        api.player.uid = msg.uid
		        api.player.name = ""
		        api.APIUpdatePlayerInfo()
				break;
			case _root.protobuf.LoginResult.Result.SERVERERROR:
			case _root.protobuf.LoginResult.Result.USERNOTFOUND:
			case _root.protobuf.LoginResult.Result.AUTH_FAILED:
			case _root.protobuf.LoginResult.Result.ISONFIRE:
			default:
            	cc.log("login error code : " + msg.result);
				clearInterval(api.timeId);
				break;
		}
	};
	this.OnSyncPingResult = function(msg) {
			cc.log("OnSyncPingResult : " + msg.server_time)
	};
	this.connect = function(ip) {
			clearInterval(this.timeId);
			if(this.socket != null)this.socket.close();
            this.socket = new WebSocket(ip);
            this.socket.onmessage = function(evt) {
				if(api.socket != null){
					api.socket.close();
					api.socket = null;
				}
				var fileReader     = new FileReader();
				fileReader.onload  = function(progressEvent) {
				    api.onmessage(this.result);
				};
				fileReader.readAsArrayBuffer(evt.data);
				fileReader.result;
            };
            this.socket.onclose = function(evt) {
            	cc.log("gate Connector closed.");
            };
	};
	this.disconnect = function() {
			clearInterval(this.timeId);
			if(this.socket != null)this.socket.close();
	};
	this.onmessage = function(arrayBuffer) {
		var uint8ArrayLength  = new Uint8Array(arrayBuffer.slice(0, 3));
		var uint8ArrayData  = new Uint8Array(arrayBuffer.slice(4, arrayBuffer.byteLength));
		var response = new ProtoBuf.ByteBuffer(uint8ArrayData.length,ProtoBuf.ByteBuffer.LITTLE_ENDIAN);
		response.append(uint8ArrayData);
		response.offset = 0;
		var req = _root.protobuf.Request.decode(response.toArrayBuffer());
		var msgArr = req.method.split('.');
		var msg = _root.protobuf[msgArr[msgArr.length-1]].decode(req.serialized_request);
		var funcName = "OnSync"+msgArr[msgArr.length-1];
		var func = this[funcName];
		if(func && typeof(func) === "function")func(msg);
		if(this.delegate!=null) {
			var callback = this.delegate[funcName];
			if(callback && typeof(callback) === "function")callback(msg);
		}
	};
	this.SetDelegate = function(delegate) {
		this.delegate = delegate;
	};
	this.udid = function() {
	    function _p8(s) {
	        var p = (Math.random().toString(16)+"000000000").substr(2,8);
	        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
	    }
	    return _p8() + _p8(true) + _p8();
	};


	this.APIUpdatePlayerInfo = function() {
			this.req_id++;
			var info = api.player
			var bufferRequest = info.encode()
			var request = new _root.protobuf.Request({"id":this.req_id,"method":"Connector.UpdatePlayerInfo","serialized_request":bufferRequest.toArrayBuffer()})
			var buffer = request.encode()
			var send = new ProtoBuf.ByteBuffer(buffer.limit+4,ProtoBuf.ByteBuffer.LITTLE_ENDIAN);
			send.writeInt32(buffer.limit);
			send.append(buffer)
            this.socket.send(send.buffer);
	};
	this.OnSyncPlayerBaseInfo = function(msg) {
			cc.log("OnSyncUpdatePlayerInfo : " + msg.name)
			api.player = msg
	};
}