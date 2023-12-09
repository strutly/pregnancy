import Api from './config/api';
App({
  onLaunch() {
    let that = this;
    Api.login().then(res => {
      console.log(res);
      setTimeout(function () {
        that.globalData.login = true;
        if (res.code == 0) {
          if (res.data.login) {
            wx.setStorageSync('token', res.data.token);
            wx.setStorageSync('userInfo', res.data.info);
          } else {
            wx.removeStorageSync('token');
            wx.removeStorageSync('userInfo');
          }
          that.globalData.msg = res.data.msg;
          that.globalData.status = { login: res.data.login, auth: res.data.auth };
        }
      }, 100);
    })
  },
  globalData: {
    userInfo: null,
    status: { login: false, auth: false },
  },
  buf2hex(buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  },
  hexToStr(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  },
  watch(method) {
    var obj = this.globalData;
    if (obj.login) {
      method(obj.status);
    } else {
      Object.defineProperty(obj, 'status', {
        configurable: true,
        enumerable: true,
        set: function (value) {
          this._status = value;
          method(value);
        },
        get: function () {
          return this._status;
        }
      })
    }
  }
})
