<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-star-on"></i>选股任务管理</el-breadcrumb-item>
                <el-breadcrumb-item>选股任务列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="handle-box rad-group">
            <el-button type="primary" icon="plus" class="handle-del mr10" @click="dialogFormVisible=true">创建选股任务</el-button>
        </div>
        <el-table :data="task_list" border style="width: 100%" ref="multipleTable" v-loading="loading">
            <el-table-column type="index" label="ID" width="60"></el-table-column>
            <!--
            <el-table-column prop="stock_name" label="股票名称" width="100"></el-table-column>
            <el-table-column prop="obj_amount" label="操作量" width="80"></el-table-column>
            -->
            <el-table-column prop="task_type" label="任务类型" width="100"></el-table-column>
            <el-table-column prop="stock_range" label="选股范围" width="100"></el-table-column>
            <el-table-column prop="stock_ktype" label="K线类型" width="100"></el-table-column>
            <el-table-column prop="strategy_name" label="选股策略" width="220"></el-table-column>
            <el-table-column prop="task_status" label="运行状态" width="95"></el-table-column>
            <el-table-column label="操作" width="200">
                <template slot-scope="scope">
                    <el-button class="btn1" type="text" size="small" @click="delTask(scope.row.task_id)">删除</el-button>
                    <el-button class="btn1" type="danger" size="small" v-if="scope.row.task_status =='running'" @click="stopTask(scope.row.task_id)">停止</el-button>
                    <el-button class="btn1" type="success" size="small" v-else @click="startTask(scope.row.task_id)">启动</el-button>
                    <el-button class="btn1" type="text" size="small" @click="page_forward(scope.row.task_id)">查看结果</el-button>
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
        <el-dialog title="添加选股任务" :visible.sync="dialogFormVisible" class="digcont" v-if="true" >
            <el-form :model="form" :rules="rules0" ref="form" label-width="150px">
                <el-form-item label="选股范围">
                    <el-select v-model="form.stock_range" class="inp180" placeholder="请选择范围">
                        <el-option label="上海市场" value="1"></el-option>
                        <el-option label="深圳市场" value="2"></el-option>
                        <el-option label="A股全部" value="3"></el-option>
                    </el-select>
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
                    <el-button type="primary" @click="saveAdd('form')" v-loading.fullscreen.lock="fullscreenLoading">开始选股 </el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
    import global_ from 'components/common/Global';
    export default {
        data: function(){
            return {

                dialogFormVisible:false,
                radio3:'全部',


                form: {
                    task_id:'',
                    task_status:'',
                    strategy_name: '',
                    stock_ktype: '',
                    stock_range: '',
                },
                rules0: {
                    start_time:[
                        {required: true, message: '请输入开始时间', trigger: 'blur'},
                    ],
                    end_time:[
                        {required: true, message: '请输入结束时间', trigger: 'blur'}
                    ],
                },
                log:{
                    message:''
                },

                formLabelWidth: '100px',
                formLabelWidth50: '50px',
                updateTimer: '',
                loading:false,
                fullscreenLoading: false,
                task_list:[],
                strategy_file_list:[],

                pageTotal:1,
                currentPage:1,
                page_size:10
            }
        },
        created: function(){

            this.getTaskList(1, this.page_size);
            this.getTaskListLength();
            this.getPickStrategyList();
        },
        methods: {
            getTaskListLength: function(){//获取task列表
                var self = this;
                self.loading = true;
                self.$axios.post('/api/pick/stock/task/list/length').then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.pageTotal = res.data.extra;
                    }
                });
            },
            getTaskList: function(current_page, page_size){//获取backtest task列表
                var self = this;
                var params = {
                    page_size: page_size,
                    current_page: current_page,
                };
                self.loading = true;
                self.$axios.post('/api/pick/stock/task/list', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.task_list = res.data.extra.slice(0,10);
                    }
                    else{
                        self.task_list = [];
                    }
                })
            },
            getTaskStatusById: function(task_id){//获取backtest task列表
                var self = this;
                var params = {
                    task_id:task_id,
                };
                self.loading = true;
                self.$axios.post('/api/pick/stock/task/status', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        var taskList = res.data.extra;
                        for (var i = 0; i <taskList.length; i++){
                            if (taskList[i]['task_status'] != 'finish'){
                                break;
                            }
                        }

                        //都已经 finish
                        if (i == taskList.length){
                            //更新状态
                            for (var i = 0; i <self.task_list.length; i++){
                                if (self.task_list[i]['task_id'] == task_id){
                                    self.task_list[i]['task_status'] = 'finish';
                                }
                            }
                            return;
                        }
                    }

                    //self.task_list = [];
                    self.updateTimer = setTimeout(function(){
                        self.getTaskStatusById(task_id);
                    },10000)

                })
            },
            getPickStrategyList: function(){//获取rom列表
                var self = this;
                self.loading = true;
                self.$axios.post('/api/pick/stock/strategy/list').then(function(res){
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
                    strategy_name:this.form.strategy_name,
                    stock_ktype:this.form.stock_ktype,
                    stock_range:this.form.stock_range,
                };
                self.loading = true;

                self.$axios.post('/api/pick/stock/add', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.dialogFormVisible = false;
                        self.getTaskList();
                    }
                    else{
                        console.log('resp:', res.data)
                    }
                })
            },
            delTask: function(task_id){//删除
                var self = this;
                var params = {
                    task_id: task_id
                };
                self.loading = true;
                self.$axios.post('/api/pick/stock/del', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.$message('删除成功');
                        self.getTaskList();
                    }
                    else {
                        self.$message(res.data.extra);
                    }

                },function(err){
                    self.$message('删除失败');
                    self.loading = false;
                    console.log(err);
                })
            },
            startTask: function(task_id){//上架操作
                var self = this;
                var params = {
                    task_id: task_id,
                };
                self.loading = true;
                self.$axios.post('/api/pick/stock/start',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.$message('操作成功');
                        self.getTaskList();
                        //启动定时器，定时查询状态
                        self.updateTimer = setTimeout(function(){
                            self.getTaskStatusById(task_id);
                        },2000)
                    }
                    else {
                        self.$message(res.data.extra);
                    }

                },function(err){
                    self.$message('操作失败');
                    self.loading = false;
                    console.log(err);
                })
            },
            stopTask: function(task_id){//下架操作
                var self = this;
                var params = {
                    task_id: task_id,
                };
                self.loading = true;
                self.$axios.post('/api/pick/stock/stop', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.$message('操作成功');
                        self.getTaskList();
                        clearTimeout(self.updateTimer);
                    }
                    else {
                        self.$message(res.data.extra);
                    }

                },function(err){
                    self.$message('操作失败');
                    self.loading = false;
                    console.log(err);
                })
            },
            page_forward (task_id){
                this.$router.push({name: 'PickstockResult', params :{task_id: task_id}});
            },
            handleCurrentChange:function(val){
                this.currentPage = val;
                this.getTaskList(this.currentPage, this.page_size);
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
