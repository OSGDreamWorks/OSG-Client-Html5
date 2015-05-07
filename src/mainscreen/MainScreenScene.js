var MainScreenLayer = cc.Layer.extend({
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
        var mainscene = ccs.load(res.MainScreen_json);
        this.addChild(mainscene.node);

        var BottomBar = mainscene.node.getChildByTag(5198).getChildByTag(5);
        var BtnSetting = BottomBar.getChildByTag(15);
        BtnSetting.addClickEventListener(function(sender){
        	cc.director.runScene(new LoginScene());
        	api.disconnect()
        });
    }
});


var MainScreenScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MainScreenLayer();
        this.addChild(layer);
    }
});