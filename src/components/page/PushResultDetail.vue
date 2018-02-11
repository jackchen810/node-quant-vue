<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-upload"></i> 批量执行任务</el-breadcrumb-item>
                <el-breadcrumb-item>执行结果</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div v-if="isShow=='firmware'?true:false">
            <h4>基本信息</h4>
            <el-table :data="firmwareData1" border style="width: 100%;margin:20px 0 40px;" ref="multipleTable">
                <el-table-column prop="additions.dest_version" label="下发版本"></el-table-column>
                <el-table-column prop="" label="设备型号"></el-table-column>
                <el-table-column prop="" label="升级方式">
                    <template slot-scope="scope">{{scope.row.additions.upgrade_mode == '1'?'实时自动': (scope.row.additions.upgrade_mode == '2'?'用户自动':'定时自动')}}</template>
                </el-table-column>
                <el-table-column prop="" label="配置更新">
                    <template slot-scope="scope">{{JSON.parse(scope.row.request_msg).reflash == '0'?'保留用户配置': '更改用户配置'}}</template>
                </el-table-column>
                <el-table-column prop="operator_name" label="执行人"></el-table-column>
            </el-table>
            <hr style="margin-bottom:40px;height:1px;border:none;border-top:1px solid #ddd;">
            <el-table :data="firmwareData" border style="width: 100%" ref="multipleTable">
                <el-table-column prop="response_timestamp" label="完成时间" width="180"></el-table-column>
                <el-table-column prop="mac" label="路由MAC" width="180"></el-table-column>
                <el-table-column prop="" label="之前版本" width="180"></el-table-column>
                <el-table-column prop="additions.dest_version" label="更新后版本" width="180"></el-table-column>
                <el-table-column prop="additions.upgrade_status" label="升级状态" width="100">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.pubsub_status == 'sysupgrade_ok' ? 'success' : 'danger'" close-transition>{{scope.row.pubsub_status == 'sysupgrade_ok'?'成功': (scope.row.pubsub_status == 'sysupgrade_fail'?'失败':'未知')}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button class="btn1" type="info" size="small" @click="handleEdit(scope.row.mac)">详情</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div v-if="isShow=='apps'?true:false">
            <h4>基本信息</h4>
            <el-table :data="appsData1" border style="width: 100%;margin:20px 0 40px;" ref="multipleTable">
                <el-table-column prop="additions.apps_name" label="插件名称"></el-table-column>
                <el-table-column prop="additions.apps_version" label="插件版本"></el-table-column>
                <el-table-column prop="additions.operator" label="执行人"></el-table-column>
            </el-table>
            <hr style="margin-bottom:40px;height:1px;border:none;border-top:1px solid #ddd;">
            <el-table :data="appsData" border style="width: 100%" ref="multipleTable">
                <el-table-column prop="response_timestamp" label="安装时间"></el-table-column>
                <el-table-column prop="mac" label="路由MAC"></el-table-column>
                <el-table-column prop="pubsub_status" label="设备状态">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.pubsub_status == 'response_ok' ? 'success' : 'warning'" close-transition>{{scope.row.pubsub_status == 'response_ok'?'在线': (scope.row.sbzt == 'offline'?'离线':'未知')}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="sjzt" label="升级状态">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.pubsub_status == 'response_ok' ? 'success' : 'warning'" close-transition>{{scope.row.pubsub_status == 'response_ok'?'在线': (scope.row.sbzt == 'offline'?'离线':'未知')}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button class="btn1" type="info" size="small" @click="handleEdit(scope.row.mac)">详情</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div v-if="isShow=='script'?true:false">
            <h4>基本信息</h4>
            <el-table :data="scriptData1" border style="width: 100%;margin:20px 0 40px;" ref="multipleTable">
                <el-table-column prop="" label="升级方式">
                    <template slot-scope="scope">{{scope.row.cmd_item == 'remote_cmd'?'脚本升级': '其他'}}</template>
                </el-table-column>
                <el-table-column prop="operator_name" label="执行人"></el-table-column>
            </el-table>
            <hr style="margin-bottom:40px;height:1px;border:none;border-top:1px solid #ddd;">
            <el-table :data="scriptData" border style="width: 100%" ref="multipleTable">
                <el-table-column prop="response_timestamp" label="完成时间" width="180"></el-table-column>
                <el-table-column prop="mac" label="路由MAC" width="180"></el-table-column>
                <el-table-column prop="task_status" label="升级状态" width="100">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.task_status == 'normal' ? 'success' : 'danger'" close-transition>{{scope.row.task_status == 'normal'?'正常': '未知'}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button class="btn1" type="info" size="small" @click="handleEdit(scope.row.mac)">详情</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

    </div>
</template>

<script>
    import global_ from 'components/common/Global';
    export default {
        data: function(){
            const self = this;
            return {
                curId:'',
                curRadio:'',
                loading:false,
                radio3:'ROM升级',
                appsData:[],
                firmwareData:[],
                scriptData:[],
                appsData1:[],
                firmwareData1:[],
                scriptData1:[],
                isShow:'apps',

            }
        },
        created: function(){
            this.getParams();
        },
        methods: {
            getParams: function(){
                var self = this;
                self.curId = self.$route.query.curid;
                self.curRadio = self.$route.query.curRadio;
                if(self.curRadio == 'apps'){//插件升级
                    self.isShow = 'apps';
                    self.getAppsDetailData();
                }
                if(self.curRadio == 'firmware'){//rom升级
                    self.isShow = 'firmware';
                    self.getFirmwareData();
                }
                if(self.curRadio == 'script'){//脚本升级
                    self.isShow = 'script';
                    self.getScriptDetailData();
                }
            },
            getFirmwareData: function(){
                var self = this;
                self.$axios.post(global_.baseUrl+'/task/list/detail',{uuid:self.curId}).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == '1001'){
                        self.$message({message:res.data.extra,type:'warning'});
                        setTimeout(function(){
                            self.$router.replace('login');
                        },2000)
                    }
                    if(res.data.ret_code == 0){
                        self.firmwareData = res.data.extra;
                        self.firmwareData1 = res.data.extra.slice(0,1);
                    }else{
                        self.$message.error(res.data.extra)
                    }
                },function(err){
                    self.loading = false;
                    console.log(err);
                });
            },
            getAppsDetailData: function(){
                var self = this;
                self.$axios.post(global_.baseUrl+'/manage/apps_detail',{uuid:self.curId}).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == '1001'){
                        self.$message({message:res.data.extra,type:'warning'});
                        setTimeout(function(){
                            self.$router.replace('login');
                        },2000)
                    }
                    if(res.data.ret_code == 0){
                        self.appsData = res.data.extra;
                        self.appsData1 = res.data.extra.slice(0,1);
                    }else{
                        self.$message.error(res.data.extra)
                    }
                },function(err){
                    self.loading = false;
                    console.log(err);
                });
            },
            getScriptDetailData: function(){
                var self = this;
                self.$axios.post(global_.baseUrl+'/manage/script_detail',{uuid:self.curId}).then(function(res){
                    self.loading = false;
                    if(res.data.ret_code == '1001'){
                        self.$message({message:res.data.extra,type:'warning'});
                        setTimeout(function(){
                            self.$router.replace('login');
                        },2000)
                    }
                    if(res.data.ret_code == 0){
                        self.scriptData = res.data.extra;
                        self.scriptData1 = res.data.extra.slice(0,1);
                    }else{
                        self.$message.error(res.data.extra)
                    }
                },function(err){
                    self.loading = false;
                    console.log(err);
                });
            },
            handleEdit: function(mac){
                this.$router.push({path:'/updateromstatus',query:{curid:this.curId,curmac:mac,curRadio:this.curRadio}});
            },
            handleCurrentChange:function(val){
//                this.cur_page = val;
//                this.getData();
            },
            changePage:function(values) {
                this.information.pagination.per_page = values.perpage;
                this.information.data = this.information.data;
            },
            onSearch:function(searchQuery) {
                this.query = searchQuery;
            }
        },
    }
</script>
<style>
    .rad-group{margin-bottom:20px;}
    .handle-input{  width: 300px;  display: inline-block;  }
    .handle-box2{display:inline-block;float:right;}
</style>
