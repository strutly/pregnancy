var that;
import Api from '../../config/api';
import { WebsocketTask, closeSocket,getConnectState} from '../../utils/WebsocketTask.js';
import CustomPage from '../../CustomPage';
CustomPage({
  data: {
    errorMsg:"",
    errorType:"error",
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
    if(getConnectState()){
      closeSocket();
    }    
  },
  initWebsocket() {
    WebsocketTask({
      url: Api.websocketUrl + wx.getStorageSync('token').uid,
      receivedMsg: function (result) {
        console.log(result);
        let res = JSON.parse(result);
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
      }
    })
  },
  submit(e) {
    let content = e.detail.value.content;
    if (!content) return that.showTips("请输入内容后在发送");
    let messages = that.data.messages;
    let message = messages[0];
    if (message.event == "add" || message.event == "loading") return that.showTips("请稍后再问");
    if(!getConnectState()) return wx.showModal({
      title: '小智连接失败',
      content: '点击重连',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定');
          that.initWebsocket();
        }
      }
    })
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
      scrollToView: "base-view"
    })
  }
})