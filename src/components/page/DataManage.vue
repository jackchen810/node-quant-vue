<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-star-on"></i>数据管理</el-breadcrumb-item>
                <el-breadcrumb-item>数据列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="handle-box rad-group">
            <el-button type="primary" icon="el-icon-plus" class="handle-del mr10" @click="dialogFormVisible=true">添加计划任务</el-button>
        </div>
        <el-table :data="task_plan_list" border style="width: 100%" ref="multipleTable" v-loading="loading">
            <el-table-column type="index" label="ID" width="60"></el-table-column>
            <el-table-column prop="task_id" label="任务ID" width="220"></el-table-column>
            <el-table-column prop="task_script" label="任务名称" width="200"></el-table-column>
            <el-table-column prop="task_exce_time" label="执行时间"></el-table-column>
            <el-table-column prop="task_status" label="运行状态"></el-table-column>
            <el-table-column prop="create_at" label="创建时间" width="180"></el-table-column>
            <el-table-column label="操作" width="120">
                <template slot-scope="scope">
                    <el-button class="btn1" type="text" size="small" @click="delTask(scope.row.task_id)">删除</el-button>
                    <el-button class="btn1" type="danger" size="small" v-if="scope.row.task_status =='running'" @click="stopTask(scope.row.task_id)">停止</el-button>
                    <el-button class="btn1" type="success" size="small" v-else @click="startTask(scope.row.task_id)">启动</el-button>
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
        <el-dialog title="添加计划任务" :visible.sync="dialogFormVisible" class="digcont" >
            <el-form :model="form" :rules="rules" ref="form">
                <el-form-item label="每天" prop="task_exce_time" :inline="true":label-width="formLabelWidth">
                    <el-time-picker
                            v-model="form.task_exce_time"
                            :picker-options="{selectableRange: '00:00:00 - 23:59:59'}"
                            placeholder="请选择执行时间">
                    </el-time-picker>
                </el-form-item>
                <el-form-item label="选择计划任务" prop="task_plan_script">
                    <el-select v-model="form.task_plan_script" class="inp180" placeholder="请选择计划任务">
                        <el-option
                            v-for="item in download_file_list"
                            :key="item"
                            :label="item"
                            :value="item">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">退 出</el-button>
                <el-button type="primary" @click="saveAdd('form')"v-loading.fullscreen.lock="fullscreenLoading">添 加</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import global_ from 'components/common/Global';
    export default {
        data: function(){
            return {
                dialogFormVisible:false,

                task_plan_list:[],
                download_file_list:[],

                form: {
                    task_exce_time:new Date(),
                    task_plan_script:'',
                },

                rules: {
                    task_exce_time:[
                        {required: true, message: '请输入计划时间', trigger: 'blur'},
                    ],
                },

                formLabelWidth: '100px',
                formLabelWidth50: '50px',
                fileList3: [],
                loading:false,
                fullscreenLoading: false,

                pageTotal:0,
                currentPage:1
            }
        },
        created: function(){
            this.getPlanFileList();
            this.getTaskPlanList();

            //this.getValidStockList();
        },
        beforeDestroy: function(){
            if ( this.tiemout ) {
                clearTimeout(this.tiemout);
                this.tiemout = '';
            }

            console.log('destory');
        },
        methods: {
            getPlanFileList: function(){//获取task列表
                var self = this;
                self.loading = true;
                self.$axios.post('/api/download/plan/file/list').then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.download_file_list = res.data.extra;
                    }
                    else{
                        console.log('resp:', res.data)
                    }
                })
            },

            getTaskPlanList: function(){//获取task列表
                var self = this;
                self.loading = true;
                self.$axios.post('/api/download/plan/list').then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0) {
                        self.task_plan_list = res.data.extra;
                    }
                    else{
                        console.log('resp:', res.data)
                    }
                })
            },
            saveAdd: function(formName){
                var self = this;

                var params = {
                    task_exce_time:self.form.task_exce_time,
                    task_plan_script:self.form.task_plan_script,
                };
                self.loading = true;
                self.$axios.post('/api/download/plan/add', params).then(function(res){
                    self.loading = false;
                    console.log(res);
                    if(res.data.ret_code == 0){
                        self.$message('添加成功');
                        self.getTaskPlanList();
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
            delTask: function(task_id){//删除
                var self = this;
                var params = {
                    task_id: task_id
                };
                self.loading = true;
                self.$axios.post('/api/download/plan/del', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.$message('删除成功');
                        self.getTaskPlanList();
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
                self.$axios.post('/api/download/plan/start',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.$message('操作成功');
                        self.getTaskPlanList();
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
                self.$axios.post('/api/download/plan/stop', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.$message('操作成功');
                        self.getTaskPlanList();
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
            handleCurrentChange:function(val){
                this.cur_page = val;
                this.getTaskPlanList();
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
