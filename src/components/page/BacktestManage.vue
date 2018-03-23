<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-star-on"></i> 回测管理</el-breadcrumb-item>
                <el-breadcrumb-item>回测列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="handle-box rad-group">
            <el-button type="primary" icon="plus" class="handle-del mr10" @click="dialogFormVisible=true">创建交易策略</el-button>
        </div>
        <el-table :data="backtest_list" border style="width: 100%" ref="multipleTable" v-loading="loading">
            <el-table-column prop="strategy_name" label="策略名称" width="250"></el-table-column>
            <el-table-column prop="profit_rate" label="总收益率" width="400"></el-table-column>
            <el-table-column prop="retreat_rate" label="最大回撤率" width="400"></el-table-column>
            <el-table-column prop="comment" label="备注" width="400"></el-table-column>
        </el-table>

        <el-dialog title="添加交易策略" :visible.sync="dialogFormVisible" class="digcont">
            <el-form :model="form" :rules="rules" ref="form">
                <el-form-item label="策略名称" prop=strategy_name :label-width="formLabelWidth">
                    <el-input v-model="form.strategy_name" class="diainp" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="股票代码" prop="symbol" :label-width="formLabelWidth">
                    <el-input v-model="form.symbol" class="diainp" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="开始日期" prop="date_start" :label-width="formLabelWidth">
                    <el-input v-model="form.date_start" class="diainp" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="结束日期" prop="date_end" :label-width="formLabelWidth">
                    <el-input v-model="form.date_end" class="diainp" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveAdd('form')"v-loading.fullscreen.lock="fullscreenLoading">添 加</el-button>
            </div>
        </el-dialog>

        <!--为echarts准备一个具备大小的容器dom-->
        <div id="myChart" :style="{width: '1000px', height: '1000px'}"></div>
    </div>
</template>

