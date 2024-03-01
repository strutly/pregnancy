import Api from './config/api';
const fileManager = wx.getFileSystemManager();
const CustomPage = function (page) {
  return Page(
    Object.assign({}, page, {
      onLoad(options) {
        this.setData({
          options: options,
          dTypes: { 1: 'diabetes', 2: 'respiratory' }
        });
        page.onLoad && page.onLoad.call(this, options)
      },
      onReady() {
        console.log(2)
        this.setData({
          userInfo: wx.getStorageSync('userInfo')
        })
        page.onReady && page.onReady.call(this)
      },
      toUrl(e) {
        let that = this;
        console.log(e)
        getApp().watch(function (value) {
          console.log(value)
          /*
            登录成功,并且授权成功 ,获取首页数据
          */
          if (value.login && value.auth) {
            let url = e.currentTarget.dataset.url;
            let msg = e.currentTarget.dataset.msg || '正在开发中~';
            if (url) {
              wx.navigateTo({
                url: url,
              })
            } else {
              wx.showToast({
                icon: "none",
                title: msg,
              })
            }
          } else {
            that.showTips("您未登录,请先登录");
            that.setData({
              modalauth:true
            })
          }
        });
      },
      modalStatus(e) {
        let name = e.currentTarget.dataset.name;
        this.setData({
          ['modal' + name]: !this.data['modal' + name]
        })
      },
      call(e) {
        let phone = e.currentTarget.dataset.phone;
        if (phone) {
          wx.makePhoneCall({
            phoneNumber: phone
          })
        } else {
          wx.showToast({
            title: '号码不存在',
            icon: 'none'
          })
        }
      },
      phoneChange(e) {
        console.log(e);
        this.setData({
          phone: e.detail.value
        })
      },
      getCode() {
        console.log(12)
        let phone = this.data.phone;
        let reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
        console.log(reg.test(phone));
        if (!reg.test(phone)) return this.showTips("请输入正确的手机号");
        Api.getPhoneCode({
          phone: phone
        }).then(res => {
          console.log(res);
        });

        this.timer();
      },
      timer() {
        let that = this;
        let min = 0
        let max = 60;
        let countdown = setInterval(() => {
          if (max > min) {
            max--;
            that.setData({
              countdown: max,
              disabled: true
            })
          } else {
            that.setData({
              disabled: false,
              countdown: "获取验证码"
            })
            clearInterval(countdown);
          }
        }, 1000)
      },
      back() {
        if (getCurrentPages().length > 1) {
          wx.navigateBack({
            delta: 1
          })
        } else {
          wx.reLaunch({
            url: '/pages/index/home',
          })
        }
      },
      home() {
        wx.reLaunch({
          url: '/pages/index/home',
        })
      },
      viewImage(e) {
        console.log(e)
        let url = e.currentTarget.dataset.url;
        let urls = e.currentTarget.dataset.urls;
        if (url) {
          wx.previewImage({
            urls: urls||[url],
            current: url
          })
        }

      },
      showTips(msg = "出错了~", errorType = "error") {
        this.setData({
          errorMsg: msg || '出错了~',
          errorType: errorType,
          errorShow: true
        })
      },
      showToast(msg = "出错了~") {
        wx.showToast({
          title: msg || '出错了~',
          icon: 'none'
        })
      },
      async uploadPic(num) {
        console.log(num);
        let fileRes = await wx.chooseMedia({
          count: num,
          mediaType: ['image'],
          sizeType: ['compressed']
        });
        console.log(fileRes)
        let files = [];
        let quality = 100;
        for (let i = 0; i < fileRes.tempFiles.length; i++) {
          let item = fileRes.tempFiles[i];
          var file = item;
          if (item.size > 4 * 1024 * 1024) {
            quality = ((4 * 1024 * 1024) / item.size) * 90;
            let newFile = await wx.compressImage({//压缩图片
              src: item.tempFilePath, // 图片路径
              quality: quality
            });
            file = newFile;
          }
          files.push(fileManager.readFileSync(file.tempFilePath, 'base64'))
        }
        return files;
      }
    })
  )
}

export default CustomPage