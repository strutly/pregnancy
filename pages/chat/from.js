const app = getApp()
var that;
import Api from '../../config/api';
import Websocket from '../../utils/Websocket.js';
import CustomPage from '../../CustomPage';
CustomPage({

  data: {
    messages: [{
      event:"finish",
      content:"您好,请问有什么可以帮您吗?"
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
        console.log("state:",res);
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
      if(message.event=="loading"){
        messages[0] = res;
      }else if(message.event=="add"&& message.id==res.id){
        message.content += res.content;
        message.event = res.event;
      }         
      that.setData({
        messages:messages
      })           
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
    


    let mineMessage = {mine:true,id:1,content:content,event:"ask"};
    messages.unshift(mineMessage);
    that.setData({
      content:"",
      messages:messages
    })
    let message = { mine: false, content: "请稍后~~",event:"loading" };
    messages.unshift(message)
    that.setData({
      messages:messages
    })
    Api.chatMessageAdd(content).then(res=>{
      console.log(res);
    },err=>{})
  }
})