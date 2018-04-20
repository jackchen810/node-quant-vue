<template>
    <div class="table" v-loading="loading2">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-menu"></i> 用户管理</el-breadcrumb-item>
                <el-breadcrumb-item>用户列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-form :inline="true" class="handle-box">
            <el-form-item label="">
                <el-input v-model="search_word" placeholder="请输入账号查找" class="handle-input mr10"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="search" :disabled="user_type=='0'?false:true" @click="search">查询</el-button>
            </el-form-item>
        </el-form>
        <div class='rad-group' v-if="user_type =='0'?true:false">
            <el-radio-group v-model="radio3" @change="changeTab">
                <el-radio-button label="all">全部</el-radio-button>
                <el-radio-button label="0">未冻结</el-radio-button>
                <el-radio-button label="1">已冻结</el-radio-button>
            </el-radio-group>
        </div>
        <el-table :data="userData" border style="width: 100%" ref="multipleTable" :empty-text="emptyMsg" v-loading="loading">
            <el-table-column prop="user_account" label="用户名称" width="150"></el-table-column>
            <el-table-column prop="user_password" label="密码" width="150"></el-table-column>
            <el-table-column prop="user_password_md5" label="密码MD5" width="150"></el-table-column>
            <el-table-column prop="user_phone" label="联系电话" width="130"></el-table-column>
            <el-table-column prop="user_email" label="邮箱"></el-table-column>
            <el-table-column prop="user_status" label="冻结状态" width="120">
                <template slot-scope="scope">
                    <el-tag :type="scope.row.user_status == '1' ? 'warning' : 'success'" close-transition>{{scope.row.user_status=='1'?'已冻结':'未冻结'}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="用户类型" width="140">
                <template slot-scope="scope">
                    <el-tag :type="scope.row.user_type == '0' ? 'danger' : 'info'" close-transition>{{scope.row.user_type == '0'?'管理员':'用户'}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="user_create_time" label="创建时间" width="150"></el-table-column>
            <el-table-column label="操作" width="380">
                <template slot-scope="scope">
                    <!--<el-button class="btn1" size="small" type="text" @click="resetPwd(scope.row.user_account)">修改密码</el-button>-->
                    <el-button class="btn1" size="small" v-if="scope.row.user_status =='0' && scope.row.user_type =='1'" @click="revoke(scope.row.user_account)" :type="scope.row.user_status == '1' ? 'warning' : 'danger'">冻结账户</el-button>
                    <el-button class="btn1" size="small" v-else-if="scope.row.user_status =='1' && scope.row.user_type =='1'" @click="restore(scope.row.user_account)" :type="scope.row.user_status == '1' ? 'warning' : 'danger'">解冻账户</el-button>
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
    </div>
</template>

<script>
    import global_ from 'components/common/Global';
    var crypto = require('crypto');
    export default {
        data: function() {
            return {
                radio3:'all',
                user_type:1,  //0:管理员, 1:用户
                loading2:false,
                dialogFormVisible: false,
                form: {
                    user:'',
                    password:'',
                    name: '',
                    tel:'',
                    selectProv: '',
                    selectCity: '',
                    addr:'',
                    region: '',
                    date1: '',
                    date2: '',
                    delivery: false,
                    type: [],
                    resource: '',
                    desc: ''
                },
                rules: {
                    user:[
                        {required: true, message: '请输入账号', trigger: 'blur'},
                        {validator:this.validateSpace,trigger:'blur'}
                    ],
                    password:[
                        {required: true, message: '请输入密码', trigger: 'blur'},
                        {validator:this.validateSpace,trigger:'blur'},
                        {min:3,max:32,message:'长度在3到32个字符',trigger:'blur'},
                        {validator:this.validatePwd,trigger:'blur'}
                    ],
                    name:[
                        {required: true, message: '请输入渠道名称', trigger: 'blur'},
                        {validator:this.validateSpace,trigger:'blur'},
                        {validator:this.validateSpace,trigger:'blur'}
                    ],
                    tel:[
                        {required: true, message: '请输入联系电话', trigger: 'blur'},
                        {validator:this.validateTel,trigger:'blur'}
                    ]
                },
                formLabelWidth: '120px',
                provs:global_.provs,
                showRouterDialog:false,
                search_word:'',

                userData:[],
                loading:false,
                emptyMsg:'暂无数据',
                formP:{
                    user_account:localStorage.getItem('ms_username'),
                    user_password:'',
                    user_new_password:'',
                    user_validate_password:''
                },
                rulesP: {
                    user_password:[
                        {required: true, message: '请输入密码', trigger: 'blur'}
                    ],
                    user_new_password:[
                        {required: true, message: '请输入新密码', trigger: 'blur'}
                    ],
                    user_validate_password:[
                        {required: true, message: '请输入确认密码', trigger: 'blur'},
                        {validator:this.validateRepwd,trigger:'blur'}
                    ]
                },
                showDialogPwd: false,
                curAccount:'',
                curAccount2:'',
                fullscreenLoading: false,

                pageTotal:1,
                currentPage:1,
                page_size:10
            }
        },
        created: function(){
            this.getUsers(1, this.page_size);
            this.user_type = localStorage.getItem('user_type');  //管理员或用户
            //console.log('this.user_type', this.user_type);
            //console.log('this.user_account', localStorage.getItem('user_account'));
            //console.log('cookie', this.$cookie.get('user_type'));
        },
        methods: {
            getUsers: function(current_page, page_size, filter){//获取渠道列表
                var self = this;
                var params = {
                    filter: filter,
                    page_size: page_size,
                    current_page: current_page,
                };
                self.loading = true;
                self.$axios.post('/api/admin/list', params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.userData = res.data.extra.slice(0, self.page_size);
                        self.pageTotal = res.data.total;
                    }
                    else{
                        self.userData = [];
                    }
                })
            },
            changeTab: function(){
                var self = this;
                if(self.radio3 == 'all'){
                    self.getUsers(1, self.page_size);
                }else{
                    self.getUsers(1, self.page_size, {user_status:self.radio3});
                }
            },
            revoke: function(account){//冻结操作
                var self = this;
                var params = {
                    user_account:account
                };
                self.loading = true;
                self.$axios.post('/api/admin/revoke',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.getUsers(1, self.page_size);
                    }
                },function(err){
                    self.$message.error('操作失败');
                    self.loading = false;
                    console.log(err);
                })

            },
            restore: function(account){//解冻操作
                var self = this;
                var params = {
                    user_account:account
                };
                self.loading = true;
                self.$axios.post('/api/admin/restore',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.getUsers(1, self.page_size);
                    }
                },function(err){
                    self.$message.error('操作失败');
                    self.loading = false;
                    console.log(err);
                })

            },
            search: function(){
                var self = this;
                if(self.search_word == ''){
                    self.$message({message:'输入不能为空',type:'warning'});
                    return false;
                }
                self.loading = true;
                var params = {
                    user_account:self.search_word
                };
                self.$axios.post('/api/admin/list',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == 0){
                        self.userData = res.data.extra.slice(0, self.page_size);
                        self.pageTotal = res.data.total;
                    }else{
                        self.userData = [];
                    }
                })

            },
            validateRepwd: function(rule,value,callback){
                if(value !== this.formP.user_new_password){
                    callback(new Error('两次输入密码不一致'));
                }else{
                    callback();
                }
            },
            validateUser: function(rule,value,callback){
                if(value === ''){
                    callback(new Error('请输入账号'))
                }else{
                    callback();
                }
            },
            validatePwd: function(rule,value,callback){
                if(value === ''){
                    callback(new Error('请输入密码'))
                }else{
                    callback();
                }
            },
            validateTel:function(rule,value,callback){
                var regTel3 = /(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/.test(value);
                if(!regTel3){
                    callback(new Error('电话号码输入有误！'))
                }else{
                    callback();
                }
            },
            validateMac: function (rule, value, callback) {
                var self = this;
                var reg_name = /^[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}$/;
                var reg_name2 = /^[A-Fa-f\d]{2}[A-Fa-f\d]{2}[A-Fa-f\d]{2}[A-Fa-f\d]{2}[A-Fa-f\d]{2}[A-Fa-f\d]{2}$/;
                var macarr = self.splitStr(value);
                for (var i = 0, len = macarr.length; i < len; i++) {
                    if (!reg_name.test(macarr[i]) && !reg_name2.test(macarr[i])) {
                        callback(new Error('输入有误，以逗号或回车分隔'));
                    } else {
                        callback();
                    }
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
            //按逗号和回车分隔字符串
            splitStr: function (str) {
                var temp = str.split(/[\n,]/g);
                for (var i = 0; i < temp.length; i++) {
                    if (temp[i] == "") {
                        temp.splice(i, 1);
                        //删除数组索引位置应保持不变
                        i--;
                    }
                }
                return temp;
            },
            handleCurrentChange:function(val){
                this.currentPage = val;
                this.getUsers(this.currentPage, this.page_size);
            },
        }
    }
</script>

<style scoped>
    .handle-box{  margin-bottom: 20px;  }
    .handle-select{  width: 120px;  }
    .handle-input{  width: 300px;  display: inline-block;  }
    .rad-group{margin-bottom:20px;}
    .btn1{margin-bottom:5px;margin-top:5px;/*margin-left:0;*/}
    /*.digcont{width:600px;}*/
    .diainp{width:217px;}
    .diainp2{width:400px;}
    .upload-demo{}
    .mb30{margin-bottom:30px;}
    .mt30{margin-top:30px;}
</style>
