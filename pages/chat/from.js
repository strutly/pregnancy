const app = getApp()
var that;
import Api from '../../config/api';
import Websocket from '../../utils/Websocket.js';
import CustomPage from '../../CustomPage';
CustomPage({

  data: {
    messages: [{
      event: "finish",
      content: "您好,请问有什么可以帮您吗?"
    }]
  },
  onLoad(options) {
    that = this;
  },

  onReady() {
    getApp().watch(function (value) {
      if (value.login && value.auth) {
        that.initWebsocket();
      }
    });
  },
  onUnload() {
    that.websocket.closeWebSocket();
  },
  initWebsocket() {
    that.websocket = new Websocket({
      //true代表启用心跳检测和断线重连
      heartCheck: true,
      isReconnection: true,
    });
    that.websocket.onSocketClosed({
      url: Api.websocketUrl + wx.getStorageSync('token').uid,
      success(res) {
        console.log("state:", res);
      },
      fail(err) {
        console.log(err);
      }
    });
    that.websocket.onNetworkChange({
      url: Api.websocketUrl + wx.getStorageSync('token').uid,
      success(res) { console.log(res) },
      fail(err) { console.log(err) }
    });
    //接收到消息的处理方法
    that.websocket.onReceivedMsg(result => {
      let res = JSON.parse(result.data);
      let messages = that.data.messages;
      let message = messages[0];
      if (message.event == "loading") {
        messages[0] = res;
      } else if (message.event == "add" && message.id == res.id) {
        message.content += res.content;
        message.event = res.event;
      }
      that.setData({
        messages: messages
      });
      that.update();
      
      /*
      
      
      wx.createSelectorQuery().select(".item-0").boundingClientRect((con) => { // 获取点击要跳转的锚点信息
        wx.createSelectorQuery().select(".cu-chat").boundingClientRect((res) => { // 获取根元素要滑动的元素  
          wx.pageScrollTo({
            selector: ".cu-chat",  // 滑动的元素
            scrollTop: con.top - res.top, //到达距离顶部的top值
          });          
        }).exec();
      }).exec();
      */
    })
    
    that.linkWebsocket();
  },
  linkWebsocket() {
    // 建立连接
    that.websocket.initWebSocket({
      url: Api.websocketUrl + wx.getStorageSync('token').uid,
      success(res) {
        console.log(res);
        wx.showToast({
          title: '小智连接成功!',
        });
        wx.hideLoading();
      },
      fail(err) {
        console.log(err);
        wx.showToast({
          tite: '连接失败,重连中~~',
        });
      }
    })
  },
  submit(e) {
    let content = e.detail.value.content;
    if (!content) return that.showTips("请输入内容后在发送");
    let messages = that.data.messages;
    let message = messages[0];
    if (message.event == "add" || message.event == "loading") return that.showTips("请稍后再问")
    let mineMessage = { mine: true, id: 1, content: content, event: "ask" };
    messages.unshift(mineMessage);
    that.setData({
      content: "",
      messages: messages
    })
    let messageLoading = { mine: false, content: "请稍后~~", event: "loading" };
    messages.unshift(messageLoading)
    that.setData({
      messages: messages
    })
    that.update();
    Api.chatMessageAdd(content).then(res => {
      console.log(res);
    }, err => { })
  },
  update() {    
    that.setData({
      scrollToView:"base-view"
    })
    /*
    var height = app.globalData.systemInfo.screenHeight;
    console.log(height)
    wx.createSelectorQuery().select(".move-base").boundingClientRect(con => {
      console.log(con)
      let itemHeight = con.top + con.height;
      if (itemHeight > height - 300) {
        wx.pageScrollTo({
          selector: ".move-base",  // 滑动的元素
          scrollTop: 650, //到达距离顶部的top值
        });
      }
    }).exec();
    */
  }
})