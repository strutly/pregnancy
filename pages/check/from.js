const app = getApp()
var that;
import Api from '../../config/api';
import CustomPage from '../../CustomPage';
import WxValidate from '../../utils/WxValidate';
CustomPage({
  data: {
    fetalPositionArr:['头位','臀位','横位','不清'],
    presentationArr:['浮','浅入','定'],
    edemaArr:['-','+','++','+++','++++'],
    pelvicMeasurementArr:['未查','正常','异常'],
    pickerVal:{},
    checks:{"血常规":["2"],"生化全项":[]},
    consumerPlan:{},
    checkIndex:"baseCheck"
  },
  onLoad(options) {
    that = this;
    that.initValidate();
  },
  initValidate() {
    let rules = {
      fundalHeight: {
        required: true
      },
      abdominalCircumference: {
        required: true
      },
      weight: {
        required: true
      },
      diastolicPressure: {
        required: true
      },
      systolicPressure: {
        required: true
      },
      edema: {
        required: true
      },
      fetalHeartRate: {
        required: true
      },
      fetalPosition: {
        required: true
      },
      presentation: {
        required: true
      },
      pelvicMeasurement: {
        required: true
      }
    }, messages = {
      fundalHeight: {
        required: "宫高不能为空"
      },
      abdominalCircumference: {
        required: "腹围不能为空"
      },
      weight: {
        required: "体重不能为空"
      },
      diastolicPressure: {
        required: "舒张压不能为空"
      },
      systolicPressure: {
        required: "收缩压不能为空"
      },
      edema: {
        required: "水肿不能为空"
      },
      fetalHeartRate: {
        required: "胎心率不能为空"
      },
      fetalPosition: {
        required: "胎位不能为空"
      },
      presentation: {
        required: "先露不能为空"
      },
      pelvicMeasurement: {
        required: "骨盆测量不能为空"
      }
    };
    that.WxValidate = new WxValidate(rules, messages);
  },
  pickerChange(e){
    console.log(e);
    let name = e.currentTarget.dataset.name;
    that.setData({
     ['pickerVal.'+name]:e.detail.value
    })
  },
  getConsumerPlan(num){    
    Api.consumerPlan({num:num}).then(res=>{
      that.setData({
        consumerPlan:res.data
      })
    },err=>{
      that.showTips(err.msg);
    })
  },
  serach(e){
    console.log(e)
    if(e.detail.value){
      that.getConsumerPlan(e.detail.value)
    }
  },
  tabChange(e){
    that.setData({
      checkIndex:e.currentTarget.dataset.name
    })
  },

  orcFile(data){
    Api.uploadOrcFile(data).then(res=>{
      let consumerPlan = that.data.consumerPlan;
      let checkResultList = consumerPlan.checkResultList;
      checkResultList[res.data.type] = res.data.checkResultList;
      let prompts = consumerPlan.prompts;
      prompts[res.data.type] = res.data.prompts;
      that.setData({
        consumerPlan:consumerPlan
      })
    })
  },
  otherFile(data){
    Api.checkPlanOther(data).then(res=>{
      let consumerPlan = that.data.consumerPlan;
      let checkResultList = consumerPlan.otherPics;
      checkResultList[res.data.type] = res.data.pics;
      that.setData({
        consumerPlan:consumerPlan
      })
    })
  },
  async choosePic(e){
    let data = e.currentTarget.dataset;
    let files = await that.uploadPic(3);
    if(data.name=='other'){
      that.otherFile({...data,pics:files});
    }else{
      that.orcFile({...data,pics:files});
    }
  },
  submit(e){
    console.log(e)
    let data = e.detail.value;
    console.log(that);
    if (!that.WxValidate.checkForm(data)) {
      console.log(that.WxValidate)
      let error = that.WxValidate.errorList[0]
      that.showTips(error.msg)
      return false;
    }
    Api.checkPlanUpdate(data).then(res=>{
      that.showTips(res.msg,"success")
    },err=>{
      that.showTips(err.msg);
    })
  }
})