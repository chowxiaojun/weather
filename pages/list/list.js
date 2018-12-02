const days = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

Page({
  data: {
    dailyWeather: [],
    city: '上海市'
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
  onReady() {
    console.log("list--onReady()")
  },
  onShow() {
    console.log("list--onShow()")
  },
  onLoad(options) {
    console.log("list--onLoad()")
    this.data.city = options.city
    this.getFuture()
  },
  onPullDownRefresh() {
    this.getFuture(() => {
      wx.stopPullDownRefresh()
    })
  },
})
