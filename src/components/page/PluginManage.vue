<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-date"></i> 插件管理</el-breadcrumb-item>
                <el-breadcrumb-item>插件列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="handle-box" v-if="isShow">
            <el-button type="primary" icon="plus" class="handle-del mr10" @click="dialogFormVisible=true">上传插件</el-button>
        </div>
        <el-table :data="listData" border style="width: 100%" ref="multipleTable" v-loading="loading">
            <el-table-column prop="pkg_str_name" label="插件名称"></el-table-column>
            <el-table-column prop="pkg_version" label="版本号"></el-table-column>
            <!--<el-table-column prop="pkg_developer" label="开发者" width="110"></el-table-column>-->
            <!--<el-table-column prop="pkg_create_time" label="上传时间" width="150"></el-table-column>-->
            <!--<el-table-column prop="pkg_info" label="插件说明"></el-table-column>-->
            <el-table-column label="操作" v-if="isShow">
                <template slot-scope="scope">
                    <el-button type="success" size="small" @click="detail(scope.row.pkg_str_name,scope.row.pkg_version)">查看详情</el-button>
                    <!--<el-button type="danger" size="small" @click="delPlugin(scope.row.pkg_name)">编辑</el-button>-->
                    <!--<el-button type="success" size="small" @click="downloadPlugin(scope.row.pkg_name)">下载</el-button>-->
                    <!--<el-button type="danger" size="small" @click="delPlugin(scope.row.pkg_name)">删除</el-button>-->
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
        <div class="detailTable" v-if="isShowDetail">
            <h4>插件相关信息</h4>
            <el-table :data="detailData" border style="width: 100%" ref="multipleTable" v-loading="loading">
                <el-table-column prop="pkg_create_time" label="上传时间" width="150"></el-table-column>
                <el-table-column prop="pkg_name" label="插件名称" width="360"></el-table-column>
                <el-table-column prop="pkg_version" label="版本号"></el-table-column>
                <el-table-column prop="pkg_developer" label="开发者"></el-table-column>
                <el-table-column prop="pkg_info" label="插件说明"></el-table-column>
                <el-table-column label="操作" v-if="isShow" width="140">
                    <template slot-scope="scope">
                        <el-button type="success" size="small" @click="downloadPlugin(scope.row.pkg_name)">下载</el-button>
                        <el-button type="danger" size="small" @click="delPlugin(scope.row.pkg_name)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <el-dialog title="添加插件版本" :visible.sync="dialogFormVisible" class="digcont">
            <el-form :model="form" :rules="rules" ref="form">
                <el-form-item label="上传ipk文件" :label-width="formLabelWidth">
                    <el-upload
                        class="upload-demo"
                        ref="upload"
                        name="file_name"
                        :action="uploadUrl"
                        with-credentials="true"
                        :data="form"
                        :beforeUpload="beforeUpload"
                        :on-change="handleChange"
                        :on-success="handleSuccess"
                        :file-list="fileList"
                        :auto-upload="false">
                        <el-button size="small" type="primary">选择文件</el-button>
                    </el-upload>
                </el-form-item>
                <el-form-item label="插件名称" prop="pkg_str_name" :label-width="formLabelWidth">
                    <el-input v-model="form.pkg_str_name" class="diainp" :disabled="true"></el-input>
                </el-form-item>
                <el-form-item label="版本号" prop="pkg_version" :label-width="formLabelWidth">
                    <el-input v-model="form.pkg_version" class="diainp" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="插件说明" prop="pkg_info" :label-width="formLabelWidth">
                    <el-input v-model="form.pkg_info" class="diainp" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="开发者" prop="pkg_developer" :label-width="formLabelWidth">
                    <el-input v-model="form.pkg_developer" class="diainp" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveAdd('form')">添 加</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
    import global_ from 'components/common/Global';
    export default {
        data: function() {
            return {
                uploadUrl:global_.baseUrl+'/pkg/upload',
                isShow:localStorage.getItem('userMsg') =='1'?false:true,
                currentPage: 1,
                pageTotal:0,
                dialogFormVisible: false,
                form: {
                    pkg_name:'',
                    pkg_str_name:'',
                    pkg_version:'',
                    pkg_info:'',
                    pkg_developer:''
                },
                rules: {
                    pkg_str_name:[
                        {required: true, message: '请选择插件', trigger: 'blur'}
                    ],
                    pkg_version:[
                        {required: true, message: '请输入插件版本', trigger: 'blur'},
                        {validator:this.validateSpace,trigger:'blur'}
                    ],
                    pkg_info:[
                        {required: true, message: '请输入插件相关信息', trigger: 'blur'},
                        {validator:this.validateSpace,trigger:'blur'}
                    ]
                },
                formLabelWidth: '120px',

                showDialog:false,
                radiotoRout:'文件上传',
                fileList:[],
                fullscreenLoading:false,
                listData:[],
                detailData:[],
                loading:false,
                isShowDetail:false
            }
        },
        created: function(){
            this.getData({});
        },
        methods: {
            getData: function(params){
                var self = this;
                self.listData = [];
                self.loading = true;
                self.$axios.post(global_.baseUrl+'/pkg/list',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == '1001'){
                        self.$message({message:res.data.extra,type:'warning'});
                        setTimeout(function(){
                            self.$router.replace('login');
                        },2000)
                    }
                    if(res.data.ret_code == 0){
                        var result = [];
                        if(!params.hasOwnProperty('current_page')){
                            self.pageTotal = res.data.extra.length;
                            result = res.data.extra.slice(0,10);
                        }else{
                            result = res.data.extra;
                        }
                        for(var i in result){
                            self.listData.push({pkg_str_name:result[i]._id.pkg_str_name,pkg_version:result[i]._id.pkg_version});
                        }
                    }else{
                        self.$message.error(res.data.extra)
                    }
                })
            },
            handlePreview:function(file) {
                console.log(file);
            },
            beforeUpload: function(file){
                return true;
            },
            handleSuccess: function(response,file,fileList){
                // console.log(response);
                this.fullscreenLoading  = false;
                this.dialogFormVisible = false;
                this.fileList = [];
                this.form.pkg_name = '';
                this.form.pkg_str_name = '';
                this.form.pkg_version = '';
                this.form.pkg_info = '';
                this.form.pkg_developer = '';
                if(response.ret_code == 0){
                    this.$message({message:'创建成功',type:'success'});
                    this.getData({});
                }else{
                    this.$message.error(response.extra);
                }

            },
            handleError: function(response,file,fileList){
                this.$message('操作失败');
                this.fullscreenLoading  = false;
            },
            handleChange:function(file, fileList) {
                var self = this;
                self.form.pkg_name = file.name;
                //解析文件名称
                var strName = file.name;
                var arrName = strName.split('_');
                if(strName.indexOf('_')>0 && arrName.length >= 3){
                    if(/[0-9]/.test(arrName[1])){//通用插件名称如：base-files_157-r47727_ramips_24kec.ipk
                        self.form.pkg_str_name = arrName[0];
                        self.form.pkg_version = arrName[1]
                    }else if(/[0-9]/.test(arrName[2])){
                        self.form.pkg_str_name = arrName[0] + '_' + arrName[1];
                        self.form.pkg_version = arrName[2]
                    }else{
                        self.$message({message:'文件名称不符合标准',type:'warning'});
                        return false
                    }

                }else{
                    self.$message({message:'文件名称不符合标准',type:'warning'});
                    return false
                }
            },
            validateSpace: function (rule, value, callback) {
                var self = this;
                if(value.indexOf(' ')>=0){
                    callback(new Error('输入有空格'));
                }else{
                    callback();
                }
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
            downloadPlugin: function(fileName){//下载
                var self = this;
                var params = {
                    pkg_name:fileName
                };
                self.loading = true;
                self.$axios.post(global_.baseUrl+'/pkg/download',params).then(function(res){
                    self.loading = false;
                    console.log(res);
                    var blob = new Blob([res.data]);
                    var reader = new FileReader();
                    reader.readAsDataURL(blob);  // 转换为base64，可以直接放入a表情href
                    reader.onload = function (e) {
                        // 转换完成，创建一个a标签用于下载
                        var a = document.createElement('a');
                        a.download = fileName;
                        a.href = e.target.result;
                        document.body.appendChild(a);  // 修复firefox中无法触发click
                        a.click();
                        document.body.removeChild(a);
                    }

                    if(res.data.ret_code == '1001'){
                        self.$message({message:res.data.extra,type:'warning'});
                        setTimeout(function(){
                            self.$router.replace('login');
                        },2000)
                    }
                    if(res.data.ret_code == 0){
                        self.$message({message:'下载成功',type:'success'});
                        self.getData();
                    }else{
                        self.$message.error(res.data.extra)
                    }

                },function(err){
                    self.$message.error('下载失败');
                    self.loading = false;
                    console.log(err);
                })
            },
            delPlugin: function(fileName){//删除
                var self = this;
                var params = {
                    pkg_name:fileName
                };
                self.loading = true;
                self.$axios.post(global_.baseUrl+'/pkg/del',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == '1001'){
                        self.$message({message:res.data.extra,type:'warning'});
                        setTimeout(function(){
                            self.$router.replace('login');
                        },2000)
                    }
                    if(res.data.ret_code == 0){
                        self.$message({message:'删除成功',type:'success'});
                        self.isShowDetail = false;
                        self.getData({});
                    }else{
                        self.$message.error(res.data.extra)
                    }

                },function(err){
                    self.$message.error('删除失败');
                    self.loading = false;
                    // console.log(err);
                })
            },
            handleCurrentChange:function(val){
                this.currentPage = val;
                this.getData({page_size:10,current_page:this.currentPage});
            },
            detail: function(name,version){
                var self = this;
                var params = {
                    pkg_str_name:name,
                    pkg_version:version
                }
                self.loading = true;
                self.$axios.post(global_.baseUrl+'/pkg/detail',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == '1001'){
                        self.$message({message:res.data.extra,type:'warning'});
                        setTimeout(function(){
                            self.$router.replace('login');
                        },2000)
                    }
                    if(res.data.ret_code == 0){
                        self.isShowDetail = true;
                        self.detailData = res.data.extra;
                    }else{
                        self.$message.error(res.data.extra)
                    }
                })
            }
        }
    }
</script>

<style scoped>
    .handle-box{margin-bottom: 20px;}
    .handle-select{width: 120px;}
    .handle-input{width: 300px;display: inline-block;}
    .rad-group{margin-bottom:20px;}
    .diainp{width:217px;}
    .diainp2{width:400px;}
    .upload-demo{}
    .detailTable{margin-top:20px;}
    .detailTable h4{padding-bottom:10px;color:#333;}
</style>
