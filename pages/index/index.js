const app = getApp()
var that;
import Api from '../../config/api';
import Util from '../../utils/util';
import CustomPage from '../../CustomPage';
CustomPage({
  data: {
    num:0,
    homeData:{messageNum:0}
  },
  onLoad() {
    that = this;
  },
  onShow(){
    console.log("show");
    getApp().watch(function (value) {
      console.log(value)
      /*
        登录成功,并且授权成功 ,获取首页数据
      */
      if (value.login && value.auth) {
        let loginEnd = that.data.loginEnd;
        if (!loginEnd) that.showTips('登录成功', 'success');
        that.setData({
          modalauth: false,
          loginEnd: true
        })
        that.getHomeData();
      }
      /**
       * 登录成功,授权失败,提示授权
       */
      else if (value.login && !value.auth) {
        that.setData({
          modalauth: true
        })
      }
      /**
       * 登录不成功等提示错误信息
       */
      else {
        that.showTips(app.globalData.msg);
      }
      that.setData({
        authSuccess: value.auth,
        loginMsg: app.globalData.msg,
        userInfo: wx.getStorageSync('userInfo')
      })
    })
  },
  onReady() {
    console.log("ready")
    
  },
  getHomeData(){
    Api.homeData().then(res=>{
      that.setData({
        homeData:res.data
      })
    },err=>{
      that.showTips(err.msg);
    })
  },
  async getPhoneNumber(e) {
    console.log(e);
    if (e.detail.errMsg === "getPhoneNumber:ok") {
      let code = await Api.getCode();
      Api.phone({
        encryptedData: e.detail.encryptedData,
        code: code,
        iv: e.detail.iv
      }).then(res=>{
        if (res.data.auth && res.data.login) {
          wx.setStorageSync('token', res.data.token);
        } else {
          wx.removeStorageSync('code');
          wx.removeStorageSync('token');
          that.showTips(res.data.msg);
          that.setData({
            authModal: false
          })
        }
        app.globalData.msg = res.data.msg;
        app.globalData.status = { login: res.data.login, auth: res.data.auth };
      },err=>{
        wx.removeStorageSync('code');
        that.showTips(err.msg);
        that.setData({
          modalauth: false
        })
      })
    }
  },
  async choosePic(){
    let files = await that.uploadPic(3);
    Api.nurseOrc({pics:files}).then(res=>{
      console.log(res);
      that.setData({
        scanData:res.data,
        modalScan:true
      })
    },err=>{
      console.log(err);
      that.showTips(err.msg);
    })
  },
  submit(){
    let scanData = that.data.scanData;
    Api.nurseReport(scanData).then(res=>{
      console.log(res)
    },err=>{
      console.log(err);
    })
    that.setData({
      modalScan:false
    })
  }

})
