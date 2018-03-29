<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-upload"></i> 批量执行任务</el-breadcrumb-item>
                <el-breadcrumb-item>推送结果</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="form-box tab-cont form-box2">
            <el-form :model="form" :rules="rules0" ref="form" label-width="150px">
                <el-form-item label="股票代码">
                    <el-input v-model="form.stock_symbol" class="inp180" auto-complete="off" placeholder="请输入股票代码" @change="changeStockSymbol()"></el-input>
                    <span v-text="form.stock_name"></span>
                </el-form-item>
                <el-form-item label="K 线周期">
                    <el-select v-model="form.stock_ktype" class="inp180" placeholder="请选择K线周期">
                        <el-option label="1分钟" value="1"></el-option>
                        <el-option label="5分钟" value="5"></el-option>
                        <el-option label="15分钟" value="15"></el-option>
                        <el-option label="30分钟" value="30"></el-option>
                        <el-option label="60分钟" value="60"></el-option>
                        <el-option label="120分钟" value="120"></el-option>
                        <el-option label="日线" value="day"></el-option>
                        <el-option label="周线" value="week"></el-option>
                        <el-option label="月线" value="month"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="回测时间" prop="backtest_time">
                    <el-date-picker
                        v-model="form.backtest_time"
                        type="daterange"
                        align="left"
                        unlink-panels
                        range-separator=" 至 "
                        start-placeholder="开始日期 "
                        end-placeholder="结束日期 "
                        :picker-options="pickerOptions2">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="选择策略" prop="strategy_name">
                    <el-select v-model="form.strategy_name" class="inp180" placeholder="请选择对应策略">
                        <el-option
                            v-for="item in strategy_file_list"
                            :key="item"
                            :label="item"
                            :value="item">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onBacktestSubmit('form')" v-loading.fullscreen.lock="fullscreenLoading">开始回测 </el-button>
                </el-form-item>

            </el-form>
        </div>

        <el-table :data="backtest_result_list" border style="width: 100%" ref="multipleTable" v-loading="loading" v-if="result_show==true">
            <el-table-column type="index" label="ID" width="60"></el-table-column>
            <el-table-column prop="trade_symbol" label="股票代码" width="100"></el-table-column>
            <el-table-column prop="symbol_name" label="股票名称" width="100"></el-table-column>
            <el-table-column prop="trade_ktype" label="K线类型" width="100"></el-table-column>
            <el-table-column prop="strategy_name" label="交易策略" width="160"></el-table-column>
            <el-table-column prop="order_point_at" label="买卖点时间" width="180"></el-table-column>
            <el-table-column prop="order_type" label="买卖点类型" width="160"></el-table-column>
            <el-table-column prop="trade_price" label="交易价格" width="100"></el-table-column>
            <el-table-column prop="trade_amount" label="交易数量" width="100"></el-table-column>
            <el-table-column prop="profit_rate" label="收益率" width="100"></el-table-column>
            <el-table-column prop="max_retracement" label="最大回撤率" width="120"></el-table-column>
        </el-table>
        <div class="pagination" v-if="result_show==true">
            <el-pagination
                @current-change ="handleCurrentChange"
                :current-page="currentPage"
                layout="prev, pager, next"
                :total="pageTotal">
            </el-pagination>
        </div>

    </div>
</template>

<script>
    import global_ from 'components/common/Global';
    export default {
        data: function(){
            const self = this;
            return {
                pickerOptions2: {
                    shortcuts: [{
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                            picker.$emit('pick', [start, end]);
                        }
                    }]
                },
                value4: '',
                form: {
                    backtest_time: '',
                    operator_name: '',
                    strategy_name:'',
                    stock_symbol:'',
                    stock_ktype:'',
                    stock_name:''
                },
                curRadio:'firmware',
                loading:true,
                result_show : false,
                search_word:'',
                strategy_file_list:[],
                backtest_result_list:[],

                pageTotal:0,
                currentPage:1,
            }
        },
        created:function(){
            //this.getFirmwareData({});
            this.getStrategyList();
        },
        methods: {
            getStrategyList: function(){//获取rom列表
                var self = this;
                self.loading = true;
                self.$axios.post('/api/strategy/list').then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.strategy_file_list = res.data.extra;
                    }
                    else{
                        console.log('resp:', res.data)
                    }
                })
            },

            changeStockSymbol:function(index) {

                var stock_symbol = this.form.stock_symbol;
                //获取stock_symbol  对应的名称
                if (stock_symbol.length != 6){
                    this.form.stock_name = '';
                    return;
                }
                var self = this;
                var params = '';
                if (stock_symbol[0] == '6') {
                    params = '/sina/list=' + 'sh' + stock_symbol;
                }else{
                    params = '/sina/list=' + 'sz' + stock_symbol;
                }
                self.$axios.get(params).then(function(res){
                    var data_substr = res.data.match(/\"(\S*)(?=\")/);
                    if (data_substr == null) {
                        return;
                    }
                    var fields = data_substr[1].split(",");
                    self.form.stock_name = fields[0];

                },function(err){
                    self.form.stock_name = '';
                    console.log(err);
                })

            },
            handleCurrentChange:function(val){
                var self = this;
                self.currentPage = val;
                var params = {
                    page_size:10,current_page:this.currentPage
                };
            },
            onBacktestSubmit: function(){

                var self = this;
                var params = {
                    strategy_name:this.form.strategy_name,
                    stock_symbol:this.form.stock_symbol,
                    stock_ktype:this.form.stock_ktype,
                    stock_name:this.form.stock_name,
                    backtest_time:this.form.backtest_time,
                };
                self.loading = true;
                self.$axios.post('/api/backtest/start', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.backtest_result_list = res.data.extra;
                        this.result_show = true;
                    }
                    else{
                        console.log('resp:', res.data)
                    }
                })

            },
            search: function(){
                var self = this;
                if(self.search_word == ''){
                    self.$message({message:'输入不能为空',type:'warning'});
                    return false;
                }


            },
            goDetail: function(id){
                this.$router.push({path:'/pushresultdetail',query:{curid:id,curRadio:this.curRadio}});
            }
        },
    }
</script>
<style>
    .demo-table-expand {  font-size: 0;  }
    .demo-table-expand label {  width: 90px;  color: #99a9bf;}
    .demo-table-expand .el-form-item {  margin-right: 0;  margin-bottom: 0;  width: 33%;  }
    .rad-group{margin-bottom:20px;}
    .handle-input{  width: 300px;  display: inline-block;  }
    .handle-box2{display:inline-block;float:right;}
    .pagecont{margin-top:30px;}
    .inp180{width:180px;}
</style>
