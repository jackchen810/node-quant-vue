<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-upload"></i> 选股任务管理</el-breadcrumb-item>
                <el-breadcrumb-item>选股结果</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="handle-box rad-group">
            <el-button type="primary" icon="el-icon-plus" class="handle-del mr10" @click="dialogFormVisible=true">加入任务监控</el-button>
            <el-form :inline="true" class="handle-box2">
                <el-form-item>
                    <el-button type="primary" class="handle-del mr10" @click="page_forward_monitor">查看监控任务</el-button>
                </el-form-item>
            </el-form>
        </div>
        <el-table :data="result_list" border style="width: 100%" ref="multipleTable" v-loading="loading" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" ></el-table-column>
            <!--<el-table-column type="index" label="序号" width="60"></el-table-column>-->
            <el-table-column prop="stock_symbol" label="股票代码"></el-table-column>
            <el-table-column prop="symbol_name" label="股票名称"></el-table-column>
            <el-table-column prop="stock_ktype" label="K线类型"></el-table-column>
            <el-table-column prop="strategy_name" label="选股策略" width="240"></el-table-column>
            <el-table-column label="操作" width="260">
                <template slot-scope="scope">
                    <el-button class="btn1" type="text" size="small" @click="add_object_2monitor(scope.row)">加入任务监控</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="pagination">
            <el-pagination
                @current-change ="handleCurrentChange"
                :current-page="currentPage"
                layout="prev, pager, next"
                :total="pageTotal">
            </el-pagination>
        </div>
        <el-dialog title="加入任务监控" :visible.sync="dialogFormVisible" class="digcont">
            <el-form :model="form" :rules="rules0" ref="form" label-width="150px">
                <el-form-item label="绑定K 线周期">
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
                <el-form-item label="绑定交易策略" prop="strategy_name">
                    <el-select v-model="form.strategy_name" class="inp180" placeholder="请选择对应策略">
                        <el-option
                                v-for="item in strategy_file_list"
                                :key="item"
                                :label="item"
                                :value="item">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="监控股票列表" prop="strategy_name">
                    <el-input type="textarea" v-model="monitor_code_list_str" class="inp200" auto-complete="off" :disabled="true"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button @click="dialogFormVisible = false">退 出</el-button>
                    <el-button type="primary" @click="saveAdd('form')">确 定</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
    //import global_ from 'components/common/Global';
    export default {
        data: function(){
            const self = this;
            return {
                multipleTable:[],
                dialogFormVisible:false,
                fullscreenLoading: false,
                loading:true,
                form: {
                    task_id:'',
                    task_status:'',
                    strategy_name: '',
                    stock_ktype: '',
                    monitor_obj_list: [],
                    //monitor_name_list: [],
                },
                rules0: {
                    start_time:[
                        {required: true, message: '请输入开始时间', trigger: 'blur'},
                    ],
                    end_time:[
                        {required: true, message: '请输入结束时间', trigger: 'blur'}
                    ],
                },

                monitor_code_list_str: '',
                result_list:[],
                strategy_file_list:[],

                pageTotal:1,
                currentPage:1,
                page_size:10

            }
        },
        created:function(){
            this.getPickstockResultList(1, this.page_size);
            this.getPickstockResultListLength();
            this.getStrategyList();
        },
        methods: {
            getPickstockResultListLength: function(){//获取task列表
                var self = this;
                var params = {
                    filter: {task_id: self.getTaskId},
                };
                self.loading = true;
                self.$axios.post('/api/pick/stock/result/length', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.pageTotal = res.data.extra;
                    }
                })
            },
            getPickstockResultList: function(current_page, page_size){//获取backtest task列表
                var self = this;
                var params = {
                    filter: {task_id: self.getTaskId},
                    page_size: page_size,
                    current_page: current_page,
                };
                self.loading = true;
                self.$axios.post('/api/pick/stock/result', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.result_list = res.data.extra.slice(0,10);
                    }
                    else{
                        self.result_list = [];
                    }
                })
            },
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
            saveAdd: function(formName){
                var self = this;
                var params = {
                    task_type:'monitor',
                    strategy_type:'1',  //简单策略
                    monitor_obj_list:self.form.monitor_obj_list,
                    strategy_name:self.form.strategy_name,
                    stock_ktype:self.form.stock_ktype,
                };
                self.loading = true;
                self.$axios.post('/api/task/add/monitor', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.$message('添加成功');
                    }
                    else{
                        self.$message('添加失败:' + res.data.extra);
                    }

                },function(err){
                    self.$message('添加失败');
                    self.loading = false;
                    console.log(err);
                })
            },
            add_object_2monitor: function(row){//获取task列表
                var self = this;
                self.dialogFormVisible = true;
                self.$refs.multipleTable.clearSelection();
                self.$refs.multipleTable.toggleRowSelection(row);
            },
            page_forward_monitor: function(){//task detail操作
                this.$router.push({name:'TradeTaskManage', params :{task_type: 'monitor'}});
            },
            handleSelectionChange: function(val) {
                var self = this;
                self.form.monitor_obj_list = val;
                //self.monitor_code_list_str = val.toString();
                self.monitor_code_list_str = '';
                for (var i = 0; i < val.length; i++){
                    self.monitor_code_list_str += val[i]['stock_symbol'];
                    self.monitor_code_list_str += ';';
                }
                //self.$message('handleSelectionChange:'+ self.monitor_code_list_str);
            },
            handleCurrentChange:function(val){
                this.currentPage = val;
                this.getPickstockResultList(this.currentPage, this.page_size);
            },
        },
        computed:{
            getTaskId(){
                //因为在main.js中已经全局注册了store，所以这里直接用this.$直接使用。
                var task_id = this.$route.params.task_id;
                //this.$message('操作'+ this.params_task_id);
                if (typeof(task_id) === "undefined") {
                    task_id = localStorage.getItem('select_task_id');
                }
                else {
                    localStorage.setItem('select_task_id', task_id);
                }
                return task_id;
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
