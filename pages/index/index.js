const amap = require('../../libs/amap-wx.js');

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

const UNPROMPTED_TIPS = "点击获取当前位置"
const UNAUTHORIZED_TIPS = "点击开启位置权限"
const AUTHORIZED_TIPS = ""

const days = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}

const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

const mapSDKKey = ''

var aMapSDK = new amap.AMapWX({
  key: mapSDKKey
})

Page({
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBackground: '/images/overcast-bg.png',
    hourlyWeather: [],
    todayDate: '',
    todayTemp: '',
    city: '',
    locationTipsText: UNPROMPTED_TIPS,
    locationAuthType: UNPROMPTED,
    dailyWeather: [],
  },
  getNow(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: this.data.city
      },
      complete: res => {
        callback && callback()
      },
      success: res => {
        let result = res.data.result
        let temp = result.now.temp
        let weather = result.now.weather

        wx.setNavigationBarColor({
          frontColor: '#000000',
          backgroundColor: weatherColorMap[weather],
        })

        let nowHour = new Date().getHours()
        let hourlyWeather = []
        for (let i = 0; i < result.forecast.length; i++) {
          let time = (i * 3 + nowHour) % 24
          if (time == 0) {
            time = '明天'
          } else if (time < 10) {
            time = '0' + time + ':00'
          } else {
            time = time + ':00'
          }

          hourlyWeather.push({
            time: time,
            iconPath: '/images/' + result.forecast[i].weather + '-icon.png',
            temp: result.forecast[i].temp + '°'
          })
        }
        this.setData({
          nowTemp: temp + '°',
          nowWeather: weatherMap[weather],
          nowWeatherBackground: "/images/" + weather + "-bg.png",
          hourlyWeather: hourlyWeather
        })
        this.setToday(result)
      }
    })
  },
  getFuture(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',
      data: {
        city: this.data.city,
        time: new Date().getTime()
      },
      complete: res => {
        callback && callback()
      },
      success: res => {
        console.log(res)
        let date = new Date()
        let forecastList = res.data.result
        let dailyWeather = []
        for (let i = 0; i < forecastList.length; i++) {
          let tempDate = new Date()
          tempDate.setDate(date.getDate() + i)
          dailyWeather.push({
            day: days[(date.getDay() + i) % 7],
            date: `${tempDate.getFullYear()}-${tempDate.getMonth()}-${tempDate.getDate()}`,
            iconPath: '/images/' + forecastList[i].weather + '-icon.png',
            temp: `${forecastList[i].minTemp}° - ${forecastList[i].maxTemp}°`
          })
        }
        dailyWeather[0].day = '今天'
        this.setData({
          dailyWeather: dailyWeather
        })
      }
    })
  },
  setToday(result) {
    let date = new Date()
    this.setData({
      todayTemp: `${result.today.minTemp}° - ${result.today.maxTemp}°`,
      todayDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 今天`
    })
  },
  onTapDayWeather() {
    wx.navigateTo({
      url: '/pages/list/list?city=' + this.data.city
    })
  },
  onTapLocation() {
    // let that = this，注意：使用箭头函数，就不用把this对象重新做赋值了
    if (this.data.locationAuthType != UNAUTHORIZED) {
      wx.getLocation({
        success: res => {
          this.setData({
            locationAuthType: AUTHORIZED,
            locationTipsText: AUTHORIZED_TIPS
          })

          this.api.getRegeo({
            location: res.longitude + ',' + res.latitude,
            success: data => {
              this.setData({
                city: data[0].regeocodeData.addressComponent.city,
              })
              this.getNow()
              this.getFuture()
            },
            fail: res => {
              console.log(res)
            }
          });
        },
        fail: () => {
          this.setData({
            locationAuthType: UNAUTHORIZED,
            locationTipsText: UNAUTHORIZED_TIPS
          })
        }
      })
    } else {
      wx.openSetting({
        success: res => {
          console.log(res)
          if (res.authSetting['scope.userLocation']) {
            this.setData({
              locationAuthType: UNPROMPTED,
              locationTipsText: UNPROMPTED_TIPS
            })
          }
        }
      })
    }
  },
  onReady() {
    console.log("index--onReady()")
  },
  onShow() {
    console.log("index--onShow()")
  },
  onLoad() {
    console.log("index--onLoad()")
    wx.getSetting({
      success: res => {
        // 根据res.authSetting['scope.userLocation']三个不同值来对locationAuthType和locationTipsText赋值
        console.log(res.authSetting['scope.userLocation'])
      }
    }) 
    this.api = new amap.AMapWX({
      key: mapSDKKey
    })
    console.log(this.api.getRegeo)
    this.getNow()
    this.getFuture()
  },
  onPullDownRefresh() {
    this.getNow(() => {
      wx.stopPullDownRefresh()
    })
    this.getFuture()
  },
})
