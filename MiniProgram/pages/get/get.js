

const devicesId = "643460897" // 填写在OneNet上获得的devicesId 形式就是一串数字 例子:9939133
const api_key = "mKOBSfApxsA1cnpa2ISTsGQ6YY0=" // 填写在OneNet上的 api-key 例子: VeFI0HZ44Qn5dZO14AuLbWSlSlI=

Page({
  data: {
    typ:'default',
    src2:'https://ae.weixin.qq.com/cgi-bin/mmasrai-bin/getmedia?filename=1607935020_c5a2ef9a470fc65ae66e3a061ccf549f&filekey=741358857&source=miniapp_plugin',
    src1:'https://ae.weixin.qq.com/cgi-bin/mmasrai-bin/getmedia?filename=1607934980_49dc854193470becce625892722f58bc&filekey=741358857&source=miniapp_plugin',
    src:'',
    light:'',
    button:'',
    content:'一键知道',
    color:'green',
  },
  onReady: function (e) {
    this.audioCtx = wx.createAudioContext('myAudio');
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
  /**
   * @description 页面下拉刷新事件
   */
  onPullDownRefresh: function () {
    wx.showLoading({
      title: "正在获取"
    })
    this.getDatapoints().then(datapoints => {
      this.update(datapoints)
      wx.hideLoading()
    }).catch((error) => {
      wx.hideLoading()
      console.error(error)
    })
  },

  /**
   * @description 页面加载生命周期
   */
  onLoad: function () {
    console.log(`your deviceId: ${devicesId}, apiKey: ${api_key}`)

    //每隔6s自动获取一次数据进行更新
    const timer = setInterval(() => {
      this.getDatapoints().then(datapoints => {
        
      })
    }, 1000)

    wx.showLoading({
      title: '加载中'
    })
    
    this.getDatapoints().then((datapoints) => {
      wx.hideLoading()

    }).catch((err) => {
      wx.hideLoading()
      console.error(err)
      clearInterval(timer) //首次渲染发生错误时禁止自动刷新
    })
  },

  /**
   * 向OneNet请求当前设备的数据点
   * @returns Promise
   */
  getDatapoints: function () {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://api.heclouds.com/devices/${devicesId}/datapoints?datastream_id=Temperature,Humidity&limit=20`,
        /**
         * 添加HTTP报文的请求头, 
         * 其中api-key为OneNet的api文档要求我们添加的鉴权秘钥
         * Content-Type的作用是标识请求体的格式, 从api文档中我们读到请求体是json格式的
         * 故content-type属性应设置为application/json
         */
        header: {
          'content-type': 'application/json',
          'api-key': api_key
        },
        success: (res) => {
          const status = res.statusCode
          const response = res.data
          console.log(res);
          this.setData({button:res.data.data.datastreams[0].datapoints[0].value});
          this.setData({light:res.data.data.datastreams[1].datapoints[0].value});
          console.log(this.data.light);
          console.log(this.data.button);
          if (status !== 200) { // 返回状态码不为200时将Promise置为reject状态
            reject(res.data)
            return ;
          }
          if (response.errno !== 0) { //errno不为零说明可能参数有误, 将Promise置为reject
            reject(response.error)
            return ;
          }

          if (response.data.datastreams.length === 0) {
            reject("当前设备无数据, 请先运行硬件实验")
          }

          //程序可以运行到这里说明请求成功, 将Promise置为resolve状态
          resolve({
            temperature: response.data.datastreams[0].datapoints.reverse(),
            humidity: response.data.datastreams[1].datapoints.reverse()
          })
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },
get:function(){
  console.log(this.data.light)
  if(this.data.light<30){
    this.setData({content:'很好，加油，学习人'}),
    this.setData({color:'green'}),
    this.setData({typ:'primary'}),
    console.log(this.data.color),
    this.innerAudioContext.src = this.data.src1 //设置音频地址
    this.innerAudioContext.play();
  }else{
    this.setData({content:'不行，眼睛会瞎掉的'}),
    this.setData({color:'red'}),
    this.setData({typ:'warn'}),
    console.log(this.data.src2)
    this.innerAudioContext.src = this.data.src2 //设置音频地址
    this.innerAudioContext.play();
  }
},

 

  


  
})
