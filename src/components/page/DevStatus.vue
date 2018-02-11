<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-setting"></i> 设备管理</el-breadcrumb-item>
                <el-breadcrumb-item>设备状态</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class='rad-group'>
            <el-radio-group v-model="radio3" @change="changeTab">
                <el-radio-button label="all">全部</el-radio-button>
                <el-radio-button label="online">在线</el-radio-button>
                <el-radio-button label="offline">离线</el-radio-button>
            </el-radio-group>
            <el-form :inline="true" class="handle-box2">
                <el-form-item label="">
                    <el-input v-model="search_word" placeholder="请输入设备MAC"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="search">搜索</el-button>
                </el-form-item>
            </el-form>
        </div>

        <el-table :data="listData" border style="width: 100%" ref="multipleTable" v-loading="loading">
            <el-table-column prop="update_time" label="更新时间" width="180"></el-table-column>
            <el-table-column prop="status" label="状态" width="100":filters="[{ text: '在线', value: 'online' }, { text: '离线', value: 'offline' }]" :filter-method="filterTag">
                <template slot-scope="scope">
                    <el-tag :type="scope.row.status == 'offline' ? 'warning' : 'success'" close-transition>{{scope.row.status == 'online'?'在线':(scope.row.status == 'inactive'?'未激活':'离线')}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="mac" label="路由Mac" width="180"></el-table-column>
            <el-table-column prop="dev_type" label="设备型号" width="140"></el-table-column>
            <el-table-column prop="rom_verion" label="固件版本" width="140"></el-table-column>
            <el-table-column prop="user_name" label="账号"></el-table-column>
            <el-table-column label="操作" width="170">
                <template slot-scope="scope">
                    <el-button class="btn1" size="small" type="text" @click="reset(scope.row.mac)">重启路由</el-button>
                    <el-button class="btn1" v-if="curUser=='0'" size="small" type="danger" @click="del(scope.row.mac)">删除路由</el-button>
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
    export default {
        data: function(){
            const self = this;
            return {
                radio3:'all',
                search_word:'',
                loading:false,
                pageTotal:0,
                listData:[],
                currentPage:1,
                curUser:''

            }
        },
        created: function(){
            this.getUser();
        },
        methods: {
            getUser: function(){
                var self = this;
                self.$axios.post(global_.baseUrl+'/admin/info').then(function(res){
                    if(res.data.ret_code == '1001'){
                        self.$message({message:res.data.extra,type:'warning'});
                        setTimeout(function(){
                            self.$router.replace('login');
                        },2000)
                    }
                    if(res.data.ret_code == 0){
                        self.curUser = res.data.ret_msg;
                        if(self.curUser == '1'){//普通管理员
                            self.getData({filter:{user_name:localStorage.getItem('ms_username')}},'')
                        }else if(self.curUser == '0'){
                            self.getData({},'')
                        }
                    }
                })
            },
            getData: function(params,url){
                var self = this;
                if(self.curUser == '1'){
                    params.filter.user_name = localStorage.getItem('ms_username');
                }
                self.loading = true;
                self.$axios.post(global_.baseUrl+'/device/list'+url ,params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == '1001'){
                        self.$message({message:res.data.extra,type:'warning'});
                        setTimeout(function(){
                            self.$router.replace('login');
                        },2000)
                    }
                    if(res.data.ret_code == 0){
                        if(!params.hasOwnProperty('current_page')){
                            self.pageTotal = res.data.extra.length;
                            self.listData = res.data.extra.slice(0,10);
                        }else{
                            self.listData = res.data.extra;
                        }
                    }
                })
            },
            reset: function(mac){
                var self = this;
                var params = {
                    route_mac:mac
                };
                self.loading = true;
                self.$axios.post(global_.baseUrl+'/manage/reboot',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == '1001'){
                        self.$message({message:res.data.extra,type:'warning'});
                        setTimeout(function(){
                            self.$router.replace('login');
                        },2000)
                    }
                    if(res.data.ret_code == 0){
                        self.$message({message:'命令已下发',type:'success'})
                    }else{
                        self.$message.error(res.data.extra);
                    }
                })
            },
            del:function(mac){

            },
            changeTab: function(){
                var url = '';
                if(this.radio3 == 'all'){
                    url = '';
                }else{
                    url = '/'+this.radio3;
                }
                this.getData({},url);
            },
            handleCurrentChange:function(val){
                this.currentPage = val;
                var url = '';
                if(this.radio3 == 'all'){
                    url = '';
                }else{
                    url = '/'+this.radio3;
                }
                this.getData({page_size:10,current_page:this.currentPage},url);
            },
            search: function(){
                var self = this;
                var reg_name = /^[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}$/;
                var reg_name2 = /^[A-Fa-f\d]{2}[A-Fa-f\d]{2}[A-Fa-f\d]{2}[A-Fa-f\d]{2}[A-Fa-f\d]{2}[A-Fa-f\d]{2}$/;
                if(self.search_word == ''){
                    self.$message({message:'输入不能为空',type:'warning'});
                    return false;
                }
                if(!reg_name.test(self.search_word) && !reg_name2.test(self.search_word)){
                    self.$message({message:'设备MAC输入有误',type:'warning'});
                    return false;
                }
                self.loading = true;
                var mac = self.search_word;
                var str = (mac.indexOf(':')>=0?mac.replace(/:/g,''):mac).toUpperCase();
                var params = {
                    filter:{"mac":str}
                };
                self.$axios.post(global_.baseUrl+'/device/list',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == '1001'){
                        self.$message({message:res.data.extra,type:'warning'});
                        setTimeout(function(){
                            self.$router.replace('login');
                        },2000)
                    }
                    if(res.data.ret_code == 0){
                        self.pageTotal = res.data.extra.length;
                        self.listData = res.data.extra.slice(0,10);
                    }
                })

            },
            filterTag:function(value, row) {
                return row.status == value;
            }
        }
    }
</script>
<style>
    .rad-group{margin-bottom:20px;}
    .handle-input{  width: 300px;  display: inline-block;  }
    .handle-box2{display:inline-block;float:right;}
    .orange{color:#eb9e05;background:none;}
    .btn-search{position:absolute;}
</style>
