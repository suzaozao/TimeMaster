//tomorrow.js
//setting.js
var util1 = require("../../utils/util1.js");
//引入插件：微信同声传译
const plugin = requirePlugin('WechatSI');
//获取应用实例
var app = getApp()
var util = require('../../utils/util.js');
Page({
  data: {
      userInfo: {},
      showAll: true,
      lists: [],
      newLi: { id: '', content: '', begin: util1.formatTime2(), needRemind: true, editing: false, done: false }, src:'',
    btnWidth: 310,
    starUrl: '../../image/star.png',
    starHlUrl: '../../image/star_hl.png',
    scrollFlag: false,
    scrollTop: 0,
    temNames: ['添加新模板'],
    list: [
      {
        "timeStart": "07:00",
        "timeEnd": "08:00",
        "placeholder": "开启新的一天",
        "leftStyle": 'left: 20rpx',
        "rightStyle": 'right: -310rpx',
        "value": '',
        "stars": 0
      },
      {
        "timeStart": "08:00",
        "timeEnd": "09:00",
        "placeholder": "开启新的一天",
        "leftStyle": 'left: 20rpx',
        "rightStyle": 'right: -310rpx',
        "value": '',
        "stars": 0
      },
      {
        "timeStart": "09:00",
        "timeEnd": "11:00",
        "placeholder": "开启新的一天",
        "leftStyle": 'left: 20rpx',
        "rightStyle": 'right: -310rpx',
        "value": '',
        "stars": 0
      },
      {
        "timeStart": "11:00",
        "timeEnd": "12:00",
        "placeholder": "开启新的一天",
        "leftStyle": 'left: 20rpx',
        "rightStyle": 'right: -310rpx',
        "value": '',
        "stars": 0
      },
      {
        "timeStart": "12:00",
        "timeEnd": "13:00",
        "placeholder": "开启新的一天",
        "leftStyle": 'left: 20rpx',
        "rightStyle": 'right: -310rpx',
        "value": '',
        "stars": 0
      }
    ]
  },
  play:function(){
    if (this.data.src == '') {
      console.log('暂无语音');
      return;
    }
    this.innerAudioContext.src = this.data.src //设置音频地址
    this.innerAudioContext.play(); //播放音频
  },
  onReady: function (e) {
    this.audioCtx = wx.createAudioContext('myAudio');
    this.remind();
    //创建内部 audio 上下文 InnerAudioContext 对象。
    this.innerAudioContext = wx.createInnerAudioContext();
    this.innerAudioContext.onError(function (res) {
      console.log(res);
      wx.showToast({
        title: '语音播放失败',
        icon: 'none',
      })
    }) 
  },
    //提醒时间赋值
    beginTime(e) {
      this.setData({
        'newLi.begin': e.detail.value
      })
    },
    switch1Change(e) {
      this.setData({
        'newLi.needRemind': e.detail.value
      })
    },
   //待做事项编辑框绑定事件
  iptChange(e) {
    this.setData({
      content: e.detail.value,
      'newLi.content': e.detail.value,
      'newLi.begin': util1.formatTime2()
    })
  },//播放提示音
   audioPlay: function () {
        var that = this;
        var content = this.data.list.placeholder;
    setTimeout(this.play,500)//为播放争取一点时间
    //转换汉字为语音
        plugin.textToSpeech({
          lang: "zh_CN",
          tts: true,
          content: content,
          success: function (res) {
            console.log(res);
            console.log("succ tts", res.filename);
            that.setData({
              src: res.filename,
            });
          }, 
        })    
      },
    getRemindArr() {
      let thisLists = this.data.lists, closeT = 0, notDoneLists = [];
      let date = new Date(), now = [date.getHours(), date.getMinutes()];
      thisLists.map(function (l) {
        if (l.needRemind) {
          notDoneLists.push(l)
        }
      })
      if (notDoneLists.length > 0) {
        let newLists = util.sortBy(notDoneLists, 'begin'), firstT = (newLists[0].begin).split(':'), id = newLists[0].id, cnt = newLists[0].content;
        closeT = ((firstT[0] - now[0]) * 60 + (firstT[1] - now[1]) - 1) * 60;
        closeT = closeT >= 0 ? closeT : 0;
        return { closeT, id, cnt };
      } else {
        return false;
      }
    },
    //通知栏提醒
    remind() {
      let result = this.getRemindArr(), t = result.closeT, id = result.id, that = this, cnt = result.cnt;
      function alarm() {
        that.audioPlay();
        let newLists = that.data.lists;
        wx.showModal({
          title: '马上去做吧',
          content: cnt,
          success: function (res) {
            if (res.confirm) {
              that.audioPause();
              that.audioStart();
              newLists.map(function (l, index) {
                if (l.id == id) {
                  newLists[index].done = true;
                  newLists[index].needRemind = false;
                }
              })
              that.setData({
                lists: newLists
              })
            } else {
              that.audioPause();
              that.audioStart();
              newLists.map(function (l, index) {
                if (l.id == id) {
                  newLists[index].needRemind = false;
                }
              })
              that.setData({
                lists: newLists
              })
            }
          }
        })
      }
      if (result) {
        setTimeout(alarm, Math.floor(t * 1000), function () {
          that.remind();
        })
      }
    },
  onShareAppMessage: function () {
    return {
      title: '时间都去哪儿了😨',
      path: 'pages/tomorrow/tomorrow',
      success: function (res) {
        // 转发成功
        console.log(res)
      },
      fail: function (res) {
        // 转发失败
        console.log(res)
      }
    }
  },
  onLoad: function () {
    var that = this;
    wx.getStorage({
      key: 'tomorrow',
      success: function (res) {
        if (res.data) {
          that.setData({
            list: res.data
          })
        }
        // 设置页面滚动
        if (res.data.length > 5) {
          that.setData({
            scrollFlag: true
          })
        } else {
          that.setData({
            scrollFlag: false
          })
        }
      }
    })
    wx.getStorage({
      key: 'temNames',
      success: function (res) {
        that.setData({
          temNames: res.data
        })
      }
    })
    wx.getStorage({
      key: 'templates',
      success: function(res) {
        that.setData({
          templates: res.data
        })
      }
    })
    
  },
  onShow: function () {
    var that = this;
    wx.getStorage({
      key: 'temNames',
      success: function (res) {
        that.setData({
          temNames: res.data
        })
      }
    })
    wx.getStorage({
      key: 'templates',
      success: function (res) {
        that.setData({
          templates: res.data
        })
      }
    })
  },
  onHide: function () {
    this.setData({
      isEmpty: false
    })
  },

  scroll: util.debounce(function (e) {
    this.setData({
      scrollTop: e.detail.scrollTop
    })
    if (e.detail.scrollTop > 50) {
      wx.setNavigationBarTitle({
        title: '明天'
      })
    } else {
      wx.setNavigationBarTitle({
        title: '时间计划表'
      })
    }
  }, 500),
  touchS: function (e) {
    if (e.touches.length == 1) {
      this.setData({
        //设置触摸起始点水平方向位置
        startX: e.touches[0].clientX
      });
    }
  },
  touchM: function (e) {
    if (e.touches.length == 1) {
      //手指移动时水平方向位置
      var moveX = e.touches[0].clientX;
      //手指起始点位置与移动期间的差值
      var disX = this.data.startX - moveX ;
      var btnWidth = this.data.btnWidth;
      var leftStyle = "";
      var rightStyle = '';
      if (disX == 0 || disX < 0) {//如果移动距离小于等于0，文本层位置不变
        leftStyle = "left:20rpx";
        rightStyle = "right: -310rpx;"
      } else if (disX > 0) {//移动距离大于0，文本层left值等于手指移动距离
        leftStyle = "left:-" + disX + "rpx";
        var right = btnWidth - disX;
        rightStyle = "right: -" + right + 'rpx'
        if (disX >= btnWidth) {
          //控制手指移动距离最大值为删除按钮的宽度
          leftStyle = "left:-" + btnWidth + "rpx";
          rightStyle = "right: 0"
        }
      } 
      //获取手指触摸的是哪一项
      var index = e.target.dataset.index;
      var list = this.data.list;
      list[index].leftStyle = leftStyle;
      list[index].rightStyle = rightStyle;
      // //更新列表的状态
      this.setData({
        list: list
      });
    }
  },
  touchE: function (e) {
    if (e.changedTouches.length == 1) {
      //手指移动结束后水平位置
      var endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离
      var disX = this.data.startX - endX + 20;
      var btnWidth = this.data.btnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var leftStyle = disX > btnWidth / 5 ? "left:-" + btnWidth + "rpx" : "left:20rpx";
      var rightStyle = disX > btnWidth / 5 ? "right: 0" : "right: -310rpx"
      //获取手指触摸的是哪一项
      var index = e.target.dataset.index;
      var list = this.data.list;
      list[index].leftStyle = leftStyle;
      list[index].rightStyle = rightStyle
      //更新列表的状态
      this.setData({
        list: list
      });
    }
  },  
  bindTimeChange: function (e) {
    var timeStart, timeEnd, isSure;
    var that = this;
    var array = this.data.list;
    var index = e.target.dataset.index;
    var key = e.target.dataset.time;  // 开始时间或者结束时间
    if (key == 'timeStart') {
      timeStart = e.detail.value;
      timeEnd = array[index].timeEnd;
      isSure = util.compareTime(timeStart, timeEnd)
    } else {
      timeEnd = e.detail.value;
      timeStart = array[index].timeStart;
      isSure = util.compareTime(timeStart, timeEnd);
    }
    if (isSure) {
      array[index][key] = e.detail.value;
    } else {
      this.setData({
        title: '提示',
        message: '开始时间不能大于结束时间哦',
        isEmpty: true
      })
      return
    }
    this.setData({
      list: array
    })
  },
  bindfocus: function (e) {
    var index = e.target.dataset.index;
    var list = this.data.list;
    list[index].placeholder = '';
    this.setData({
      list: list
    })
  },
  addRecord: function (e) {
    var index = e.target.dataset.index;
    var list = this.data.list
    list[index].leftStyle = "left: 20rpx";  // 返回原来的位置
    list[index].rightStyle = "right: -310rpx"; // 返回原来的位置
    var timeStart = list[index].timeStart;
    var timeEnd = list[index].timeEnd;
    var newStart = timeEnd;
    var newEnd = util.newTime(timeEnd);
    let item = {
      "timeStart": newStart,
      "timeEnd": newEnd,
      "placeholder": "开启新的一天",
      "leftStyle": 'left: 20rpx',
      "rightStyle": 'right: -310rpx',
      "stars": 0,
      "value": ''
    }
    list.splice(index + 1, 0, item);
    this.setData({
      list: list,
      scrollFlag: true     // 页面可以滚动
    })
    
    // 滚动到新添加的安排
    var that = this;
    setTimeout(function () {
      that.setData({
        scrollTop: that.data.scrollTop + 60
      })
    }, 250)
  },
  delRecord: function (e) {
    var index = e.target.dataset.index;
    var list = this.data.list;
    list.splice(index, 1);
    this.setData({
      list: list
    })
    // 设置页面滚动
    if (list.length < 6) {
      this.setData({
        scrollFlag: false,
        scrollTop: 0
      })
    } else {
      this.setData({
        scrollFlag: true
      })
    }
  },
  bindInput: util.debounce(function (e) {
      var index = e.target.dataset.index;
      var list = this.data.list;
      list[index].value = e.detail.value
      this.setData({
        list: list
      })
  }, 1000),
  oneStar: function (e) {
    var index = e.target.dataset.index;
    var list = this.data.list;
    if (list[index].stars == 1) {
      list[index].stars = 0;
    } else {
      list[index].stars = 1;
    }    
    this.setData({
      list: list
    })
  },
  twoStar: function (e) {
    var index = e.target.dataset.index;
    var list = this.data.list;
    if (list[index].stars == 2) {
      list[index].stars = 1;
    } else {
      list[index].stars = 2;
    }   
    this.setData({
      list: list
    })
  },
  threeStar: function (e) {
    var index = e.target.dataset.index;
    var list = this.data.list;
    if (list[index].stars == 3) {
      list[index].stars = 2;
    } else {
      list[index].stars = 3;
    }   
    this.setData({
      list: list
    })
  },
  confirmPlan: function () {
    var list = this.data.list;
    var isEmpty = list.some(function (item) {
      return item.value == ''
    })
    this.setData({
      isEmpty: isEmpty,
      message: '还没有时间安排没填喔',
      title: '提示'
    })
    if (!isEmpty) {
      wx.setStorage({
        key: "tomorrow",
        data: this.data.list
      })
      wx.setStorage({
        key: 'today',
        data: this.data.list,
      })
      wx.showToast({
        title: '添加成功',
        icon: 'success',
        duration: 2000
      })
    }
  },
  outLoading: function () {
    this.setData({
      isEmpty: false
    })
  },
  selectTem: function () {
    var that = this;
    var temNames = this.data.temNames;
    var lastIndex = temNames.length - 1;
    var templates = this.data.templates;
    wx.showActionSheet({
      itemList: temNames,
      success: function (res) {
        if (res.tapIndex >= 0 && temNames[res.tapIndex] !== '添加新模板') {
          that.setData({
            list: templates[res.tapIndex]
          })
        }
        if (res.tapIndex == lastIndex && temNames[lastIndex] == '添加新模板') {
          wx.navigateTo({
            url: '../components/template/template'
          })
        }
      }
    })
  }
})
