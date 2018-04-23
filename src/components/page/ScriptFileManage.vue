<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-star-on"></i> {{this.breadcrumbs1}}</el-breadcrumb-item>
                <el-breadcrumb-item>{{this.breadcrumbs2}}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="handle-box rad-group" v-if="isShow">
            <el-button type="primary" icon="el-icon-plus" class="handle-del mr10" @click="dialogFormVisible=true">{{this.button_add}}</el-button>
        </div>
        <el-table :data="script_list" border style="width: 100%" ref="multipleTable" v-loading="loading">
            <el-table-column prop="file_name" label="脚本名称" width="250"></el-table-column>
            <el-table-column prop="comment" label="备注"></el-table-column>
            <el-table-column prop="file_status" label="状态" width="100"></el-table-column>
            <el-table-column prop="user_account" label="管理账户" width="150"></el-table-column>
            <el-table-column label="操作" v-if="isShow" width="160">
                <template slot-scope="scope">
                    <el-button class="btn1" type="text" size="small" v-if="isShow" @click="downloadRom(scope.$index)">下载</el-button>
                    <el-button class="btn1" type="text" size="small" v-if="isShow" @click="delRom(scope.$index)">删除</el-button>
                    <el-button class="btn1" type="danger" size="small" v-if="scope.row.file_status =='normal'" @click="revokeRom(scope.$index)">下架</el-button>
                    <el-button class="btn1" type="success" size="small" v-else @click="releaseRom(scope.$index)">上架</el-button>
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

        <el-dialog title="添加交易策略" :visible.sync="dialogFormVisible" class="digcont">
            <el-form :model="upload_form" :rules="upload_form" ref="upload_form">
                <el-form-item label="上传" :label-width="formLabelWidth">
                    <el-upload
                            class="upload-demo"
                            drag
                            ref="upload"
                            name="file_name"
                            :action="uploadUrl"
                            :with-credentials="true"
                            :data="upload_form"
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
                    <el-input v-model="upload_form.comment" class="diainp" auto-complete="off" placeholder="备注说明"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveAdd('upload_form')"v-loading.fullscreen.lock="fullscreenLoading">添 加</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import global_ from 'components/common/Global';
    export default {
        data: function(){
            return {
                breadcrumbs1:'管理',
                breadcrumbs2:'列表',
                button_add:'添加',
                route_path:'',
                user_type:1,  //0:管理员, 1:用户
                isShow:false,
                uploadUrl:'api/script/upload',
                upload_form: {
                    file_name:'',
                    file_type:'',
                    user_account:localStorage.getItem('user_account'),
                    comment:''
                },
                upload_rules: {
                    file_name:[
                        {required: true, message: '请输入文件', trigger: 'blur'}
                    ]
                },
                formLabelWidth: '120px',
                loading:false,
                dialogFormVisible:false,
                fullscreenLoading: false,
                upload_file_list: [],
                script_list:[],
                filter:'',

                pageTotal:1,
                currentPage:1,
                page_size:10
            }
        },
        created: function(){
            console.log('created path:');
            this.user_type = localStorage.getItem('user_type');  //管理员或用户
            this.route_path = this.$route.path;
            this.updateData();
        },
        watch: {
            '$route': function (to , from) {
                console.log('watch route path:',this.$route.path);
                this.route_path = this.$route.path;
                this.updateData();
            }
        },
        methods: {
            updateData: function() {//获取rom列表
                this.isShow = this.user_type =='1'?false:true;


                if (this.route_path == '/select/strategy') {
                    this.isShow = true;
                    this.breadcrumbs1 = '选股策略管理';
                    this.breadcrumbs2 = '选股策略列表';
                    this.button_add = '添加选股策略';
                    this.upload_form.file_type = 'select';
                    if (this.user_type == '1'){
                        this.filter = {file_type: this.upload_form.file_type};
                        this.filter['user_account'] = localStorage.getItem('user_account');
                    }
                    else{
                        this.filter = {file_type: this.upload_form.file_type};
                    }

                }else if (this.route_path == '/strategy/manage') {
                    this.isShow = true;
                    this.breadcrumbs1 = '交易策略管理';
                    this.breadcrumbs2 = '交易策略列表';
                    this.button_add = '添加交易策略';
                    this.upload_form.file_type = 'trade';
                    if (this.user_type == '1'){
                        this.filter = {file_type: this.upload_form.file_type};
                        this.filter['user_account'] = localStorage.getItem('user_account');
                    }
                    else{
                        this.filter = {file_type: this.upload_form.file_type};
                    }

                }else if (this.route_path == '/riskctrl/manage') {
                    this.breadcrumbs1 = '风控管理';
                    this.breadcrumbs2 = '风控列表';
                    this.button_add = '添加风控策略';
                    this.upload_form.file_type = 'riskctrl';
                    this.filter = {file_type: this.upload_form.file_type};
                }else if (this.route_path == '/market/gateway') {
                    this.breadcrumbs1 = '行情接口管理';
                    this.breadcrumbs2 = '行情接口列表';
                    this.button_add = '添加行情接口';
                    this.upload_form.file_type = 'market';
                    this.filter = {file_type: this.upload_form.file_type};
                }else if (this.route_path == '/order/gateway') {
                    this.breadcrumbs1 = '交易接口管理';
                    this.breadcrumbs2 = '交易接口列表';
                    this.button_add = '添加交易接口';
                    this.upload_form.file_type = 'order';
                    this.filter = {file_type: this.upload_form.file_type};
                }

                //管理员显示所有列表
                this.getScriptList(1, this.page_size, this.filter);
            },
            getScriptList: function(current_page, page_size, filter){//获取rom列表
                var self = this;
                var params = {
                    filter: filter,
                    page_size: page_size,
                    current_page: current_page,
                };
                self.loading = true;
                self.$axios.post('/api/script/list', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.script_list = res.data.extra.slice(0, self.page_size);
                        self.pageTotal = res.data.extra.total;
                    }
                    else{
                        self.script_list = [];
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
                this.upload_form.file_name = file.name;
                return true;
            },
            handleSuccess: function(response, file, fileList){
                console.log(response);
                this.fullscreenLoading  = false;
                if(response.ret_code == 0){
                    this.$message('上传成功');
                    this.dialogFormVisible = false;
                    this.getScriptList(1, this.page_size, this.filter);
                }
                else{
                    this.$message(response.ret_msg);
                }
                this.upload_file_list = [];
            },
            handleCurrentChange:function(val){
                this.cur_page = val;
                this.getScriptList(1, this.page_size, this.filter);
            },

            downloadRom: function(index){//下载
                var self = this;
                if(this.script_list[index].file_status == 'revoke'){
                    self.$message({message:'脚本已下架',type:'warning'});
                    return false;
                }
                var params = {
                    _id: this.script_list[index]._id,
                    file_name:this.script_list[index].file_name,
                    file_type:this.script_list[index].file_type
                };
                self.loading = true;
                self.$axios.post('api/script/download',params).then(function(res){
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
            delRom: function(index){//删除
                var self = this;
                var params = {
                    _id: this.script_list[index]._id,
                    file_name:this.script_list[index].file_name,
                    file_type:this.script_list[index].file_type
                };
                self.loading = true;
                self.$axios.post('/api/script/del',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.$message({message:'删除成功',type:'success'});
                        self.getScriptList(1, self.page_size, self.filter);
                    }else{
                        self.$message.error(res.data.extra)
                    }

                },function(err){
                    self.$message.error('删除失败');
                    self.loading = false;
                    console.log(err);
                })
            },
            releaseRom: function(index){//上架操作
                var self = this;
                var params = {
                    _id: this.script_list[index]._id,
                    file_name:this.script_list[index].file_name,
                    file_type:this.script_list[index].file_type
                };
                self.loading = true;
                self.$axios.post('/api/script/release',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.$message({message:'操作成功',type:'success'});
                        self.getScriptList(1, self.page_size, self.filter);
                    }else{
                        self.$message.error(res.data.extra)
                    }

                },function(err){
                    self.$message.error('操作失败');
                    self.loading = false;
                })
            },
            revokeRom: function(index){//下架操作
                var self = this;
                var params = {
                    _id: this.script_list[index]._id,
                    file_name:this.script_list[index].file_name,
                    file_type:this.script_list[index].file_type
                };
                self.loading = true;
                self.$axios.post('/api/script/revoke',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.$message({message:'操作成功',type:'success'});
                        self.getScriptList(1, self.page_size, self.filter);
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
