<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-star-on"></i>数据管理</el-breadcrumb-item>
                <el-breadcrumb-item>数据列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="handle-box rad-group">
            <el-button type="primary" icon="plus" class="handle-del mr10" @click="dialogFormVisible=true">添加计划任务</el-button>
        </div>
        <el-table :data="task_plan_list" border style="width: 100%" ref="multipleTable" v-loading="loading">
            <el-table-column type="index" label="ID" width="60"></el-table-column>
            <el-table-column prop="task_script" label="任务" width="160"></el-table-column>
            <el-table-column prop="task_name" label="名称" width="160"></el-table-column>
            <el-table-column prop="task_status" label="运行状态" width="95"></el-table-column>
            <el-table-column prop="create_at" label="创建时间" width="180"></el-table-column>
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
                            arrow-control
                            v-model="form.task_exce_time"
                            :picker-options="{selectableRange: '00:00:00 - 23:59:59'}"
                            placeholder="任意时间点">
                    </el-time-picker>
                </el-form-item>
                <el-form-item label="" prop="task_select_id_list" :inline="true":label-width="formLabelWidth">
                    <el-transfer v-model="form.task_select_id_list" :titles="['可选任务列表', '计划任务列表']" :data="task_plan_data"></el-transfer>
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

                task_plan_data:[],
                task_plan_list:[],
                history_dl_file_list:[],

                form: {
                    task_exce_time:'111',
                    task_select_id_list:[],  //[1,2]
                },

                rules: {
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
            this.getHistoryDlList();
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
            getHistoryDlList: function(){//获取task列表
                var self = this;
                self.loading = true;
                self.$axios.post('/api/history/download/file/list').then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.history_dl_file_list = res.data.extra;
                        for (var i = 0; i < self.history_dl_file_list.length; i++) {
                            self.task_plan_data.push({
                                key: i,
                                label: `${ self.history_dl_file_list[i]}`,
                                disabled: false,
                            });
                        }
                        console.log('task_plan_data', self.task_plan_data);
                    }
                    else{
                        console.log('resp:', res.data)
                    }
                })
            },

            getTaskPlanList: function(){//获取task列表
                var self = this;
                self.loading = true;
                self.$axios.post('/api/history/download/plan/list').then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0) {
                        self.task_plan_list = res.data.extra;

                        ///更新穿梭框
                        for (var m = 0; m < self.task_plan_list.length; m++) {
                            var task_script = self.task_plan_list[m]['task_script']
                            for (var i = 0; i < self.history_dl_file_list.length; i++) {
                                if (task_script == self.history_dl_file_list[i]) {
                                    self.form.task_select_id_list.push(i);
                                }
                            }
                        }
                    }
                    else{
                        console.log('resp:', res.data)
                    }
                })
            },
            saveAdd: function(formName){
                var self = this;
                var task_select_list = [];
                for (var i = 0; i < self.task_plan_data.length; i++) {
                    task_select_list[i] = {'task_script': self.task_plan_data[i].label, 'task_status': 'stop'};
                }

                for (var i = 0; i < self.form.task_select_id_list.length; i++) {
                    var id = self.form.task_select_id_list[i];
                    task_select_list[id]['task_status'] = 'running';
                }


                var params = {
                    task_select_id_list:self.form.task_select_id_list,
                    task_select_list:task_select_list,
                };

                self.loading = true;
                self.$axios.post('/api/history/download/plan/update', params).then(function(res){
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
            handleCurrentChange:function(val){
                this.cur_page = val;
                this.getTaskList();
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