<script>
    //import global_ from 'components/common/Global';
    import echarts from 'echarts';
    // 引入柱状图组件
    require('echarts/lib/chart/bar')
    var upColor = '#00da3c';
    var downColor = '#ec0000';

    export default {
        data: function(){
            return {
// 数据意义：开盘(open)，收盘(close)，最低(lowest)，最高(highest)
                data0 : [
                    ['2013/1/24', 2320.26,2320.26,2287.3,2362.94],
                    ['2013/1/25', 2300,2291.3,2288.26,2308.38],
                    ['2013/1/28', 2295.35,2346.5,2295.35,2346.92],
                    ['2013/1/29', 2347.22,2358.98,2337.35,2363.8],
                    ['2013/1/30', 2360.75,2382.48,2347.89,2383.76],
                    ['2013/1/31', 2383.43,2385.42,2371.23,2391.82],
                    ['2013/2/1', 2377.41,2419.02,2369.57,2421.15],
                    ['2013/2/4', 2425.92,2428.15,2417.58,2440.38],
                    ['2013/2/5', 2411,2433.13,2403.3,2437.42],
                    ['2013/2/6', 2432.68,2434.48,2427.7,2441.73],
                    ['2013/2/7', 2430.69,2418.53,2394.22,2433.89],
                    ['2013/2/8', 2416.62,2432.4,2414.4,2443.03],
                    ['2013/2/18', 2441.91,2421.56,2415.43,2444.8],
                    ['2013/2/19', 2420.26,2382.91,2373.53,2427.07],
                    ['2013/2/20', 2383.49,2397.18,2370.61,2397.94],
                    ['2013/2/21', 2378.82,2325.95,2309.17,2378.82],
                    ['2013/2/22', 2322.94,2314.16,2308.76,2330.88],
                    ['2013/2/25', 2320.62,2325.82,2315.01,2338.78],
                    ['2013/2/26', 2313.74,2293.34,2289.89,2340.71],
                    ['2013/2/27', 2297.77,2313.22,2292.03,2324.63],
                    ['2013/2/28', 2322.32,2365.59,2308.92,2366.16],
                    ['2013/3/1', 2364.54,2359.51,2330.86,2369.65],
                    ['2013/3/4', 2332.08,2273.4,2259.25,2333.54],
                    ['2013/3/5', 2274.81,2326.31,2270.1,2328.14],
                    ['2013/3/6', 2333.61,2347.18,2321.6,2351.44],
                    ['2013/3/7', 2340.44,2324.29,2304.27,2352.02],
                    ['2013/3/8', 2326.42,2318.61,2314.59,2333.67],
                    ['2013/3/11', 2314.68,2310.59,2296.58,2320.96],
                    ['2013/3/12', 2309.16,2286.6,2264.83,2333.29],
                    ['2013/3/13', 2282.17,2263.97,2253.25,2286.33],
                    ['2013/3/14', 2255.77,2270.28,2253.31,2276.22],
                    ['2013/3/15', 2269.31,2278.4,2250,2312.08],
                    ['2013/3/18', 2267.29,2240.02,2239.21,2276.05],
                    ['2013/3/19', 2244.26,2257.43,2232.02,2261.31],
                    ['2013/3/20', 2257.74,2317.37,2257.42,2317.86],
                    ['2013/3/21', 2318.21,2324.24,2311.6,2330.81],
                    ['2013/3/22', 2321.4,2328.28,2314.97,2332],
                    ['2013/3/25', 2334.74,2326.72,2319.91,2344.89],
                    ['2013/3/26', 2318.58,2297.67,2281.12,2319.99],
                    ['2013/3/27', 2299.38,2301.26,2289,2323.48],
                    ['2013/3/28', 2273.55,2236.3,2232.91,2273.55],
                    ['2013/3/29', 2238.49,2236.62,2228.81,2246.87],
                    ['2013/4/1', 2229.46,2234.4,2227.31,2243.95],
                    ['2013/4/2', 2234.9,2227.74,2220.44,2253.42],
                    ['2013/4/3', 2232.69,2225.29,2217.25,2241.34],
                    ['2013/4/8', 2196.24,2211.59,2180.67,2212.59],
                    ['2013/4/9', 2215.47,2225.77,2215.47,2234.73],
                    ['2013/4/10', 2224.93,2226.13,2212.56,2233.04],
                    ['2013/4/11', 2236.98,2219.55,2217.26,2242.48],
                    ['2013/4/12', 2218.09,2206.78,2204.44,2226.26],
                    ['2013/4/15', 2199.91,2181.94,2177.39,2204.99],
                    ['2013/4/16', 2169.63,2194.85,2165.78,2196.43],
                    ['2013/4/17', 2195.03,2193.8,2178.47,2197.51],
                    ['2013/4/18', 2181.82,2197.6,2175.44,2206.03],
                    ['2013/4/19', 2201.12,2244.64,2200.58,2250.11],
                    ['2013/4/22', 2236.4,2242.17,2232.26,2245.12],
                    ['2013/4/23', 2242.62,2184.54,2182.81,2242.62],
                    ['2013/4/24', 2187.35,2218.32,2184.11,2226.12],
                    ['2013/4/25', 2213.19,2199.31,2191.85,2224.63],
                    ['2013/4/26', 2203.89,2177.91,2173.86,2210.58],
                    ['2013/5/2', 2170.78,2174.12,2161.14,2179.65],
                    ['2013/5/3', 2179.05,2205.5,2179.05,2222.81],
                    ['2013/5/6', 2212.5,2231.17,2212.5,2236.07],
                    ['2013/5/7', 2227.86,2235.57,2219.44,2240.26],
                    ['2013/5/8', 2242.39,2246.3,2235.42,2255.21],
                    ['2013/5/9', 2246.96,2232.97,2221.38,2247.86],
                    ['2013/5/10', 2228.82,2246.83,2225.81,2247.67],
                    ['2013/5/13', 2247.68,2241.92,2231.36,2250.85],
                    ['2013/5/14', 2238.9,2217.01,2205.87,2239.93],
                    ['2013/5/15', 2217.09,2224.8,2213.58,2225.19],
                    ['2013/5/16', 2221.34,2251.81,2210.77,2252.87],
                    ['2013/5/17', 2249.81,2282.87,2248.41,2288.09],
                    ['2013/5/20', 2286.33,2299.99,2281.9,2309.39],
                    ['2013/5/21', 2297.11,2305.11,2290.12,2305.3],
                    ['2013/5/22', 2303.75,2302.4,2292.43,2314.18],
                    ['2013/5/23', 2293.81,2275.67,2274.1,2304.95],
                    ['2013/5/24', 2281.45,2288.53,2270.25,2292.59],
                    ['2013/5/27', 2286.66,2293.08,2283.94,2301.7],
                    ['2013/5/28', 2293.4,2321.32,2281.47,2322.1],
                    ['2013/5/29', 2323.54,2324.02,2321.17,2334.33],
                    ['2013/5/30', 2316.25,2317.75,2310.49,2325.72],
                    ['2013/5/31', 2320.74,2300.59,2299.37,2325.53],
                    ['2013/6/3', 2300.21,2299.25,2294.11,2313.43],
                    ['2013/6/4', 2297.1,2272.42,2264.76,2297.1],
                    ['2013/6/5', 2270.71,2270.93,2260.87,2276.86],
                    ['2013/6/6', 2264.43,2242.11,2240.07,2266.69],
                    ['2013/6/7', 2242.26,2210.9,2205.07,2250.63],
                    ['2013/6/13', 2190.1,2148.35,2126.22,2190.1]
                ],

                form: {
                    strategy_name:'',
                    symbol:'002500',
                    date_start:'2017-12-08 9:30',
                    date_end:'2018-2-08 9:30',
                    file_name:'',
                    alias_name:'',
                    comment:''
                },
                rules: {
                    alias_name:[
                        {required: true, message: '请输入ROM版本号', trigger: 'blur'}
                    ]
                },
                formLabelWidth: '120px',
                loading:false,
                dialogFormVisible:false,
                fullscreenLoading: false,
                upload_filelist: [],
                backtest_list:[],
                strategy_file_list:[],

                pageTotal:0,
                currentPage:1
            }
        },
        mounted() {
            this.drawLine();
        },
        created: function(){
            this.getStrategyList();
        },
        methods: {

            splitData :function (rawData) {

                var categoryData = [];
                var values = [];
                var volumes = [];
                for (var i = 0; i < rawData.length; i++) {
                    categoryData.push(rawData[i][0]);
                    rawData[i].splice(0, 1);
                    values.push(rawData[i]);
                    volumes.push([i, rawData[i][4], rawData[i][0] > rawData[i][1] ? 1 : -1]);
                }

                return {
                    categoryData: categoryData,
                    values: values,
                    volumes: volumes
                };
                //console.log('----------', categoryData);
                //this.$message(categoryData[0]);
                //this.backtest_list[0]['strategy_name'] = categoryData[0];
            },

            calculateMA:function (dayCount, data) {
                var result = [];
                for (var i = 0, len = data.values.length; i < len; i++) {
                    if (i < dayCount) {
                        result.push('-');
                        continue;
                    }
                    var sum = 0;
                    for (var j = 0; j < dayCount; j++) {
                        sum += data.values[i - j][1];
                    }
                    result.push(+(sum / dayCount).toFixed(3));
                }
                return result;
            },
            drawLine :function (rawData) {
                this.displayData(this.data0);
            },
            displayData:function (rawData) {
                var data = this.splitData(rawData);

                // 基于准备好的dom，初始化echarts实例
                var myChart = echarts.init(document.getElementById('myChart'));

                var option = {
                    backgroundColor: '#fff',
                    animation: false,
                    legend: {
                        bottom: 10,
                        left: 'center',
                        data: ['Dow-Jones index', 'MA5', 'MA10', 'MA20', 'MA30']
                    },
                    /*
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross'
                        },
                        backgroundColor: 'rgba(245, 245, 245, 0.8)',
                        borderWidth: 1,
                        borderColor: '#ccc',
                        padding: 10,
                        textStyle: {
                            color: '#000'
                        },
                        position: function (pos, params, el, elRect, size) {
                            var obj = {top: 10};
                            obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                            return obj;
                        }
                        // extraCssText: 'width: 170px'
                    },
                    */
                    axisPointer: {
                        link: {xAxisIndex: 'all'},
                        label: {
                            backgroundColor: '#777'
                        }
                    },
                    toolbox: {
                        feature: {
                            dataZoom: {
                                yAxisIndex: false
                            },
                            brush: {
                                type: ['lineX', 'clear']
                            }
                        }
                    },
                    brush: {
                        xAxisIndex: 'all',
                        brushLink: 'all',
                        outOfBrush: {
                            colorAlpha: 0.1
                        }
                    },
                    visualMap: {
                        show: false,
                        seriesIndex: 5,
                        dimension: 2,
                        pieces: [{
                            value: 1,
                            color: downColor
                        }, {
                            value: -1,
                            color: upColor
                        }]
                    },
                    grid: [
                        {
                            left: '10%',
                            right: '8%',
                            height: '50%'
                        },
                        {
                            left: '10%',
                            right: '8%',
                            top: '63%',
                            height: '16%'
                        }
                    ],
                    xAxis: [
                        {
                            type: 'category',
                            data: data.categoryData,
                            scale: true,
                            boundaryGap : false,
                            axisLine: {onZero: false},
                            splitLine: {show: false},
                            splitNumber: 20,
                            min: 'dataMin',
                            max: 'dataMax',
                            axisPointer: {
                                z: 100
                            }
                        },
                        {
                            type: 'category',
                            gridIndex: 1,
                            data: data.categoryData,
                            scale: true,
                            boundaryGap : false,
                            axisLine: {onZero: false},
                            axisTick: {show: false},
                            splitLine: {show: false},
                            axisLabel: {show: false},
                            splitNumber: 20,
                            min: 'dataMin',
                            max: 'dataMax'
                            // axisPointer: {
                            //     label: {
                            //         formatter: function (params) {
                            //             var seriesValue = (params.seriesData[0] || {}).value;
                            //             return params.value
                            //             + (seriesValue != null
                            //                 ? '\n' + echarts.format.addCommas(seriesValue)
                            //                 : ''
                            //             );
                            //         }
                            //     }
                            // }
                        }
                    ],
                    yAxis: [
                        {
                            scale: true,
                            splitArea: {
                                show: true
                            }
                        },
                        {
                            scale: true,
                            gridIndex: 1,
                            splitNumber: 2,
                            axisLabel: {show: false},
                            axisLine: {show: false},
                            axisTick: {show: false},
                            splitLine: {show: false}
                        }
                    ],
                    dataZoom: [
                        {
                            type: 'inside',
                            xAxisIndex: [0, 1],
                            start: 98,
                            end: 100
                        },
                        {
                            show: true,
                            xAxisIndex: [0, 1],
                            type: 'slider',
                            top: '85%',
                            start: 98,
                            end: 100
                        }
                    ],
                    series: [
                        {
                            name: 'Dow-Jones index',
                            type: 'candlestick',
                            data: data.values,
                            itemStyle: {
                                normal: {
                                    color: upColor,
                                    color0: downColor,
                                    borderColor: null,
                                    borderColor0: null
                                }
                            },
                            tooltip: {
                                formatter: function (param) {
                                    param = param[0];
                                    return [
                                        'Date: ' + param.name + '<hr size=1 style="margin: 3px 0">',
                                        'Open: ' + param.data[0] + '<br/>',
                                        'Close: ' + param.data[1] + '<br/>',
                                        'Lowest: ' + param.data[2] + '<br/>',
                                        'Highest: ' + param.data[3] + '<br/>'
                                    ].join('');
                                }
                            }
                        },
                        {
                            name: 'MA5',
                            type: 'line',
                            data: this.calculateMA(5, data),
                            smooth: true,
                            lineStyle: {
                                normal: {opacity: 0.5}
                            }
                        },
                        {
                            name: 'MA10',
                            type: 'line',
                            data: this.calculateMA(10, data),
                            smooth: true,
                            lineStyle: {
                                normal: {opacity: 0.5}
                            }
                        },
                        {
                            name: 'MA20',
                            type: 'line',
                            data: this.calculateMA(20, data),
                            smooth: true,
                            lineStyle: {
                                normal: {opacity: 0.5}
                            }
                        },
                        {
                            name: 'MA30',
                            type: 'line',
                            data: this.calculateMA(30, data),
                            smooth: true,
                            lineStyle: {
                                normal: {opacity: 0.5}
                            }
                        },
                        {
                            name: 'Volume',
                            type: 'bar',
                            xAxisIndex: 1,
                            yAxisIndex: 1,
                            data: data.volumes
                        }
                    ]
                };

                myChart.setOption(option, true);
                // myChart.on('brushSelected', renderBrushed);

                // function renderBrushed(params) {
                //     var sum = 0;
                //     var min = Infinity;
                //     var max = -Infinity;
                //     var countBySeries = [];
                //     var brushComponent = params.brushComponents[0];

                //     var rawIndices = brushComponent.series[0].rawIndices;
                //     for (var i = 0; i < rawIndices.length; i++) {
                //         var val = data.values[rawIndices[i]][1];
                //         sum += val;
                //         min = Math.min(val, min);
                //         max = Math.max(val, max);
                //     }

                //     panel.innerHTML = [
                //         '<h3>STATISTICS:</h3>',
                //         'SUM of open: ' + (sum / rawIndices.length).toFixed(4) + '<br>',
                //         'MIN of open: ' + min.toFixed(4) + '<br>',
                //         'MAX of open: ' + max.toFixed(4) + '<br>'
                //     ].join(' ');
                // }

                myChart.dispatchAction({
                    type: 'brush',
                    areas: [
                        {
                            brushType: 'lineX',
                            coordRange: ['2016-06-02', '2016-06-20'],
                            xAxisIndex: 0
                        }
                    ]
                });
            },


            getStrategyList: function(){//获取rom列表
                var self = this;
                var params = {
                    code:self.form.symbol,
                    date_start:self.form.date_start,
                    date_end:self.form.date_end,
                }

                /*
                self.loading = true;
                self.$axios.post('/api/history/data', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.pageTotal = res.data.extra.length;
                        self.strategy_file_list = res.data.extra.slice(0,10);
                        //self.displayData(data0);
                    }
                    else{
                        self.strategy_file_list = [];
                        console.log('resp:', res.data);
                    }
                });
                */
            },
            saveAdd: function(formName){
                var self = this;

            },
            beforeUpload: function(file){
                console.log(file);
                this.form.file_name = file.name;
                return true;
            },
            handleSuccess: function(response,file,fileList){
                console.log(response);
                this.fullscreenLoading  = false;
                this.$message('创建成功');
                this.dialogFormVisible = false;
                this.getStrategyList();
            },
            handleCurrentChange:function(val){
                this.cur_page = val;
                this.getStrategyList();
            },

        },
        computed:{

        }
    }
</script>

<style src="../../../static/css/datasource.css"></style>
<style>
    .rad-group{margin-bottom:20px;}
    .handle-input{  width: 300px;  display: inline-block;  }
    .handle-box2{display:inline-block;float:right;}
    /*.el-table_1_column_5{color:#eb9e05;}*/
    .orange{color:#eb9e05;background-color:none;}
    .btn2{margin-bottom:5px;margin-left:0;}
    .diainp{width:217px;}
    .diainp2{width:400px;}
    .upload-demo .el-upload {
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }
    .upload-demo .el-upload:hover {
        border-color: #409EFF;
    }
</style>
