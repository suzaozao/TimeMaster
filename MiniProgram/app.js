//app.js
App({
  onLaunch: function() {
    var that = this;
    this.globalData.rank = true

    wx.getUserInfo({
      withCredentials: false,
      success: function (res) {
        that.globalData.userInfo = res.userInfo
      },
      fail: function () {
        that.globalData.userInfo = {
          nickName: '👻👻👻',
          avatarUrl: 'http://chuantu.biz/t5/135/1500080922x2890149823.jpg'
        }
      }
    })
    console.log(this.globalData)
  },

  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData: {
    userInfo: null
  }
})
