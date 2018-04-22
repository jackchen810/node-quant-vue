<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-star-on"></i> 策略管理</el-breadcrumb-item>
                <el-breadcrumb-item>策略列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="handle-box rad-group">
            <el-button type="primary" icon="el-icon-plus" class="handle-del mr10" @click="dialogFormVisible=true">创建选股策略</el-button>
        </div>
        <el-table :data="strategy_list" border style="width: 100%" ref="multipleTable" v-loading="loading">
            <el-table-column prop="file_name" label="策略名称" width="250"></el-table-column>
            <el-table-column prop="comment" label="备注"></el-table-column>
            <el-table-column prop="file_status" label="状态" width="100"></el-table-column>
            <el-table-column prop="user_account" label="拥有用户" width="150"></el-table-column>
            <el-table-column label="操作" v-if="isShow" width="160">
                <template slot-scope="scope">
                    <el-button class="btn1" type="text" size="small" @click="downloadRom(scope.row._id,scope.row.file_name,scope.row.file_status)">下载</el-button>
                    <el-button class="btn1" type="text" size="small" @click="delRom(scope.row._id,scope.row.file_name,scope.$index)">删除</el-button>
                    <el-button class="btn1" type="danger" size="small" v-if="scope.row.file_status =='normal'" @click="revokeRom(scope.row._id,scope.row.file_name)">下架</el-button>
                    <el-button class="btn1" type="success" size="small" v-else @click="releaseRom(scope.row._id,scope.row.file_name)">上架</el-button>
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

        <el-dialog title="添加选股策略" :visible.sync="dialogFormVisible" class="digcont">
            <el-form :model="form" :rules="rules" ref="form">
                <el-form-item label="上传" :label-width="formLabelWidth">
                    <el-upload
                            class="upload-demo"
                            drag
                            ref="upload"
                            name="file_name"
                            :action="uploadUrl"
                            :with-credentials="true"
                            :data="form"
                            :beforeUpload="beforeUpload"
                            :on-success="handleSuccess"
                            :file-list="upload_file_list"
                            :auto-upload="false">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                        <div class="el-upload__tip" slot="tip">只支持上传js文件</div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="备注说明" prop="comment" :label-width="formLabelWidth">
                    <el-input v-model="form.comment" class="diainp" auto-complete="off" placeholder="备注说明"></el-input>
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
    import global_ from 'components/common/Global';
    export default {
        data: function(){
            return {
                user_type:1,  //0:管理员, 1:用户
                isShow:false,
                uploadUrl:'api/pick/stock/strategy/upload',
                upload_file_list: [],
                form: {
                    file_name:'',
                    user_account:localStorage.getItem('user_account'),
                    comment:''
                },
                rules: {
                    file_name:[
                        {required: true, message: '请输入文件', trigger: 'blur'}
                    ]
                },
                formLabelWidth: '120px',
                loading:false,
                dialogFormVisible:false,
                fullscreenLoading: false,
                upload_filelist: [],
                strategy_list:[],
                strategy_file_list:[],

                pageTotal:1,
                currentPage:1,
                page_size:10
            }
        },
        created: function(){
            this.getStrategyList(1, this.page_size);
            this.user_type = localStorage.getItem('user_type');  //管理员或用户
            this.isShow = this.user_type =='1'?false:true;
        },
        methods: {
            getStrategyList: function(current_page, page_size, filter){//获取rom列表
                var self = this;
                var params = {
                    filter: filter,
                    page_size: page_size,
                    current_page: current_page,
                };
                self.loading = true;
                self.$axios.post('/api/pick/stock/strategy/list').then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.strategy_list = res.data.extra.slice(0, self.page_size);
                        self.pageTotal = res.data.extra.total;
                            }
                    else{
                        self.strategy_list = [];
                        console.log('resp:', res.data);
                    }
                });
            },
            saveAdd: function(formName){
                var self = this;
                self.$refs[formName].validate(function(valid){
                    if(valid){
                        self.fullscreenLoading  = true;
                        self.$refs.upload.submit();
                    }else{
                        return false;
                        console.log('验证失败');
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
                if(response.ret_code == 0){
                    this.$message('上传成功');
                    this.dialogFormVisible = false;
                    this.getStrategyList(1, this.page_size);
                }
                else{
                    this.$message(response.ret_msg);
                }
                this.upload_file_list = [];
            },
            handleCurrentChange:function(val){
                this.cur_page = val;
                this.getStrategyList(1, this.page_size);
            },

            downloadRom: function(id,fileName,status){//下载
                var self = this;
                if(status == 'revoke'){
                    self.$message({message:'固件已下架',type:'warning'});
                    return false;
                }
                var params = {
                    _id: id,
                    file_name:fileName
                };
                self.loading = true;
                self.$axios.post('api/pick/stock/strategy/download',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        const aLink = document.createElement('a');
                        const evt = document.createEvent('MouseEvents');
                        // var evt = document.createEvent("HTMLEvents")
                        evt.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                        aLink.download = fileName;
                        aLink.href = global_.baseUrl + res.data.extra.access_path;
                        console.log(aLink.href);
                        //aLink.href = 'http://127.0.0.1:8000/back%20002.jpg';
                        aLink.dispatchEvent(evt)

                    }else{
                        self.$message.error(res.data.extra);
                    }
                },function(err){
                    self.$message.error('下载失败');
                    self.loading = false;
                    console.log(err);
                });
            },
            delRom: function(id,fileName,i){//删除
                var self = this;
                var params = {
                    _id: id,
                    file_name:fileName
                };
                self.loading = true;
                self.$axios.post('/api/pick/stock/strategy/del',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.$message({message:'删除成功',type:'success'});
                        self.getStrategyList(1, self.page_size);
                    }else{
                        self.$message.error(res.data.extra)
                    }

                },function(err){
                    self.$message.error('删除失败');
                    self.loading = false;
                    console.log(err);
                })
            },
            releaseRom: function(id,fileName){//上架操作
                var self = this;
                var params = {
                    _id: id,
                    file_name:fileName
                };
                self.loading = true;
                self.$axios.post('/api/pick/stock/strategy/release',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.$message({message:'操作成功',type:'success'});
                        self.getStrategyList(1, self.page_size);
                    }else{
                        self.$message.error(res.data.extra)
                    }

                },function(err){
                    self.$message.error('操作失败');
                    self.loading = false;
                })
            },
            revokeRom: function(id,fileName){//下架操作
                var self = this;
                var params = {
                    _id: id,
                    file_name:fileName
                };
                self.loading = true;
                self.$axios.post('/api/pick/stock/strategy/revoke',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.$message({message:'操作成功',type:'success'});
                        self.getStrategyList(1, self.page_size);
                    }else{
                        self.$message.error(res.data.extra)
                    }

                },function(err){
                    self.$message.error('操作失败');
                    self.loading = false;
                })
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
