<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-star-on"></i> 风控管理</el-breadcrumb-item>
                <el-breadcrumb-item>风控列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="handle-box rad-group" v-if="isShow">
            <el-button type="primary" icon="el-icon-plus" class="handle-del mr10" @click="dialogFormVisible=true">创建风控模型</el-button>
        </div>
        <el-table :data="riskctrl_list" border style="width: 100%" ref="multipleTable" v-loading="loading">
            <el-table-column prop="file_name" label="风控名称" width="250"></el-table-column>
            <el-table-column prop="alias_name" label="风控中文名称" width="400"></el-table-column>
            <el-table-column prop="comment" label="备注" width="400"></el-table-column>
        </el-table>
        <div class="pagination">
            <el-pagination
                    @current-change ="handleCurrentChange"
                    :current-page="currentPage"
                    layout="prev, pager, next"
                    :total="pageTotal">
            </el-pagination>
        </div>

        <el-dialog title="添加风控策略" :visible.sync="dialogFormVisible" class="digcont">
            <el-form :model="form" :rules="rules" ref="form">
                <el-form-item label="上传" :label-width="formLabelWidth">
                    <el-upload
                            class="upload-demo"
                            ref="upload"
                            name="file_name"
                            action="http://127.0.0.1:8000/strategy/upload"
                            :data="form"
                            :beforeUpload="beforeUpload"
                            :on-success="handleSuccess"
                            :file-list="upload_filelist"
                            :auto-upload="false">
                        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                    </el-upload>
                </el-form-item>
                <el-form-item label="策略名称" prop=alias_name :label-width="formLabelWidth">
                    <el-input v-model="form.alias_name" class="diainp" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="备注说明" prop="comment" :label-width="formLabelWidth">
                    <el-input v-model="form.comment" class="diainp" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveAdd('form')"v-loading.fullscreen.lock="fullscreenLoading">添 加</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
    //import global_ from 'components/common/Global';
    export default {
        data: function(){
            return {
                user_type:1,  //0:管理员, 1:用户
                isShow:false,
                form: {
                    file_name:'',
                },
                rules: {
                    rom_version:[
                        {required: true, message: '请输入ROM版本号', trigger: 'blur'}
                    ]
                },
                formLabelWidth: '120px',
                loading:false,
                dialogFormVisible:false,
                fullscreenLoading: false,
                upload_filelist: [],
                riskctrl_list:[],
                riskctrl_file_list:[],

                pageTotal:0,
                currentPage:1
            }
        },
        created: function(){
            this.getRiskCtrlList();
            this.user_type = localStorage.getItem('user_type');  //管理员或用户
            this.isShow = this.user_type =='1'?false:true;
        },
        methods: {

            getRiskCtrlList: function(){//获取设备类型
                var self = this;
                self.loading = true;
                self.$axios.post('/api/riskctrl/list').then(function(res) {
                    self.loading = false;
                    if (res.data.ret_code == 0) {
                        self.pageTotal = res.data.extra.length;
                        self.riskctrl_file_list = res.data.extra.slice(0, 10);
                        for (var i = 0; i < self.riskctrl_file_list.length; i++) {
                            var obj = {
                                'file_name': self.riskctrl_file_list[i],
                                'alias_name': self.riskctrl_file_list[i],
                                'comment': '',
                            }
                            self.riskctrl_list.push(obj);
                        }
                    }
                    else {
                        self.riskctrl_file_list = [];
                        console.log('resp:', res.data);
                    }
                });
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
                this.getRiskCtrlList();
            },
            handleError: function(response,file,fileList){
                this.$message('操作失败');
                self.fullscreenLoading  = false;
            },
            saveAdd: function(formName){
                var self = this;

            },
            handleCurrentChange:function(val){
                this.cur_page = val;
                this.getRiskCtrlList();
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
    .orange{color:#eb9e05;background-color:inherit;}
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
