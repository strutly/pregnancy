const app = getApp()
var that;
import Api from '../../config/api';
import Util from '../../utils/util';
import CustomPage from '../../CustomPage';
CustomPage({
  data: {
    checkList:[]
  },
  onLoad(options) {
    that = this;
  },
  onReady() {
    getApp().watch(function (value) {
      if (value.login && value.auth) {
        that.getList(1);
      }
    })
  },
  onShow() {
    
  },
  getList(pageNo){
    let param = that.data.options;
    console.log(param)
    param.pageNum = pageNo;
    param.pageSize = 25;
    let checkList = that.data.checkList;
    Api.checkPlanUnRead(param).then(res=>{
      that.setData({
        checkList:checkList.concat(res.data.content),
        endline:res.data.last,
        pageNo: pageNo
      })
    },err=>{
      that.showTips(err.msg);
    });
  },
  onReachBottom() {
    let endline = that.data.endline;
    if(!endline){
      let pageNo = that.data.pageNo + 1;
      that.getList(pageNo);
    }
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