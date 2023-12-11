var socketTask = "", intervalWS = "", socketOptions = {};
function WebsocketTask(options) {
  socketOptions = options;
  // 开始建立连接
  socketTask = wx.connectSocket({
    url: options.url,
    success(res) {
      console.log("建立socket连接成功,", res)
    },
    fail(err) {
      console.log("建立socket连接失败,", err);
      wx.showToast({
        tite: '小智连接失败'
      })
    },
    complete(complete) {
      wx.hideLoading();
    }
  });

  // onOpen
  socketTask.onOpen(() => {
    console.log('打开 WebSocket 连接');
    wx.showToast({
      title: '小智连接成功!',
    });
  });
  // onError
  socketTask.onError((err) => {
    console.log('WebSocket 连接失败：', err);
  });
  // onClose
  socketTask.onClose((ret) => {
    console.log('断开 WebSocket 连接', ret);
  })
  //监听接收到的消息
  socketTask.onMessage((res) => {
    let msg = res.data
    console.log("接收到的服务器消息", msg);
    if (typeof options.receivedMsg == "function") {
      options.receivedMsg(msg)
    } else {
      console.log('参数的类型必须为函数')
      wx.showToast({
        title: '参数的类型必须为函数',
      })
    }
  })
  if (!intervalWS) {
    ping()
  }
}
//发送消息
const sendMsg = function (options) {
  socketTask.send({
    data: options.msg,
    success(res) {
      if (typeof options.success == "function") {
        options.success(res);
      } else {
        wx.showToast({
          title: '参数的类型必须为函数',
        })
      }
    },
    fail(err) {
      if (typeof options.fail == "function") {
        options.fail(err);
      } else {
        wx.showToast({
          title: '参数的类型必须为函数',
        })
      }
    }
  })
}

//关闭socket连接
const closeSocket = function () {
  socketTask.close({
    reason: "主动关闭",
    complete: res => {
      console.log("关闭socket连接", res)
    }
  })
  if (intervalWS) clearInterval(intervalWS)
}
const getConnectState = function () {
  return socketTask.readyState == 1;
}

// 心跳，由客户端发起
const ping = function () {
  let times = 0
  // 每 10 秒钟由客户端发送一次心跳
  intervalWS = setInterval(function () {
    if (socketTask.readyState == 1) {  //在线时发送心跳
      socketTask.send({
        data: JSON.stringify({
          type: "ping",
          detail: "ping"
        })
      });
    } else if (socketTask.readyState == 3) {
      times += 1
      // 超时重连，最多尝试 10 次
      console.log("重连次数", times)
      if (times >= 10) {
        wx.showToast({
          title: '小智连接已断开~',
          icon: 'none',
          duration: 2000
        })
        clearInterval(intervalWS)
      } else {
        WebsocketTask(socketOptions)
      }
    }
  }, 10000)
}

module.exports = {
  WebsocketTask, closeSocket, sendMsg, getConnectState
}