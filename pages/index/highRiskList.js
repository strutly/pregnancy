var that;
import Api from '../../config/api';
import CustomPage from '../../CustomPage';
CustomPage({

  data: {
    members:[]
  },

  onLoad(options) {
    that = this;
  },

  onReady() {

  },

  onShow() {
    getApp().watch(function (value) {
      if (value.login && value.auth) {
        that.getList(1);
      }
    })
  },
  getList(pageNo){
    let param = that.data.options;
    console.log(param)
    param.pageNum = pageNo;
    param.pageSize = 15;
    let members = that.data.members;
    Api.highRiskMember(param).then(res=>{
      that.setData({
        members:members.concat(res.data.content),
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
  changStatus(e){
    console.log(e);
    Api.highRiskMemberPut(JSON.stringify(e.currentTarget.dataset.id)).then(res=>{
      that.showTips("操作成功","success");      
    },err=>{
      that.showTips(err.msg);
    })
  },
})