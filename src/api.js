function API() {
	this.socket = null;
	this.req_id = 0;
	this.timeId = 0;
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
			clearInterval(this.timeId);
			if(this.socket != null)this.socket.close();
            this.socket = new WebSocket("ws://"+msg.serverIp);
            this.socket.onopen = function(evt) {
            	cc.log("onopen");
	            var account = localStorage.getItem("tf_Account");
	            var password = localStorage.getItem("tf_Passwd");
	            api.APILogin(account, password);
	        	api.timeId = setInterval(function (){api.APIPing()},1000);
            };
            this.socket.onmessage = function(evt) {
				var fileReader     = new FileReader();
				fileReader.onload  = function(progressEvent) {
				    api.onmessage(this.result);
				};
				fileReader.readAsArrayBuffer(evt.data);
				fileReader.result;
            };
            this.socket.onerror = function(evt) {
				clearInterval(api.timeId);
            };
            this.socket.onclose = function(evt) {
            	cc.log("_wsiError websocket instance closed.");
				clearInterval(api.timeId);
            };
	};
	this.connect = function(ip) {
			clearInterval(this.timeId);
			if(this.socket != null)this.socket.close();
            this.socket = new WebSocket(ip);
            this.socket.onmessage = function(evt) {
				var fileReader     = new FileReader();
				fileReader.onload  = function(progressEvent) {
				    api.onmessage(this.result);
				};
				fileReader.readAsArrayBuffer(evt.data);
				fileReader.result;
            };
            this.socket.onclose = function(evt) {
            	cc.log("_wsiError websocket instance closed.");
            };
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
		var func = this["OnSync"+msgArr[msgArr.length-1]];
		if(func && typeof(func) === "function")func(msg);
	};
	this.udid = function() {
	    function _p8(s) {
	        var p = (Math.random().toString(16)+"000000000").substr(2,8);
	        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
	    }
	    return _p8() + _p8(true) + _p8();
	};
}