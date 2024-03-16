const app = getApp()
var that;
import Api from '../../config/api';
import Util from '../../utils/util';
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
    Api.outTimeConsumer(param).then(res=>{
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
  callPhone(e){
    let phone = e.currentTarget.dataset.phone;
    if(phone){
      wx.makePhoneCall({
        phoneNumber: phone 
      })
    }
  },
  editNote(e){
    that.setData({
      modalNote:true,
      noteFlag:e.currentTarget.dataset.note,
      consumerId:e.currentTarget.dataset.id
    })
  },
  submit(e){
    console.log(e);
    let data = e.detail.value;
    if(!data.note) return that.showTips("请先填写备注信息");
    Api.consumerNoteAdd(JSON.stringify(data)).then(res=>{
      let members = that.data.members;
      let member = members.find(c=>c.id==data.consumerId);
      member.ifNote = true;
      that.setData({
        members:members,
        modalNote:false
      })
      that.showTips("操作成功","success");
    },err=>{
      that.showTips(err.msg);
    })

  }

})