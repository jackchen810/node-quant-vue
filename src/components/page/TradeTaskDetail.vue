<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-star-on"></i>TASK管理</el-breadcrumb-item>
                <el-breadcrumb-item>TASK详情</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="handle-box rad-group">
            <h4 v-if="strategy_type == 1">任务类型: 简单策略</h4>
            <h4 v-else-if="strategy_type == 2">任务类型: 多级别分析策略</h4>
            <h4 v-else-if="strategy_type == 3">任务类型: 综合分析策略</h4>
        </div>
        <hr style="margin-bottom:40px;height:1px;border:none;border-top:1px solid #ddd;">
        <el-table :data="task_list" border style="width: 100%" ref="multipleTable" v-loading="loading">
            <el-table-column type="index" label="ID" width="60"></el-table-column>
            <el-table-column prop="task_type" label="任务类型"></el-table-column>
            <el-table-column prop="trade_ktype" label="K线类型"></el-table-column>
            <el-table-column prop="strategy_name" label="策略标的" width="180"></el-table-column>
            <el-table-column prop="riskctrl_name" label="风控名称" width="180"></el-table-column>
            <el-table-column prop="order_gateway" label="交易接口" width="180"></el-table-column>
            <el-table-column prop="trade_symbol" label="交易标的"></el-table-column>
            <el-table-column prop="task_status" label="运行状态"></el-table-column>
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
    //import global_ from 'components/common/Global';
    export default {
        data: function(){
            return {

                formLabelWidth: '100px',
                formLabelWidth50: '50px',
                loading:false,
                fullscreenLoading: false,
                task_list:[],
                strategy_type:1,

                pageTotal:1,
                currentPage:1,
                page_size:10
            }
        },
        created: function(){
            this.getTaskDetailList(1, this.page_size);
            this.getTaskDetailListLength();
        },

        methods: {
            getTaskDetailListLength: function(){//获取task列表
                var self = this;
                var params = {
                    filter: {task_id: self.getTaskId},
                };
                self.loading = true;
                self.$axios.post('/api/task/list/length', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.pageTotal = res.data.extra;
                    }
                })
            },
            getTaskDetailList: function(current_page, page_size) {//获取task列表
                var self = this;
                var params = {
                    filter: {task_id: self.getTaskId},
                    page_size: page_size,
                    current_page: current_page,
                };
                self.loading = true;
                self.$axios.post('/api/task/list', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.task_list = res.data.extra.slice(0, self.page_size);
                        self.strategy_type = self.task_list[0].strategy_type;
                    }
                    else{
                        self.task_list = [];
                    }
                })
            },
            handleCurrentChange:function(val){
                this.currentPage = val;
                this.getTaskDetailList(this.currentPage, this.page_size);
                this.getTaskDetailListLength();
            },
        },
        computed:{
            getTaskId() {
                //因为在main.js中已经全局注册了store，所以这里直接用this.$直接使用。
                var task_id = this.$route.params.task_id;
                //this.$message('操作'+ this.params_task_id);
                if (typeof(task_id) === "undefined") {
                    task_id = localStorage.getItem('trade_task_id');
                }
                else {
                    localStorage.setItem('trade_task_id', task_id);
                }
                return task_id;
            }
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
    .inp80{width:80px;}
    .inp100{width:100px;}
    .inp120{width:120px;}
    .inp150{width:140px;}
    .inp160{width:160px;}
    .inp180{width:180px;}
    .nowrap{white-space:nowrap;}
    .upload-demo .el-upload {
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }
    .upload-demo .el-upload:hover {
        border-color: #409EFF;
    }
</style>
