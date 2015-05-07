var LoginLayer = cc.Layer.extend({
    tf_Account:null,
    tf_Passwd:null,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super();

        var self = this;

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        var size = cc.winSize;
        var mainscene = ccs.load(res.Login_json);
        this.addChild(mainscene.node);
        
        this.tf_Account = mainscene.node.getChildByTag(31);
        this.tf_Account.addEventListenerTextField(function(target, evt){
            localStorage.setItem("tf_Account", target.getString());
        },this.tf_Account);
        var cb_def_accout = mainscene.node.getChildByTag(16);
        cb_def_accout.addEventListenerCheckBox(function(state){
            if(state.getSelectedState()){
                //获取默认账号
                self.tf_Account.setString(localStorage.getItem("udid"));
                self.tf_Account.ignoreContentAdaptWithSize(true);
            }else {
                //
                self.tf_Account.setString(localStorage.getItem("tf_Account"));
                self.tf_Account.ignoreContentAdaptWithSize(true);
            }
            localStorage.setItem("cb_def_accout", state.getSelectedState());
        });

        cb_def_accout.setSelectedState(localStorage.getItem("cb_def_accout") == "true")
        if(cb_def_accout.getSelectedState()){
            //获取默认账号
            self.tf_Account.setString(localStorage.getItem("udid"));
            self.tf_Account.ignoreContentAdaptWithSize(true);
        }else {
            //
            self.tf_Account.setString(localStorage.getItem("tf_Account"));
            self.tf_Account.ignoreContentAdaptWithSize(true);
        }

        this.tf_Passwd = mainscene.node.getChildByTag(32);
        this.tf_Passwd.addEventListenerTextField(function(target, evt){
            localStorage.setItem("tf_Passwd", target.getString());
        },this.tf_Passwd);
        var cb_save_pw = mainscene.node.getChildByTag(17);
        cb_save_pw.addEventListenerCheckBox(function(state){
            localStorage.setItem("cb_save_pw", state.getSelectedState());
        });

        cb_save_pw.setSelectedState(localStorage.getItem("cb_save_pw") == "true")
        if(cb_save_pw.getSelectedState()){
            //获取默认账号
            self.tf_Passwd.setString(localStorage.getItem("tf_Passwd"));
            self.tf_Passwd.ignoreContentAdaptWithSize(true);
        }else {
            //
            self.tf_Passwd.setString("");
            self.tf_Passwd.ignoreContentAdaptWithSize(true);
        }

        var bt_Login = mainscene.node.getChildByTag(25);
        bt_Login.addClickEventListener(function(sender){
            var account = self.tf_Account.getString();
            var password = self.tf_Passwd.getString();
            if (account.length < 6 || password.length < 6) {
                window.alert('account or password is too short')
            }
            else {
                localStorage.setItem("tf_Account", account);
                localStorage.setItem("tf_Passwd", password);
                api.SetDelegate(self)
                api.connect("ws://127.0.0.1:7880");
            }
        });
        return true;
    },
    OnSyncLoginResult:function (msg) {

        switch (msg.result) 
        {
            case _root.protobuf.LoginResult.Result.OK:
                cc.director.runScene(new MainScreenScene());
                break;
            case _root.protobuf.LoginResult.Result.SERVERERROR:
            case _root.protobuf.LoginResult.Result.USERNOTFOUND:
            case _root.protobuf.LoginResult.Result.AUTH_FAILED:
            case _root.protobuf.LoginResult.Result.ISONFIRE:
            default:
                break;
        }
    },
    _stringConvertToArray:function (strData) {
        if (!strData)
            return null;

        var arrData = new Uint16Array(strData.length);
        for (var i = 0; i < strData.length; i++) {
            arrData[i] = strData.charCodeAt(i);
        }
        return arrData;
    }
});


var LoginScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new LoginLayer();
        this.addChild(layer);
    }
});