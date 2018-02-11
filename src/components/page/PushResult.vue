<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-upload"></i> 批量执行任务</el-breadcrumb-item>
                <el-breadcrumb-item>推送结果</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class='rad-group'>
            <el-radio-group v-model="curRadio" @change="changeTab">
                <el-radio-button label="firmware">ROM升级</el-radio-button>
                <el-radio-button label="apps">插件升级</el-radio-button>
                <el-radio-button label="script">脚本推送</el-radio-button>
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
            <el-table-column prop="request_msg" label="操作" width="120">
                <template slot-scope="scope">
                    <!--<el-tag>{{JSON.parse(scope.row.request_msg).item == 'sysinfo'?'ROM升级':'其他'}}</el-tag>-->
                    <el-tag type="primary">{{curRadio == 'firmware'?'ROM升级':(curRadio == 'apps'?'插件升级':'脚本升级')}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="request_timestamp" sortable label="时间" width="170"></el-table-column>
            <el-table-column prop="_id" label="任务ID" width="320"></el-table-column>
            <el-table-column prop="mac" label="指定MAC" width="160">
                <template slot-scope="scope">{{scope.row.mac.length>1?scope.row.mac[0] + ' ···':scope.row.mac.toString()}}</template>
            </el-table-column>
            <el-table-column prop="upgrade_mode" label="升级方式" width="100">
                <template slot-scope="scope">
                    <el-tag :type="scope.row.upgrade_mode == '1' ? 'warning' : 'success'" close-transition>{{scope.row.upgrade_mode == '1'?'实时自动':(scope.row.upgrade_mode == '2'?'用户自动':'定时自动')}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="结果" width="150">
                <el-table-column prop="success_count" label="成功">
                    <template slot-scope="scope">
                        <el-tag type="success">{{scope.row.success_count}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="fail_count" label="失败">
                    <template slot-scope="scope">
                        <el-tag type="danger">{{scope.row.fail_count}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="running_count" label="执行中">
                    <template slot-scope="scope">
                        <el-tag type="warning">{{scope.row.running_count}}</el-tag>
                    </template>
                </el-table-column>
            </el-table-column>
            <el-table-column prop="operator_name" label="操作人" width="120"></el-table-column>
            <el-table-column label="详情">
                <template slot-scope="scope">
                    <el-button class="btn1" type="info" size="small" @click="goDetail(scope.row._id)">详情</el-button>
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
                curRadio:'firmware',
                search_word:'',
                listData:[],
                pageTotal:0,
                currentPage:1,
                loading:true

            }
        },
        created:function(){
            this.getFirmwareData({});
        },
        methods: {
            getFirmwareData: function(params){
                var self = this;
                self.$axios.post(global_.baseUrl+'/task/list/sysupgrade',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == '1001'){
                        self.$message({message:res.data.extra,type:'warning'});
                        setTimeout(function(){
                            self.$router.replace('login');
                        },2000)
                    }
                    if(res.data.ret_code == 0){
                        if(JSON.stringify(params) == '{}'){
                            self.pageTotal = res.data.extra.length;
                            self.listData = res.data.extra.slice(0,10);
                        }else{
                            self.listData = res.data.extra;
                        }
                    }
                },function(err){
                    self.loading = false;
                    console.log(err);
                });
            },
            getAppsData: function(params){
                var self = this;
                self.$axios.post(global_.baseUrl+'/manage/apps_result',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == '1001'){
                        self.$message({message:res.data.extra,type:'warning'});
                        setTimeout(function(){
                            self.$router.replace('login');
                        },2000)
                    }
                    if(res.data.ret_code == 0){
                        if(JSON.stringify(params) == '{}'){
                            self.pageTotal = res.data.extra.length;
                            self.listData = res.data.extra.slice(0,10);
                        }else{
                            self.listData = res.data.extra;
                        }
                    }else{
                        self.$message.error(res.data.extra)
                    }
                },function(err){
                    self.loading = false;
                    console.log(err);
                });
            },
            getScriptData: function(params){
                var self = this;
                self.$axios.post(global_.baseUrl+'/manage/script_result',params).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == '1001'){
                        self.$message({message:res.data.extra,type:'warning'});
                        setTimeout(function(){
                            self.$router.replace('login');
                        },2000)
                    }
                    if(res.data.ret_code == 0){
                        if(JSON.stringify(params) == '{}'){
                            self.pageTotal = res.data.extra.length;
                            self.listData = res.data.extra.slice(0,10);
                        }else{
                            self.listData = res.data.extra;
                        }
                    }else{
                        self.$message.error(res.data.extra)
                    }
                },function(err){
                    self.loading = false;
                    console.log(err);
                });
            },
            changeTab: function(){
                var self = this;
                if(self.curRadio == 'firmware'){
                    self.getFirmwareData({});
                }
                if(self.curRadio == 'apps'){
                    self.getAppsData({});
                }
                if(self.curRadio == 'script'){
                    self.getScriptData({});
                }
            },
            handleCurrentChange:function(val){
                var self = this;
                self.currentPage = val;
                var params = {
                    page_size:10,current_page:this.currentPage
                };
                if(self.curRadio == 'firmware'){
                    self.getFirmwareData(params);
                }
                if(self.curRadio == 'apps'){
                    self.getAppsData(params);
                }
                if(self.curRadio == 'script'){
                    self.getScriptData(params);
                }

            },
            search: function(){
                var self = this;
                if(self.search_word == ''){
                    self.$message({message:'输入不能为空',type:'warning'});
                    return false;
                }
                self.loading = true;
                var mac = self.search_word;
                var str = (mac.indexOf(':')>=0?mac.replace(/:/g,''):mac).toUpperCase();
                var params = {
                    filter:{"mac":str}
                };
                var urlStr = self.curRadio=='firmware'?'/task/list/sysupgrade':(self.curRadio=='apps'?'/manage/apps_query':'/manage/script_detail_detail');
                self.$axios.post(global_.baseUrl + urlStr,params).then(function(res){
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
            goDetail: function(id){
                this.$router.push({path:'/pushresultdetail',query:{curid:id,curRadio:this.curRadio}});
            }
        },
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
