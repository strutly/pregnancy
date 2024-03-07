const app = getApp()
var that;
import Api from '../../config/api';
import Util from '../../utils/util';
import CustomPage from '../../CustomPage';
CustomPage({
  data: {
    tabCur:0
  },
  onLoad(options) {
    that =this;
  },
  onReady() {
    getApp().watch(function (value) {
      if (value.login && value.auth) {
        that.getDetail();
      }
    })
  },
  getDetail() {
    Api.checkPlanDetail({id:that.data.options.id}).then(res=>{
      that.setData({
        checkPlan:res.data
      })
    },err=>{
      that.showTips(err.msg);
    })
  },
  tabChange(e){
    console.log(e)
    that.setData({
      tabCur:e.currentTarget.dataset.index
    })
  },
  check(){
    Api.checkPlanUpdate({id:that.data.options.id}).then(res=>{
      that.showTips("操作成功","success");
    },err=>{
      that.showTips(err.msg);
    })
  },
  changStatus(e){
    console.log(e);
    let checkPlan = that.data.checkPlan;
    Api.highRiskMemberPut(JSON.stringify(e.currentTarget.dataset.id)).then(res=>{
      checkPlan.ifHighRisk = !checkPlan.ifHighRisk;
      that.setData({
        checkPlan:checkPlan
      })
      that.showTips("操作成功","success");      
    },err=>{
      that.showTips(err.msg);      
      that.setData({
        checkPlan:checkPlan
      })
    })
  },
  submit(e){
    let data = e.detail.value;
    if(!data.content) return that.showTips("请先输入卫教内容");
    Api.teachingAdd(data).then(res=>{
      that.showTips("发送成功","success");
      that.setData({
        modaltemplate:false
      })
    },err=>{
      that.showTips(err.msg);
    })
  }
})