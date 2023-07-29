// index.js

// 获取应用实例
const app = getApp()
const innerAudioContext = wx.createInnerAudioContext()
Page({
    data: {
        diceCapStyle: 'transform: rotateX(123deg) translateY(0px);',
        yStart: 0,
        start: false,
        one: 0,
        two: 0,
        thr: 0,
        fou: 0,
        fiv: 0,
        six: 0,
        total: 0,
        totalDiceOpacity: 'opacity: 0;',
        diceWidth: 70,
        diceList: [],
        diceCount: 6,
        historyDiceList: [],
        isOpen: false,
        hideModal: true, //模态框的状态 true-隐藏 false-显示
        animationData: {}, //
        vibrateLong: undefined, //开启震动
        hideSetiingModal: true,
        animationSetting: {},
        isMusic: undefined,
        shakeState: false,
        shakeStatus: undefined
    },
    onLoad() {
        if (wx.onGyroscopeChange) {
            console.log('可以使用onGyroscopeChange');
        } else {
            // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
            wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
            })
        }

    },
    onShow() {
        let history = wx.getStorageSync('historyDiceList')
        if (history) {
            let H = JSON.parse(history)
            this.setData({
                historyDiceList: H
            })
        }
        let vibrateLong = wx.getStorageSync('vibrateLong')
        let bool = vibrateLong === '' ? true : Boolean(vibrateLong)
        this.setData({
            vibrateLong: bool
        })
        this.setData({
            diceCount: wx.getStorageSync('diceCount') || 3
        })
        let isMusic = wx.getStorageSync('isMusic')
        let boolMusic = isMusic === '' ? true : Boolean(isMusic)
        this.setData({
            isMusic: boolMusic
        })
        let Shake = wx.getStorageSync('shakeStatus')
        let boolShake = Shake === '' ? true : Boolean(Shake)
        this.setData({
            shakeStatus: boolShake
        })
        this.watchOnGyroscopeChange()
    },

    bindtouchmoveFn(e) {
        let pageY = 0
        pageY = parseInt(this.data.yStart - e.changedTouches[0].pageY)
        if (pageY < 0) return
        this.setData({
            diceCapStyle: `transform: rotateX(123deg) translateY(${pageY}px);`,
            totalDiceOpacity: `opacity: ${pageY/100};`
        })

    },
    bindtouchstartFn(e) {
        this.setData({
            yStart: e.changedTouches[0].pageY
        })
    },
    bindtouchendFn() {
        this.setData({
            diceCapStyle: `transform: rotateX(123deg) translateY(0px);`,
            totalDiceOpacity: 'opacity: 0;'
        })
    },
    /**
     * 点击开始摇一摇
     */
    bindtapStartFn() {
        this.bindtouchendFn()
        this.setData({
            start: true,
            isOpen: true
        })
        if (this.data.isMusic) {
            this.playMusic()
        }
        this.setDice()
        if (this.data.vibrateLong) {
            wx.vibrateLong()
        }
        setTimeout(() => {
            this.setData({
                start: false
            })
        }, 1400)
    },
    playMusic() {
        innerAudioContext.autoplay = true
        innerAudioContext.src = '/static/dice.mp3'
        innerAudioContext.onPlay(() => {});
        innerAudioContext.onError((e) => {
            console.log('播放错误', e);
        });

    },
    bindtapOpen() {
        if (this.data.total != 0 && this.data.isOpen) {
            let list = this.data.historyDiceList
            list.unshift({
                one: this.data.one,
                two: this.data.two,
                thr: this.data.thr,
                fou: this.data.fou,
                fiv: this.data.fiv,
                six: this.data.six,
                id: this.getTime(new Date().getTime()),
                total: this.data.total
            })
            this.setData({
                historyDiceList: list
            })
            wx.setStorageSync('historyDiceList', JSON.stringify(this.data.historyDiceList))
        }
        this.setData({
            diceCapStyle: `transform: rotateX(123deg) translateY(300px);`,
            totalDiceOpacity: 'opacity: 1;',
            isOpen: false
        })
    },
    //设置骰子坐标前
    setDice() {
        this.setData({
            diceList: []
        })
        let arr = []
        //生成坐标数组
        if (this.data.diceCount > 9) {
            let pointSum = Math.floor(Math.sqrt(this.data.diceCount)) + 1
            this.setData({
                diceWidth: parseInt(240 / pointSum)
            })
            for (let i = 0; i < pointSum; i++) {
                for (let j = 0; j < pointSum; j++) {
                    arr[arr.length] = {
                        top: i * this.data.diceWidth,
                        left: j * this.data.diceWidth
                    }
                }
            }
        } else {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    arr[arr.length] = {
                        top: i * this.data.diceWidth * 1.1,
                        left: j * this.data.diceWidth * 1.1
                    }
                }
            }
        }
        let dice, angle, temp, tempList
        for (let i = 0; i < this.data.diceCount; i++) {
            dice = (Math.random() * 6) >> 0
            angle = (Math.random() * 6) >> 0
            temp = (Math.random() * arr.length) >> 0;
            // 让数组不重复
            tempList = arr[temp];
            arr.splice(temp, 1)
            this.addDiceList(dice, angle, tempList)
        }
        this.diceCountDice()
    },
    // 设置骰子坐标
    addDiceList(dice, angle, tempList) {
        let list = this.data.diceList
        list.push({
            diceStyle: `width:${this.data.diceWidth}rpx;height:${this.data.diceWidth}rpx;top:${tempList.top}rpx;left:${tempList.left}rpx;transform:rotate(${30 * angle}deg)`,
            diceImg: `../../static/images/0${dice +1}.png`,
            dice: dice
        })
        this.setData({
            diceList: list
        })

    },
    //统计当前局数量
    diceCountDice() {
        this.setData({
            one: 0,
            two: 0,
            thr: 0,
            fou: 0,
            fiv: 0,
            six: 0
        })
        let sum = 0
        this.data.diceList.forEach(e => {
            sum = sum + e.dice + 1
            switch (e.dice) {
                case 0:
                    let one = this.data.one + 1
                    this.setData({
                        one: one
                    })
                    break;
                case 1:
                    let two = this.data.two + 1
                    this.setData({
                        two: two
                    })
                    break;
                case 2:
                    let thr = this.data.thr + 1
                    this.setData({
                        thr: thr
                    })
                    break;
                case 3:
                    let fou = this.data.fou + 1
                    this.setData({
                        fou: fou
                    })
                    break;
                case 4:
                    let fiv = this.data.fiv + 1
                    this.setData({
                        fiv: fiv
                    })
                    break;
                case 5:
                    let six = this.data.six + 1
                    this.setData({
                        six: six
                    })
                    break;
            }
        })
        this.setData({
            total: sum
        })

    },

    //历史记录相关的js
    showModal() {
        this.setData({
            hideModal: false
        })
        setTimeout(() => {
            this.fadeIn()
        }, 200)
    },
    hideModal() {
        this.fadeDown(); //调用隐藏动画 
        setTimeout(() => {
            this.setData({
                hideModal: true
            })
        }, 200) //先执行下滑动画，再隐藏模块
    },
    fadeIn() {
        let animation = wx.createAnimation({
            duration: 300,
            timingFunction: 'ease'
        })
        this.animation = animation
        this.animation.translateY(0).step()
        this.setData({
            animationData: this.animation.export()
        })

    },
    fadeDown() {
        let animation = wx.createAnimation({
            duration: 300,
            timingFunction: 'ease'
        })
        this.animation = animation
        this.animation.translateY(650).step()
        this.setData({
            animationData: this.animation.export()
        })
    },
    bindtapSetting() {
        let animation = wx.createAnimation({
            duration: 300,
            timingFunction: 'ease'
        })
        this.animationSet = animation
        this.setData({
            hideSetiingModal: false
        })
        setTimeout(() => {
            this.animationSet.opacity(1).step()
            this.setData({
                animationSetting: this.animationSet.export()
            })
        }, 200)
    },
    getTime(e) {
        const date = new Date(e)
        const M = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        const H = ('0' + date.getHours()).slice(-2);
        const m = ('0' + date.getMinutes()).slice(-2);
        const s = ('0' + date.getSeconds()).slice(-2);
        console.log(`${M}/${day} ${H}:${m}:${s}`);
        return `${M}/${day} ${H}:${m}:${s}`
    },
    hideSetiingModal() {
        let animation = wx.createAnimation({
            duration: 300,
            timingFunction: 'ease'
        })
        this.animationSet = animation
        this.animationSet.opacity(0).step()
        this.setData({
            animationSetting: this.animationSet.export(),
        })
        setTimeout(() => {
            this.setData({
                hideSetiingModal: true
            })
        }, 200)
    },
    bindVibrateLong() {
        this.setData({
            vibrateLong: !this.data.vibrateLong
        })
        wx.setStorageSync('vibrateLong', Number(this.data.vibrateLong))
    },
    bindmusic() {
        this.setData({
            isMusic: !this.data.isMusic
        })
        wx.setStorageSync('isMusic', Number(this.data.isMusic))
    },
    addDiceCount() {
        if (this.data.diceCount >= 50) {
            return wx.showToast({
                title: '最多只能设置50个哟',
                icon: 'none',
                duration: 2000
            })
        }
        this.setData({
            diceCount: this.data.diceCount + 1
        })
        wx.setStorageSync('diceCount', this.data.diceCount)
    },
    minusDiceCount() {
        if (this.data.diceCount <= 2) {
            return wx.showToast({
                title: '最少必须设置2个哟',
                icon: 'none',
                duration: 2000
            })
        }
        this.setData({
            diceCount: this.data.diceCount - 1
        })
        wx.setStorageSync('diceCount', this.data.diceCount)
    },
    //侦听用户陀螺仪以便开始游戏
    watchOnGyroscopeChange() {
        wx.onGyroscopeChange((res) => {
            let nowRange = Math.abs(res.x) + Math.abs(res.x) + Math.abs(res.x);
            if (nowRange > 10) {
                console.log(nowRange);
                this.setData({
                    shakeState: true
                })
            }
            if (this.data.shakeState) {
                // this.stop()
                this.setData({
                    shakeState: false
                })
                this.bindtapStartFn()
            }
        })
        wx.startGyroscope({
            interval: "normal"
        })
    },
    //停止监听陀螺仪
    stop() {
        wx.stopGyroscope({})
    },
    bindShakeFn() {
        this.setData({
            shakeStatus: !this.data.shakeStatus
        })
        if(this.data.shakeStatus){
            this.watchOnGyroscopeChange()
        }else{
            this.stop()
        }
        wx.setStorageSync('shakeStatus', this.data.shakeStatus)
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {},
    onunload() {
        innerAudioContext.stroy()
    }
})