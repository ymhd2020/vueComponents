/*
 * @Author: ymhd 
 * @Date: 2020-11-30 17:16:29 
 * @Last Modified by: ymhd
 * @Describe: 搜索框组件
 * @Last Modified time: 2020-12-01 15:25:24
 */

//  搜索框区域
Vue.component('ym-search', {
    template: `
        <div class="ym-search-area-wrap" ref="searchWrap" :class="{'show-result': showResult}">
            <div class="ym-search-area" :style="{'height': searchHeight}" v-show="!showResult">
                <slot></slot>
                <div class="ym-high-btn-area">
                    <el-button type="primary" size="small" @click="toSearch(1)">搜索</el-button>      
                    <el-button type="default" size="small" @click="cleanAll">清空</el-button>   
                    <div class="ym-slide-up" @click="slideUp"><i class="el-icon-arrow-up"></i>收起</div>
                </div>
                <div class="ym-search-btn-area" :class="{'hide': hideBtn}">
                    <el-button type="primary" size="small" @click="toSearch(0)">搜索</el-button>
                    <el-button v-show="showHighBtn" size="small" @click="toHighSearch">高级搜索</el-button>
                </div>
            </div>
            <div class="ym-search-result ym-flex-row" v-show="showResult">
                <div class="flex-item" v-for="item in results">{{item.name}}：{{item.value}}</div>
                <div class="results-options" @click="showSearch">
                    <i class="el-icon-arrow-down"></i>展开
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            searchHeight: '52px', // 搜索框的默认高度52
            showHighBtn: false, // 是否显示“高级搜索”按钮
            hideBtn: false,  // 隐藏“搜索”按钮与“高级搜索”按钮
            showResult: false, // 搜索完成后是否显示搜索结果
        }
    },
    props: {
        // 搜索元素的个数
        itemNum: {
            type: Number,
            default: 1
        },
        // 搜索后要显示的结果集合
        results: {
            type: Array,
            default: ()=>[]
        }
    },
    watch: {
        // 页面初始化时需要默认一些条件
        results(val) {
            this.$nextTick(()=>{
                if((val.length > 0) && this.showHighBtn) {
                    this.showResult = true
                }
            })
        }
    },
    mounted() {
        // 根据搜索框的宽度以及搜索元素的宽度，计算是否显示“高级搜索”按钮
        this.$nextTick(() => {
            let wrapW = +window.getComputedStyle(this.$refs.searchWrap).width.replace('px', ''),
                itemW = 322,
                btnW = 180,
                n = Math.floor((wrapW - btnW) / itemW)
            if (this.itemNum > n) {
                this.showHighBtn = true
            }
        })
    },
    methods: {
        // 清空
        cleanAll() {
            this.$emit('clear')
        },
        // 搜索
        toSearch(tag) {
            this.$emit('search')
            this.$nextTick(() => {
                // 如果是高级中的搜索按钮，点击后显示搜索内容
                if (+tag === 1) {
                    if (this.results.length > 0) {
                        this.showResult = true
                    } else {
                        this.searchHeight = '52px'
                        this.hideBtn = false
                    }
                }
            })
        },
        showSearch() {
            this.showResult = false
            if (this.results.length > 0) {
                this.searchHeight = 'auto'
                this.hideBtn = true
            }
        },
        // 显示高级搜索内容
        toHighSearch() {
            this.searchHeight = 'auto'
            this.hideBtn = true
        },
        // 收起
        slideUp() {
            if (this.results.length > 0) {
                this.showResult = true
            } else {
                this.searchHeight = '52px'
                this.hideBtn = false
            }
        }
    }
})
// 根据searchBaseData和searchData组装显示results和请求数据request
function packageRequestAndResults(searchData) {
    let results = [] // 搜索结果展示
    let request = {} // 用于请求接口数据
    Object.keys(searchData).forEach(k => {
        let string_empty = Object.prototype.toString.apply(searchData[k]) === '[object String]' && searchData[k] === '',
            array_empty = Object.prototype.toString.apply(searchData[k]) === '[object Array]' && searchData[k].length === 0
        if (!string_empty && !array_empty && !!searchData[k]) {
            let obj = searchBaseData[k],
                name = ''
            if (!!obj) {
                if (obj.type === 'input') {
                    name = searchData[k]
                    request[k] = searchData[k]
                } else if (obj.type === 'date') {
                    name = searchData[k][0] + ' ~ ' + searchData[k][1]
                    request['START' + k] = searchData[k][0]
                    request['END' + k] = searchData[k][1]
                } else {
                    name = obj.getName(searchData[k])
                    request[k] = obj.getVal(searchData[k])
                }
                results.push({
                    name: obj.name,
                    value: name
                })
            }
        }
    })
    return {
        results,
        request
    }
}
Vue.mixin({
    data() {
        return {
            // 所有的搜索属性v-model集合
            searchData: {},
            // 搜索结果--用于展示
            searchResults: [],
            // 搜索属性请求数据集合
            requestData: {},
        }
    },
    methods: {
        toSearch() {
            if(!!this.toSearchBefore) {
                this.toSearchBefore.apply(this, arguments)
            }
            let {
                results,
                request
            } = packageRequestAndResults(this.searchData)
            this.searchResults = results
            this.requestData = request
            this.pageChange(1)
            if(!!this.toSearchAfter) {
                this.toSearchAfter.apply(this, arguments)
            }
        },
        clearSearch() {
            this.searchData = {}
            this.requestData = {}
            this.searchResults = []
        }
    }
})