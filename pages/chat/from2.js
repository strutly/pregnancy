const app = getApp()
var that;
import Api from '../../config/api';
import Websocket from '../../utils/Websocket.js';
import CustomPage from '../../CustomPage';
CustomPage({

  data: {
    messages: [{
      event:"loading",
      content:"您好,请问有什么可以帮您吗?"
    }]
  },
  onLoad(options) {
    that = this;
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
    const requestTask = wx.request({
      url: "http://localhost/api/chatMessage4",
      method: 'post',
      header:{
        'Content-Type': 'application/json',
        'token':wx.getStorageSync('token').token
      },
      enableChunked: true,
      data: JSON.stringify(content),
      success: response => {
         console.log(response)
      },
      fail: error => {
        console.log("error",error)
      }
    })
    requestTask.onHeadersReceived(function(res) {
      // console.log(res.header);
    });
    requestTask.onChunkReceived(function(response) {
      console.log(response)
      
       const arr = new Uint8Array(response.data);       
       const text = String.fromCharCode.apply(null,arr);
       let text1 = decodeURIComponent(escape(text));
      
       console.log(text1);
    })  
  }
})