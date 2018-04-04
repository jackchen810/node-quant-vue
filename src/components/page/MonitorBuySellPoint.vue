<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-upload"></i> 交易任务管理</el-breadcrumb-item>
                <el-breadcrumb-item>买卖点统计</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <el-table :data="result_list" border style="width: 100%" ref="multipleTable" v-loading="loading">
            <el-table-column type="index" label="ID" width="60"></el-table-column>
            <el-table-column prop="trade_symbol" label="股票代码" width="100"></el-table-column>
            <el-table-column prop="symbol_name" label="股票名称" width="100"></el-table-column>
            <el-table-column prop="trade_ktype" label="K线类型" width="100"></el-table-column>
            <el-table-column prop="strategy_name" label="交易策略" width="160"></el-table-column>
            <el-table-column prop="order_point_at" label="买卖点时间" width="180"></el-table-column>
            <el-table-column prop="order_type" label="买卖点类型" width="160"></el-table-column>
        </el-table>
        <div class="pagination">
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
                search_word:'',
                result_list:[],

                loading:true,

                pageTotal:1,
                currentPage:1,
                page_size:10

            }
        },
        created:function(){
            this.getTradePointList(1, this.page_size);
            this.getTradePointListLength();
        },
        methods: {
            getTradePointListLength: function(){//获取task列表
                var self = this;
                var params = {
                    stock_symbol: this.form.stock_symbol,
                    stock_ktype: this.form.stock_ktype,
                };
                self.loading = true;
                self.$axios.post('/api/trade/point/list/length', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.pageTotal = res.data.extra;
                    }
                })
            },
            getTradePointList: function(current_page, page_size){//获取backtest task列表
                var self = this;
                var params = {
                    filter: {task_id: self.getTaskId},
                    page_size: page_size,
                    current_page: current_page,
                };
                self.loading = true;
                self.$axios.post('/api/trade/point/list', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.result_list = res.data.extra.slice(0,10);
                    }
                    else{
                        self.result_list = [];
                    }
                })
            },
            handleCurrentChange:function(val){
                this.currentPage = val;
                this.getTradePointList(this.currentPage, this.page_size);
            },
        },
        computed:{
            getTaskId(){
                //因为在main.js中已经全局注册了store，所以这里直接用this.$直接使用。
                return this.$route.params.task_id;
            }
        }
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
</style>
