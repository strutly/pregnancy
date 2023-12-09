const app = getApp()
var that;
import Api from '../../config/api';
import Util from '../../utils/util';
import CustomPage from '../../CustomPage';
CustomPage({
  data: {

  },
  onLoad(options) {
    that = this;
  },
  onReady() {
    
  },
  onShow() {
    getApp().watch(function (value) {
      if (value.login && value.auth) {
        that.getCheckPlan();
      }
    })
  },
  getCheckPlan(){
    Api.checkPlanUnRead().then(res=>{
      console.log(res);
      that.setData({
        checkList:res.data
      })
    })
  }
})