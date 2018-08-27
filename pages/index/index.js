// pages/bus/bus.js
const app = getApp();
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    latitude: '28.6548692348',
    longitude: '115.8035212755',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    map_show: true,
    city:'南昌市',  //当前定位市
    province:'江西省',//当前定位省
    scale: 14,  //放大倍数
    map_height: '700rpx',
    qidian_name: '您从哪里出发',
    qidian_address: '',
    qidian_latitude: 0,
    qidian_longitude: 0,
    zhongdian_name: '请选择你要去的银行',
    zhongdian_address: '',
    zhongdian_latitude: 0,
    zhongdian_longitude: 0,
    poin_img1: '../images/poin2.png',
    poin_img2: '../images/poin2.png',
    to:[],
    marker:[],
    item_list:1,
    dendai:[], //等待人数的数组
    address:"正在获取中......",
   
    

  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    try {
      wx.removeStorageSync('address')
    } catch (e) {
      // Do something when catch error
    }
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: '6DUBZ-OWIK6-AZOSI-ENMXJ-K7DO3-GKBLW'
    });
    wx.getSetting({
      success: function (res) {
        console.log(res.authSetting["scope.userLocation"])
        if (res.authSetting["scope.userLocation"] == false) {
          wx.openSetting({

          })
        }
      }
    })
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      console.log(this.data.userInfo)
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        console.log(this.data.userInfo)
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
          console.log(this.data.userInfo)
        }
      })
    }
    var that=this;
    wx.getLocation({  //定位
      type: 'wgs84',
      success: function (res) {
        that.setData({
          latitude :res.latitude,
          longitude : res.longitude
        })
        wx.request({ //地址解析
          url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + res.latitude + ',' + res.longitude +'&key=6DUBZ-OWIK6-AZOSI-ENMXJ-K7DO3-GKBLW&get_poi=1',
          data: {
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            let mark = {  //标注
              id: 0,
              latitude: 28.6548692348, //起点标记
              longitude: 115.8035212755,
              title: '起点',
              iconPath: '../images/qd.png',
              width: 50,
              height: 50
            };
            var marks = "marker[" + 0 + "]";
            mark.latitude = that.data.latitude,
            mark.longitude = that.data.longitude,
              mark.title = res.data.result.formatted_addresses.recommend,
            that.setData({
              qidian_name: res.data.result.formatted_addresses.recommend > 15 ? res.data.result.formatted_addresses.recommend.substring(0, 15) + '...' : res.data.result.formatted_addresses.recommend,
              qidian_address: res.data.result.address,
              qidian_latitude: res.data.result.ad_info.location.lat,
              qidian_longitude: res.data.result.ad_info.location.lng,
              scale: 14,
              [marks]: mark,
              poin_img1: '../images/poin1.png',
              city: res.data.result.address_component.city,
              province: res.data.result.address_component.province
            })
          
            wx.request({ //银行搜索根据市
              url: 'https://apis.map.qq.com/ws/place/v1/search?boundary=region(' + res.data.result.address_component.city+',0)&keyword=中国银行&page_size=20&page_index=1&orderby=_distance&key=6DUBZ-OWIK6-AZOSI-ENMXJ-K7DO3-GKBLW',
              data: {
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                if (res.data.status==0){ //查询成功
                  
                  let mark = {  //标注
                    id: 0,
                    latitude: 28.6548692348, //起点标记
                    longitude: 115.8035212755,
                    title: '起点',
                    iconPath: '../images/bank_mark.png',
                    width: 50,
                    height: 50,
                    callout:{},
                    label:{},
                    location:{}
                  };
                  
                  for (var i = 0; i < res.data.data.length; i++) {
                    var marks = "marker[" +(i+2)+ "]";
                    let a = parseInt(Math.random() * 10)+1;
                    let dendais="dendai["+i+"]";
                    that.setData({
                      [dendais]: a,
                    })
                    let callout={
                      content: '  '+res.data.data[i].title+'【当前等待人数：' + a + '】',
                      color: "#ffffff",
                      borderRadius: 10,
                      bgColor: "#ff0000",
                    }
                    let label={
                      content:"" ,
                      color: "#ff0000",
                      borderRadius: 10,
                      fontSize:12,
                      anchorX:0,
                      anchorY:0
                    }
                    mark.callout=callout;
                    mark.label = label;
                    mark.id=i+2;
                    mark.title = 
                    mark.latitude = res.data.data[i].location.lat;
                    mark.longitude = res.data.data[i].location.lng;
                    mark.location = res.data.data[i].location;
                    that.setData({
                      [marks]:mark,
                      map_height:'500rpx'
                    })
                    
                  }
                  that.setData({
                    item_list: 1,
                    address: that.data.marker[that.getMin(that.data.dendai) + 2].callout.content,
                  })
                }
                
               
                
               
              }
            })

          }
        })
        
      }
    })
    
   


  },
  to_my: function () {  //点击左上角图标跳转到 我的 页面
    wx.switchTab({
      url: "../my/my",
      success: function () {  //成功

      },
      fail: function () {  //失败

      },
      complete: function () {  //成功失败都执行

      }
    })
  },
  set_qidian: function () {  //选择起点位置
    try {
      wx.removeStorageSync('address')
    } catch (e) {
      // Do something when catch error
    }
    var that = this;
    let mark = {  //标注
      id: 0,
      latitude: 28.6548692348, //起点标记
      longitude: 115.8035212755,
      title: '起点',
      iconPath: '../images/qd.png',
      width: 50,
      height: 50
    };

    var marks = "marker[" + 0 + "]";
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
        wx.request({ //地址解析
          url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + res.latitude + ',' + res.longitude + '&key=6DUBZ-OWIK6-AZOSI-ENMXJ-K7DO3-GKBLW&get_poi=1',
          data: {
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            let mark = {  //标注
              id: 0,
              latitude: 28.6548692348, //起点标记
              longitude: 115.8035212755,
              title: '起点',
              iconPath: '../images/qd.png',
              width: 50,
              height: 50
            };
            var marks = "marker[" + 0 + "]";
            mark.latitude = that.data.latitude,
              mark.longitude = that.data.longitude,
              mark.title = res.data.result.formatted_addresses.recommend,
              that.setData({
                qidian_name: res.data.result.formatted_addresses.recommend > 15 ? res.data.result.formatted_addresses.recommend.substring(0, 15) + '...' : res.data.result.formatted_addresses.recommend,
                qidian_address: res.data.result.address,
                qidian_latitude: res.data.result.ad_info.location.lat,
                qidian_longitude: res.data.result.ad_info.location.lng,
                scale: 14,
                [marks]: mark,
                poin_img1: '../images/poin1.png',
                city: res.data.result.address_component.city,
                province: res.data.result.address_component.province
              })

            wx.request({ //银行搜索根据市
              url: 'https://apis.map.qq.com/ws/place/v1/search?boundary=region(' + res.data.result.address_component.city + ',0)&keyword=中国银行&page_size=20&page_index=1&orderby=_distance&key=6DUBZ-OWIK6-AZOSI-ENMXJ-K7DO3-GKBLW',
              data: {
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                if (res.data.status == 0) { //查询成功

                  let mark = {  //标注
                    id: 0,
                    latitude: 28.6548692348, //起点标记
                    longitude: 115.8035212755,
                    title: '起点',
                    iconPath: '../images/bank_mark.png',
                    width: 50,
                    height: 50,
                    callout: {},
                    label: {},
                    location: {}
                  };

                  for (var i = 0; i < res.data.data.length; i++) {
                    var marks = "marker[" + (i + 2) + "]";
                    let a = parseInt(Math.random() * 10) + 1;
                    let dendais = "dendai[" + i + "]";
                    that.setData({
                      [dendais]: a,
                    })
                    let callout = {
                      content: '  ' + res.data.data[i].title + '【当前等待人数：' +a + '】',
                      color: "#ffffff",
                      borderRadius: 10,
                      bgColor: "#ff0000",
                    }
                    let label = {
                      content: "",
                      color: "#ff0000",
                      borderRadius: 10,
                      fontSize: 12,
                      anchorX: 0,
                      anchorY: 0
                    }
                    mark.callout = callout;
                    mark.label = label;
                    mark.id = i + 2;
                    mark.title =
                    mark.latitude = res.data.data[i].location.lat;
                    mark.longitude = res.data.data[i].location.lng;
                    mark.location = res.data.data[i].location;
                    that.setData({
                      [marks]: mark,
                      map_height: '500rpx'
                    })
                  }
                  that.setData({
                    item_list: 1,
                    address: that.data.marker[that.getMin(that.data.dendai) + 2].callout.content,
                  })
                }
              }
            })
          }
        })
      
      }
    })

  },
  
 

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.mapCtx = wx.createMapContext('map')

  },

  //切换  等待时间  距离最短切换
  tab_list: function (event) {
    console.log(event.currentTarget.dataset.list);
    var that=this;
    if (event.currentTarget.dataset.list==1){
      that.setData({
        address: that.data.marker[that.getMin(that.data.dendai) + 2].callout.content,
      })
    }else{
      that.setData({
        address: that.data.marker[that.get_juli(that.data.marker) + 2].callout.content,
      })
    }
    that.setData({
      item_list: event.currentTarget.dataset.list
    })
   
  },
  getMin: function (event){
    var min = event[0];
    var j=0;
    for(var i=0;i<event.length;i++){
        if(min>event[i]){
          min=event[i];
          j=i;
        }
    }
    return j;
  },
  get_juli: function (event){
    var qidian_latitude = this.data.qidian_latitude;
    var qidian_longitude = this.data.qidian_longitude;
    var juli=10000000000000000;
    var j=0;
    for(var i=2;i<event.length;i++){
      let julis = Math.pow(qidian_latitude - event[i].latitude, 2) + Math.pow(qidian_longitude - event[i].longitude, 2);
     // console.log(julis+"-----------"+i);
      if (julis<juli){
        juli=julis;
        j=i;
      }
    }
    console.log(j);
    return j-2;

  },
  btn_didi:function(){  //点击预约
    try {
      wx.setStorageSync('address', this.data.address);
      wx.switchTab({
        url: "../my/my?",
        success: function () {  //成功

        },
        fail: function () {  //失败

        },
        complete: function () {  //成功失败都执行

        }
      })
    } catch (e) {
    }
    
  
  },
 
  

 
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})